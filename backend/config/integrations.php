<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Sentos API
    |--------------------------------------------------------------------------
    | Satıcıların Sentos üzerindeki ürünleri otomatik aktarılır,
    | stok/fiyat güncellemeleri anlık işlenir.
    */

    'sentos' => [
        'enabled' => env('SENTOS_ENABLED', false),
        'base_url' => env('SENTOS_BASE_URL', 'https://api.sentos.com.tr'),
        'api_key' => env('SENTOS_API_KEY'),
        'api_secret' => env('SENTOS_API_SECRET'),
        'sync_interval_minutes' => 15,
        'webhook_secret' => env('SENTOS_WEBHOOK_SECRET'),
        'verify_ssl' => env('SENTOS_VERIFY_SSL', true),
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
