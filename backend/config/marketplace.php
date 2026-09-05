<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Mağaza Kayıt Modu
    |--------------------------------------------------------------------------
    | open         — herkese açık
    | invite_only  — sadece davet ile (varsayılan, ilk 5 mağaza için)
    | closed       — yeni kayıt kapalı
    */

    'registration' => [
        'mode' => env('MARKETPLACE_REGISTRATION_MODE', 'invite_only'),
        'invite_expiry_hours' => 48,
        'initial_stores' => ['MSO Teknoloji', 'GYZGO', 'EN Yeniler'],
        'max_initial_stores' => 5,
    ],

    /*
    |--------------------------------------------------------------------------
    | Komisyonsuz Abonelik Paketleri
    |--------------------------------------------------------------------------
    | Mağazalardan ürün başı komisyon alınmaz; sadece aylık/yıllık abonelik.
    */

    'packages' => [
        'starter' => [
            'label' => 'Starter',
            'product_limit' => 500,
            'monthly_price' => 299,
            'yearly_price' => 2990,      // 2 ay bedava
            'features' => ['Temel istatistik', 'WhatsApp butonu', 'SEO alanları'],
            'commission_rate' => 0,
        ],
        'professional' => [
            'label' => 'Professional',
            'product_limit' => 2000,
            'monthly_price' => 699,
            'yearly_price' => 6990,
            'features' => ['Pro istatistik', 'AI ürün asistanı', 'Vitrin özelleştirme', 'Sentos entegrasyonu'],
            'commission_rate' => 0,
        ],
        'enterprise' => [
            'label' => 'Enterprise',
            'product_limit' => -1,        // sınırsız
            'monthly_price' => 1999,
            'yearly_price' => 19990,
            'features' => ['Sınırsız ürün', 'Öncelikli destek', 'Custom domain', 'AI tüm modüller', 'API erişimi'],
            'commission_rate' => 0,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Kupon Politikası
    |--------------------------------------------------------------------------
    */

    'coupons' => [
        'welcome_popup' => [
            'discount_type' => 'percent',
            'amount' => 15,
            'expires_days' => 30,
            'min_order' => 250,
            'usage_limit' => 1,
        ],
        'box_insert' => [
            'discount_type' => 'percent',
            'amount' => 15,
            'expires_days' => 60,
            'min_order' => 250,
            'usage_limit' => 1,
        ],
        'cart_recovery' => [
            'discount_type' => 'percent',
            'amount' => 10,
            'expires_days' => 7,
            'min_order' => 0,
            'usage_limit' => 1,
        ],
        'review_reward' => [
            'discount_type' => 'fixed',
            'amount' => 25,
            'expires_days' => 90,
            'min_order' => 200,
            'usage_limit' => 1,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | WhatsApp Akıllı Buton
    |--------------------------------------------------------------------------
    | Her ürün/sayfa için otomatik prefilled mesaj template.
    */

    'whatsapp_button' => [
        'default_number' => env('WHATSAPP_DEFAULT_NUMBER', '+905555555555'),
        'product_template' => "Merhaba! Şu linkteki ürün hakkında bilgi almak istiyorum:\n:url\n(:name)",
        'page_template' => "Merhaba! :page sayfasındaki hizmetiniz hakkında yazıyorum.",
    ],

    /*
    |--------------------------------------------------------------------------
    | Pazar Yeri Yorum Scraper
    |--------------------------------------------------------------------------
    */

    'review_scraper' => [
        'enabled' => env('REVIEW_SCRAPER_ENABLED', false),
        'sources' => ['trendyol', 'hepsiburada', 'n11', 'amazon'],
        'rate_limit_seconds' => 5,
        'schedule_cron' => '0 2 * * *',
    ],
];
