<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Roller oluştur
        $roles = ['super_admin', 'admin', 'moderator', 'seller', 'customer'];
        foreach ($roles as $role) {
            \Spatie\Permission\Models\Role::firstOrCreate(['name' => $role]);
        }

        // Super Admin
        $admin = User::factory()->create([
            'name' => 'MSO Admin',
            'email' => 'admin@msocommerce.com',
            'password' => bcrypt('Admin@12345'),
        ]);
        $admin->assignRole('super_admin');

        // Demo Satıcı Kullanıcı
        $sellerUser = User::factory()->create([
            'name' => 'TechStore Demo',
            'email' => 'seller@msocommerce.com',
            'password' => bcrypt('Seller@12345'),
        ]);
        $sellerUser->assignRole('seller');

        // Seller kaydı
        $seller = \App\Models\Seller::create([
            'user_id' => $sellerUser->id,
            'uuid' => \Illuminate\Support\Str::uuid(),
            'company_name' => 'TechStore Pro Ltd.',
            'tax_number' => '1234567890',
            'tax_office' => 'Kadıköy',
            'company_type' => 'limited',
            'phone' => '05551234567',
            'email' => 'seller@msocommerce.com',
            'status' => 'approved',
            'package' => 'professional',
            'approved_at' => now(),
            'balance' => 12400.00,
        ]);

        // Store
        $store = \App\Models\Store::create([
            'seller_id' => $seller->id,
            'uuid' => \Illuminate\Support\Str::uuid(),
            'name' => 'TechStore Pro',
            'slug' => 'techstore-pro',
            'description' => 'Türkiye\'nin lider teknoloji mağazası. En son ürünler, en iyi fiyatlar.',
            'theme_color' => '#0066FF',
            'is_active' => true,
            'is_featured' => true,
            'rating' => 4.8,
        ]);

        // Kategoriler
        $electronics = \App\Models\Category::create([
            'name' => 'Elektronik', 'slug' => 'elektronik',
            'is_active' => true, 'sort_order' => 1, 'level' => 0,
        ]);
        $phones = \App\Models\Category::create([
            'name' => 'Telefon Aksesuar', 'slug' => 'telefon-aksesuar',
            'parent_id' => $electronics->id, 'is_active' => true, 'level' => 1,
        ]);
        $chargers = \App\Models\Category::create([
            'name' => 'Şarj Cihazları', 'slug' => 'sarj-cihazlari',
            'parent_id' => $electronics->id, 'is_active' => true, 'level' => 1,
        ]);

        // Marka
        $apple = \App\Models\Brand::create(['name' => 'Apple', 'slug' => 'apple', 'is_active' => true]);
        $samsung = \App\Models\Brand::create(['name' => 'Samsung', 'slug' => 'samsung', 'is_active' => true]);

        // Ürünler
        \App\Models\Product::create([
            'seller_id' => $seller->id,
            'store_id' => $store->id,
            'category_id' => $phones->id,
            'brand_id' => $apple->id,
            'uuid' => \Illuminate\Support\Str::uuid(),
            'name' => 'iPhone 15 Pro Silikon Kılıf - Siyah',
            'slug' => 'iphone-15-pro-silikon-kilif-siyah',
            'sku' => 'APKL-IP15-BLK',
            'description' => 'iPhone 15 Pro için özel tasarlanmış premium silikon kılıf. Cihazınızı darbelerden ve çiziklerden korur.',
            'short_description' => 'iPhone 15 Pro için premium silikon koruma kılıfı',
            'price' => 299.00,
            'sale_price' => 249.00,
            'cost_price' => 80.00,
            'stock' => 47,
            'status' => 'approved',
            'is_active' => true,
            'is_featured' => true,
            'rating' => 4.7,
            'review_count' => 234,
            'ai_score' => 92,
            'seo_title' => 'iPhone 15 Pro Silikon Kılıf Siyah | Orjinal Kalite',
            'seo_description' => 'iPhone 15 Pro için premium silikon kılıf. Darbeye dayanıklı, MagSafe uyumlu. Hızlı kargo!',
        ]);

        \App\Models\Product::create([
            'seller_id' => $seller->id,
            'store_id' => $store->id,
            'category_id' => $chargers->id,
            'brand_id' => $samsung->id,
            'uuid' => \Illuminate\Support\Str::uuid(),
            'name' => 'Samsung 65W Hızlı Şarj Cihazı - Orijinal',
            'slug' => 'samsung-65w-hizli-sarj-cihazi',
            'sku' => 'SSCHR-65W-ORJ',
            'description' => 'Samsung orijinal 65W hızlı şarj adaptörü. Galaxy S serisi ve diğer USB-C cihazlarla uyumlu.',
            'short_description' => 'Samsung 65W hızlı şarj adaptörü, USB-C uyumlu',
            'price' => 489.00,
            'sale_price' => 389.00,
            'cost_price' => 180.00,
            'stock' => 23,
            'status' => 'approved',
            'is_active' => true,
            'rating' => 4.5,
            'review_count' => 89,
            'ai_score' => 78,
        ]);

        // Demo Müşteri
        $customer = User::factory()->create([
            'name' => 'Mehmet Yılmaz',
            'email' => 'musteri@msocommerce.com',
            'password' => bcrypt('Musteri@12345'),
        ]);
        $customer->assignRole('customer');

        $this->command->info('✅ Demo veriler oluşturuldu!');
        $this->command->info('Admin: admin@msocommerce.com / Admin@12345');
        $this->command->info('Satıcı: seller@msocommerce.com / Seller@12345');
        $this->command->info('Müşteri: musteri@msocommerce.com / Musteri@12345');
    }
}
