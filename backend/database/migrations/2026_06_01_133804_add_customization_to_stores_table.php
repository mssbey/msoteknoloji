<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            // Vitrin bölümleri (sürükle-bırak JSON yapısı)
            $table->json('vitrin_sections')->nullable()->after('meta');
            // Renk paleti
            $table->string('accent_color', 7)->default('#F59E0B')->after('theme_color');
            $table->string('text_color', 7)->default('#FFFFFF')->after('accent_color');
            // Mağaza duyurusu (banner metin)
            $table->string('announcement_text')->nullable()->after('text_color');
            $table->string('announcement_bg', 7)->default('#0066FF')->after('announcement_text');
            $table->boolean('announcement_active')->default(false)->after('announcement_bg');
            // WhatsApp numarası (mağazaya özel)
            $table->string('whatsapp_number', 20)->nullable()->after('announcement_active');
            // Öne çıkan koleksiyon başlığı
            $table->string('featured_section_title')->default('Öne Çıkan Ürünler')->after('whatsapp_number');
            // Mağaza kupon etkinleştirme
            $table->boolean('welcome_coupon_active')->default(false)->after('featured_section_title');
            $table->tinyInteger('welcome_coupon_percent')->default(10)->after('welcome_coupon_active');
        });
    }

    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropColumn([
                'vitrin_sections', 'accent_color', 'text_color',
                'announcement_text', 'announcement_bg', 'announcement_active',
                'whatsapp_number', 'featured_section_title',
                'welcome_coupon_active', 'welcome_coupon_percent',
            ]);
        });
    }
};
