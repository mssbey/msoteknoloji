<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Services\Integrations\Sentos\SentosClient;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SentosImport extends Command
{
    protected $signature = 'sentos:import
        {--base= : API URL (varsayilan config integrations.sentos.base_url)}
        {--key= : API Anahtar (varsayilan .env SENTOS_API_KEY)}
        {--secret= : API Sifre (varsayilan .env SENTOS_API_SECRET)}
        {--seller=1 : Urunlerin atanacagi satici (user) id}
        {--store=1 : Urunlerin atanacagi magaza id}
        {--size=100 : Sayfa basina urun}
        {--limit=0 : En fazla kac urun (0 = tumu)}
        {--images : Urun gorsellerini de iceri al}
        {--variants : Varyantlari da iceri al}
        {--test : Sadece baglantiyi test et}';

    protected $description = 'Sentos API uzerinden tum urunleri yerel veritabanina aktarir.';

    public function handle(): int
    {
        $base   = $this->option('base')   ?: config('integrations.sentos.base_url');
        $key    = $this->option('key')    ?: config('integrations.sentos.api_key');
        $secret = $this->option('secret') ?: config('integrations.sentos.api_secret');

        if (!$key || !$secret) {
            $this->error('API anahtar/sifre yok. .env icine SENTOS_API_KEY ve SENTOS_API_SECRET girin ya da --key --secret verin.');
            return self::FAILURE;
        }

        $client = SentosClient::make($key, $secret, $base);

        // -- Baglanti testi --------------------------------------------------
        $ping = $client->ping();
        if (!$ping['ok']) {
            $this->error("Sentos API baglantisi basarisiz -- HTTP {$ping['status']}");
            $this->line("Yanit: {$ping['body']}");
            if ($ping['status'] === 401) {
                $ip = @file_get_contents('https://api.ipify.org') ?: 'bilinmiyor';
                $this->warn('401 = kimlik reddi. Genellikle IP kisitlamasi ya da API erisimi kapali.');
                $this->warn("Sentos panelinde API ayarlari (disli) -> sunucu IP'nizi izin listesine ekleyin: {$ip}");
            }
            return self::FAILURE;
        }
        $this->info("Baglanti OK (HTTP {$ping['status']}).");
        if ($this->option('test')) {
            return self::SUCCESS;
        }

        $sellerId = (int) $this->option('seller');
        $storeId  = (int) $this->option('store');
        $size     = max(1, (int) $this->option('size'));
        $limit    = (int) $this->option('limit');

        // -- Kategori haritasi (remote id -> local id) -----------------------
        $this->line('Kategoriler aliniyor...');
        $catMap = $this->syncCategories($client->getCategories());
        $this->info(count($catMap) . ' kategori eslendi.');
        $fallbackCat = $this->fallbackCategoryId();

        // -- Urunler ---------------------------------------------------------
        $page = 1;
        $created = 0; $updated = 0; $imgCount = 0; $varCount = 0; $seen = 0;
        $errors = [];

        do {
            $this->line("Sayfa {$page} cekiliyor...");
            $products = $client->getProducts($page, $size);
            if (empty($products)) break;

            foreach ($products as $remote) {
                $seen++;
                try {
                    [$product, $wasCreated] = $this->upsertProduct(
                        $remote, $sellerId, $storeId, $catMap, $fallbackCat
                    );
                    $wasCreated ? $created++ : $updated++;

                    if ($this->option('images')) {
                        $imgCount += $this->syncImages($product, $remote['images'] ?? []);
                    }
                    if ($this->option('variants')) {
                        $varCount += $this->syncVariants($product, $remote['variants'] ?? []);
                    }
                } catch (\Throwable $e) {
                    $errors[] = ($remote['sku'] ?? $remote['id'] ?? '?') . ': ' . $e->getMessage();
                }

                if ($limit > 0 && $seen >= $limit) break 2;
            }

            $page++;
            usleep(400000); // rate-limit dostu
        } while (count($products) >= $size && $page < 1000);

        $this->newLine();
        $this->info("Bitti. Gorulen: {$seen} | Yeni: {$created} | Guncellenen: {$updated}"
            . ($this->option('images') ? " | Gorsel: {$imgCount}" : '')
            . ($this->option('variants') ? " | Varyant: {$varCount}" : ''));

        if ($errors) {
            $this->warn(count($errors) . ' hata:');
            foreach (array_slice($errors, 0, 10) as $e) {
                $this->line('  - ' . $e);
            }
        }

        return self::SUCCESS;
    }

    /** Sentos kategori agacini yerele upsert eder, remoteId->localId dondurur. */
    private function syncCategories(array $tree, ?int $parentLocalId = null, array &$map = []): array
    {
        foreach ($tree as $node) {
            $name = $node['name'] ?? null;
            $rid  = $node['id'] ?? null;
            if (!$name || !$rid) {
                continue;
            }

            $slug = Str::slug($name . '-' . $rid);
            $local = DB::table('categories')->where('slug', $slug)->first();
            if ($local) {
                $localId = $local->id;
            } else {
                $localId = DB::table('categories')->insertGetId([
                    'parent_id'  => $parentLocalId,
                    'name'       => $name,
                    'slug'       => $slug,
                    'is_active'  => true,
                    'level'      => $parentLocalId ? 1 : 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            $map[$rid] = $localId;

            if (!empty($node['sub_categories']) && is_array($node['sub_categories'])) {
                $this->syncCategories($node['sub_categories'], $localId, $map);
            }
        }
        return $map;
    }

    private function fallbackCategoryId(): int
    {
        $slug = 'sentos-genel';
        $row = DB::table('categories')->where('slug', $slug)->first();
        if ($row) {
            return $row->id;
        }
        return DB::table('categories')->insertGetId([
            'name' => 'Sentos', 'slug' => $slug, 'is_active' => true,
            'level' => 0, 'created_at' => now(), 'updated_at' => now(),
        ]);
    }

    /** @return array{0: Product, 1: bool} */
    private function upsertProduct(array $r, int $sellerId, int $storeId, array $catMap, int $fallbackCat): array
    {
        $sku = $r['sku'] ?? ($r['barcode'] ?? null);
        if (!$sku) {
            throw new \RuntimeException('SKU yok');
        }

        $name      = trim((string) ($r['name'] ?? $sku));
        $salePrice = $this->num($r['sale_price'] ?? null);
        $costPrice = $this->num($r['purchase_price'] ?? null);
        $stock     = $this->sumStock($r['stocks'] ?? []);
        $catId     = $catMap[$r['category_id'] ?? null] ?? $fallbackCat;
        $brandId   = $this->resolveBrand($r['brand'] ?? null);

        $existing = Product::where('seller_id', $sellerId)->where('sku', $sku)->first();
        $wasCreated = !$existing;

        $shortDesc = Str::limit(strip_tags((string) ($r['description'] ?? '')), 250, '');

        $data = [
            'seller_id'         => $sellerId,
            'store_id'          => $storeId,
            'category_id'       => $catId,
            'brand_id'          => $brandId,
            'name'              => $name,
            'barcode'           => $r['barcode'] ?? null,
            'description'       => $r['description_detail'] ?? ($r['description'] ?? null),
            'short_description' => $shortDesc !== '' ? $shortDesc : null,
            'price'             => $salePrice ?? 0,
            'cost_price'        => $costPrice,
            'currency'          => $r['currency'] ?? 'TL',
            'tax_rate'          => $this->num($r['vat_rate'] ?? null) ?? 0,
            'stock'             => $stock,
            'weight'            => $this->num($r['volumetric_weight'] ?? null),
            'sentos_id'         => $r['id'] ?? null,
            'last_synced_at'    => now(),
            'metadata'          => json_encode([
                'sentos' => array_intersect_key($r, array_flip(['shelf_number', 'prices', 'attributes', 'invoice_name', 'is_serial'])),
            ], JSON_UNESCAPED_UNICODE),
        ];

        if ($wasCreated) {
            $data['uuid']      = (string) Str::uuid();
            $data['sku']       = $sku;
            $data['slug']      = $this->uniqueSlug($name, $sku);
            $data['status']    = 'pending';
            $data['is_active'] = true;
            $product = Product::create($data);
        } else {
            $existing->update($data);
            $product = $existing;
        }

        return [$product, $wasCreated];
    }

    private function syncImages(Product $product, array $images): int
    {
        if (empty($images)) {
            return 0;
        }
        $count = 0;
        $primaryUrl = null;
        foreach (array_values($images) as $i => $img) {
            $url = is_array($img) ? ($img['url'] ?? null) : (is_string($img) ? $img : null);
            if (!$url) {
                continue;
            }
            if ($primaryUrl === null) {
                $primaryUrl = $url;
            }
            DB::table('product_images')->updateOrInsert(
                ['product_id' => $product->id, 'url' => $url],
                [
                    'path'       => $url,
                    'alt_text'   => $product->name,
                    'title'      => $product->name,
                    'position'   => $i,
                    'is_primary' => $i === 0,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
            $count++;
        }
        if ($primaryUrl && $product->og_image !== $primaryUrl) {
            $product->og_image = $primaryUrl;
            $product->save();
        }
        return $count;
    }

    private function syncVariants(Product $product, array $variants): int
    {
        if (empty($variants)) {
            return 0;
        }
        $count = 0;
        foreach (array_values($variants) as $i => $v) {
            $vsku = $v['sku'] ?? null;
            if (!$vsku) {
                continue;
            }
            DB::table('product_variants')->updateOrInsert(
                ['product_id' => $product->id, 'sku' => $vsku],
                [
                    'barcode'    => $v['barcode'] ?? null,
                    'price'      => $product->price ?? 0,
                    'sale_price' => $product->sale_price,
                    'cost_price' => $this->num($v['purchase_price'] ?? null),
                    'stock'      => $this->sumStock($v['stocks'] ?? []),
                    'attributes' => json_encode([
                        'model' => $v['model'] ?? null,
                        'color' => $v['color'] ?? null,
                    ], JSON_UNESCAPED_UNICODE),
                    'is_active'  => true,
                    'sort_order' => $i,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
            $count++;
        }
        return $count;
    }

    private function resolveBrand(?string $brand): ?int
    {
        $brand = trim((string) $brand);
        if ($brand === '') {
            return null;
        }
        $slug = Str::slug($brand);
        $row = DB::table('brands')->where('slug', $slug)->first();
        if ($row) {
            return $row->id;
        }
        return DB::table('brands')->insertGetId([
            'name' => $brand, 'slug' => $slug, 'is_active' => true,
            'created_at' => now(), 'updated_at' => now(),
        ]);
    }

    private function uniqueSlug(string $name, string $sku): string
    {
        $slug = Str::slug($name . '-' . $sku);
        if (!Product::where('slug', $slug)->exists()) {
            return $slug;
        }
        return $slug . '-' . Str::lower(Str::random(4));
    }

    /** "89,90" / "1.234,56" / "89.90" -> float */
    private function num($v): ?float
    {
        if ($v === null || $v === '') {
            return null;
        }
        if (is_numeric($v)) {
            return (float) $v;
        }
        $s = trim((string) $v);
        if (str_contains($s, ',') && str_contains($s, '.')) {
            $s = str_replace('.', '', $s);   // binlik ayiraci
            $s = str_replace(',', '.', $s);  // ondalik
        } elseif (str_contains($s, ',')) {
            $s = str_replace(',', '.', $s);
        }
        $s = preg_replace('/[^0-9.\-]/', '', $s);
        return is_numeric($s) ? (float) $s : null;
    }

    private function sumStock(array $stocks): int
    {
        $t = 0;
        foreach ($stocks as $s) {
            $t += (int) ($s['stock'] ?? 0);
        }
        return $t;
    }
}
