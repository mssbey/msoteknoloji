<?php

namespace Tests\Unit;

use App\Models\Category;
use App\Models\Product;
use App\Services\StorefrontCatalog;
use PHPUnit\Framework\TestCase;

class StorefrontCatalogTest extends TestCase
{
    public function test_imported_categories_and_generic_imports_are_classified_by_purpose(): void
    {
        $catalog = new StorefrontCatalog();
        $cases = [
            ['Profesyonel UV 365NM LED Fener', 'Sentos', 'fener-aydinlatma'],
            ['MSO Şemsiye Yapay Yem', 'Spor Outdoor > Balık Av Malzemeleri', 'balikcilik'],
            ['Misina sarma aparatı', 'Sentos', 'balikcilik'],
            ['Manikür Tırnak Makası', 'Sentos', 'kisisel-bakim'],
            ['MSO Akıllı Dikiş İğne Seti', 'Hobi > Dikiş Malzemeleri', 'aksesuar'],
            ['Paslanmaz Çelik Multifonksiyonel Pense', 'Spor Outdoor > Kamp Malzemeleri', 'kamp-outdoor'],
            ['VIP Sulama Başlığı', 'Yapı Market > Bahçe', 'bahce-el-aletleri'],
            ['Yapışmaz Hamburger Kağıdı', 'Beyaz Eşya / Mutfak > Mutfak Ekipmanları', 'ev-mutfak'],
        ];
        foreach ($cases as [$name, $category, $expected]) {
            $product = new Product(['name' => $name]);
            $product->setRelation('category', new Category(['name' => $category]));
            $this->assertSame($expected, $catalog->group($product), $name);
        }
    }
}
