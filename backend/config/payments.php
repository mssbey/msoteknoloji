<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Varsayılan Ödeme Sağlayıcısı
    |--------------------------------------------------------------------------
    | iyzico | paytr
    */

    'default' => env('PAYMENT_DEFAULT', 'iyzico'),

    /*
    |--------------------------------------------------------------------------
    | Sağlayıcılar
    |--------------------------------------------------------------------------
    */

    'providers' => [

        'iyzico' => [
            'api_key' => env('IYZICO_API_KEY'),
            'secret' => env('IYZICO_SECRET'),
            'base_url' => env('IYZICO_BASE_URL', 'https://sandbox-api.iyzipay.com'),
            'callback_url' => env('APP_URL') . '/api/payments/iyzico/callback',
        ],

        'paytr' => [
            'merchant_id' => env('PAYTR_MERCHANT_ID'),
            'merchant_key' => env('PAYTR_MERCHANT_KEY'),
            'merchant_salt' => env('PAYTR_MERCHANT_SALT'),
            'base_url' => 'https://www.paytr.com/odeme/api',
            'callback_url' => env('APP_URL') . '/api/payments/paytr/callback',
            'test_mode' => env('PAYTR_TEST_MODE', true),
        ],

        'stripe' => [
            'public_key' => env('STRIPE_PUBLIC_KEY'),
            'secret_key' => env('STRIPE_SECRET_KEY'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Taksit & Komisyon (admin tarafından override edilebilir)
    |--------------------------------------------------------------------------
    */

    'installments' => [
        'max' => 12,
        'min_amount_for_installment' => 250,
    ],
];
