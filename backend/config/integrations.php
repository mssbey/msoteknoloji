<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Sentos API
    |--------------------------------------------------------------------------
    | Satıcıların Sentos üzerindeki ürünleri otomatik aktarılır,
    | stok/fiyat güncellemeleri gece 00.00'da yerel kataloğa aktarılır.
    */

    'sentos' => [
        'enabled' => env('SENTOS_ENABLED', false),
        'base_url' => env('SENTOS_BASE_URL', 'https://api.sentos.com.tr'),
        'api_key' => env('SENTOS_API_KEY'),
        'api_secret' => env('SENTOS_API_SECRET'),
        'store_id' => env('SENTOS_STORE_ID', 1),
        'image_hosts' => env('SENTOS_IMAGE_HOSTS', 'msoteknoloji.sentos.com.tr,cdn.dsmcdn.com,n11scdn.akamaized.net,n11scdn1.akamaized.net,n11scdn2.akamaized.net,n11scdn3.akamaized.net,n11scdn4.akamaized.net,marketplace-single-product-images.oss-eu-central-1.aliyuncs.com,images.hepsiburada.net,productimages.hepsiburada.net,ae01.alicdn.com'),
        'image_ca_bundle' => env('SENTOS_IMAGE_CA_BUNDLE'),
        'webhook_secret' => env('SENTOS_WEBHOOK_SECRET'),
        'verify_ssl' => env('SENTOS_VERIFY_SSL', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Kargonomi (kargo barkodu, taşıyıcı seçimi, takip)
    |--------------------------------------------------------------------------
    | Dokümantasyon: https://www.kargonomi.com.tr/help/api-dokumantasyonu/kargonomi-api/
    | Gönderici bilgisi Kargonomi panelindeki depodan (warehouse_id) alınır.
    */

    'kargonomi' => [
        'enabled' => env('KARGONOMI_ENABLED', false),
        'base_url' => env('KARGONOMI_BASE_URL', 'https://app.kargonomi.com.tr/api/v1'),
        'token' => env('KARGONOMI_API_TOKEN'),
        'webhook_secret' => env('KARGONOMI_WEBHOOK_SECRET'),
        'warehouse_id' => env('KARGONOMI_WAREHOUSE_ID'),
        // -1: Kargonomi en uygun taşıyıcıyı seçer; belirli taşıyıcı için ID verin (ör. 4 = Aras)
        'shipping_provider_id' => (int) env('KARGONOMI_SHIPPING_PROVIDER_ID', -1),
        'default_desi' => (float) env('KARGONOMI_DEFAULT_DESI', 1),
        'timeout' => 20,
        // Taşıyıcının kendi takip sayfası; {code} takip numarasıyla değiştirilir.
        // Tanımsız taşıyıcılarda Kargonomi takip sayfası kullanılır.
        'tracking_urls' => [
            'yurtici' => 'https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code={code}',
            'aras' => 'https://kargotakip.araskargo.com.tr/mainpage.aspx?code={code}',
            'surat' => 'https://suratkargo.com.tr/KargoTakip/?kargotakipno={code}',
            'hepsijet' => 'https://www.hepsijet.com/gonderi-takibi/{code}',
            'ptt' => 'https://gonderitakip.ptt.gov.tr/Track/Verify?q={code}',
            'kolaygelsin' => 'https://esube.kolaygelsin.com/shipments?trackingId={code}',
            'ups' => 'https://www.ups.com/track?loc=tr_TR&tracknum={code}',
        ],
        'fallback_tracking_url' => 'https://app.kargonomi.com.tr/kargo-takip?code={code}',
    ],

    /*
    |--------------------------------------------------------------------------
    | AI (Claude / OpenAI)
    |--------------------------------------------------------------------------
    */

    'claude' => [
        'api_key' => env('CLAUDE_API_KEY'),
        'model' => env('CLAUDE_MODEL', 'claude-sonnet-4-6'),
        'endpoint' => 'https://api.anthropic.com/v1/messages',
        'max_tokens' => 2048,
    ],

    'openai' => [
        'api_key' => env('OPENAI_API_KEY'),
        'model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Bulut Santral & Kurumsal Numara (0212)
    |--------------------------------------------------------------------------
    */

    'pbx' => [
        'driver' => env('PBX_DRIVER', 'netgsm'),
        'corporate_number' => env('PBX_NUMBER', '+902120000000'),
        'extensions' => [
            'sales' => env('PBX_EXT_SALES', '1001'),
            'support' => env('PBX_EXT_SUPPORT', '1002'),
            'accounting' => env('PBX_EXT_ACCOUNTING', '1003'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Forum Entegrasyonu (airgunturk.com)
    |--------------------------------------------------------------------------
    */

    'forum' => [
        'site_url' => env('FORUM_SITE_URL', 'https://airgunturk.com'),
        'utm_source' => 'airgunturk',
        'utm_medium' => 'forum',
        'banner_slots' => ['header_728x90', 'sidebar_300x250', 'inline_300x250'],
    ],

    /*
    |--------------------------------------------------------------------------
    | Sosyal Medya / Meta Ads / UTM
    |--------------------------------------------------------------------------
    */

    'meta_ads' => [
        'pixel_id' => env('META_PIXEL_ID'),
        'access_token' => env('META_CAPI_TOKEN'),
        'test_event_code' => env('META_TEST_EVENT_CODE'),
    ],
];
