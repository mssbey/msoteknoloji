<?php

namespace App\Console\Commands;

use App\Services\ProductImageCache;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CacheProductImages extends Command
{
    protected $signature = 'products:cache-images';
    protected $description = 'Mevcut uzak ürün görsellerini kalıcı yerel depoya taşır';

    public function handle(ProductImageCache $cache): int
    {
        if (!\Illuminate\Support\Facades\Schema::hasTable('cached_product_images')) {
            $this->error('Önce görsel deposu migration işlemini çalıştırın.');
            return self::FAILURE;
        }
        $converted = 0;
        $errors = 0;
        foreach (['products' => ['og_image'], 'product_images' => ['url', 'path'], 'product_variants' => ['image']] as $table => $fields) {
            foreach (DB::table($table)->orderBy('id')->get($fields)->chunk(30) as $rows) {
                $cache->prefetch($rows->flatMap(fn ($row) => array_values((array) $row))->all());
            }
            foreach (DB::table($table)->orderBy('id')->cursor() as $row) {
                $updates = [];
                try {
                    if ($table === 'products' && $row->description) {
                        $html = $cache->localizeHtml($row->description);
                        if ($html !== $row->description) $updates['description'] = $html;
                    }
                    foreach ($fields as $field) {
                        $source = $row->$field;
                        if (!$source || !str_starts_with($source, 'https://') || str_contains($source, '/media/products/')) continue;
                        $updates[$field] = $cache->localize($source);
                    }
                    if ($updates) {
                        DB::table($table)->where('id', $row->id)->update($updates);
                        $converted++;
                        if ($converted % 25 === 0) $this->info("{$converted} kayıt yerelleştirildi.");
                    }
                } catch (\Throwable $e) {
                    $errors++;
                    $this->warn("{$table} #{$row->id}: " . $e->getMessage());
                }
            }
        }
        $this->info("Tamamlandı: {$converted} kayıt yerelleştirildi, {$errors} hata.");
        return $errors ? self::FAILURE : self::SUCCESS;
    }
}
