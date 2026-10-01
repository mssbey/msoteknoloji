<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Str;

class StorefrontCatalog
{
    public const GROUPS = [
        'balikcilik' => ['Balıkçılık', 'Kamış, makine, yapay yem ve olta ekipmanları'],
        'kamp-outdoor' => ['Kamp & Outdoor', 'Doğada ihtiyaç duyacağınız pratik ekipmanlar'],
        'fener-aydinlatma' => ['Fener & Aydınlatma', 'LED ve UV fenerler, pil ve şarj çözümleri'],
        'bahce-el-aletleri' => ['Bahçe & El Aletleri', 'Bahçeniz ve küçük işleriniz için yardımcılar'],
        'ev-mutfak' => ['Ev & Mutfak', 'Günlük hayatı kolaylaştıran kullanışlı ürünler'],
        'kisisel-bakim' => ['Kişisel Bakım', 'Bakım rutininizin küçük tamamlayıcıları'],
        'aksesuar' => ['Aksesuar & Diğer', 'Teknoloji, hobi ve günlük ihtiyaçlar'],
    ];

    public function items()
    {
        return Product::active()->with('category:id,name,slug')
            ->get(['id', 'name', 'category_id', 'og_image', 'sale_count']);
    }

    /**
     * Arama: DB'den bagimsiz (Postgres LIKE harf duyarli), Turkce harf duyarsiz,
     * her kelime ad/SKU/barkod/kategori/marka icinde gecmeli.
     */
    public function searchIds(string $query): array
    {
        $terms = array_filter(preg_split('/\s+/', $this->fold($query)));
        if (!$terms) return [];

        return Product::active()->with(['category:id,name', 'brand:id,name'])
            ->get(['id', 'name', 'sku', 'barcode', 'category_id', 'brand_id'])
            ->filter(function ($p) use ($terms) {
                $text = $this->fold("{$p->name} {$p->sku} {$p->barcode} {$p->category?->name} {$p->brand?->name}");
                foreach ($terms as $term) {
                    if (!str_contains($text, $term)) return false;
                }
                return true;
            })
            ->pluck('id')->all();
    }

    private function fold(string $text): string
    {
        return Str::lower(Str::ascii($text, 'tr'));
    }

    public function group(Product $product): string
    {
        $text = Str::lower(Str::ascii($product->name . ' ' . $product->category?->name, 'tr'));
        foreach ([
            'balikcilik' => ['balik', 'olta', 'misina', 'rapala', 'jigging', 'lure'],
            'fener-aydinlatma' => ['fener', 'pil', 'sarj edilebilir'],
            'bahce-el-aletleri' => ['bahce', 'hirdavat', 'sulama', 'budama', 'testere', 'yan keski'],
            'ev-mutfak' => ['mutfak', 'kasik', 'catal', 'midye', 'banyo', 'kek kalib'],
            'kisisel-bakim' => ['kisisel bakim', 'tirnak', 'manikur', 'kuafor', 'dezenfektan'],
            'kamp-outdoor' => ['outdoor', 'kamp', 'caki', 'karabina'],
        ] as $group => $words) {
            if (Str::contains($text, $words)) return $group;
        }
        return 'aksesuar';
    }

    public function summary(): array
    {
        $items = $this->items();
        $groups = collect(self::GROUPS)->map(function ($info, $slug) use ($items) {
            $products = $items->filter(fn ($p) => $this->group($p) === $slug);
            return [
                'slug' => $slug, 'name' => $info[0], 'description' => $info[1],
                'products_count' => $products->count(),
                'image' => $products->first(fn ($p) => filled($p->og_image))?->og_image,
                'categories' => $products->pluck('category')->filter()->unique('id')->values()
                    ->map(fn ($c) => ['slug' => $c->slug, 'name' => trim(collect(explode('>', $c->name))->last())])->all(),
            ];
        })->filter(fn ($g) => $g['products_count'] > 0)->values();
        return ['groups' => $groups, 'total' => $items->count(), 'has_sales' => $items->sum('sale_count') > 0];
    }
}
