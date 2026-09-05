<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Varsayılan Kargo Firması (Otomatik Atama)
    |--------------------------------------------------------------------------
    */

    'default' => env('CARGO_DEFAULT', 'yurtici'),

    /*
    |--------------------------------------------------------------------------
    | Entegre Kargo Firmaları
    |--------------------------------------------------------------------------
    */

    'providers' => [

        'yurtici' => [
            'driver' => 'yurtici',
            'wsdl' => 'https://webservices.yurticikargo.com/KOPSWebServices/ShippingOrderDispatcherServices?wsdl',
            'username' => env('YURTICI_USERNAME'),
            'password' => env('YURTICI_PASSWORD'),
            'client_id' => env('YURTICI_CLIENT_ID'),
        ],

        'aras' => [
            'driver' => 'aras',
            'wsdl' => 'https://customerservices.araskargo.com.tr/arascargoservice.asmx?wsdl',
            'username' => env('ARAS_USERNAME'),
            'password' => env('ARAS_PASSWORD'),
            'customer_code' => env('ARAS_CUSTOMER_CODE'),
        ],

        'mng' => [
            'driver' => 'mng',
            'endpoint' => 'https://service.mngkargo.com.tr/api',
            'api_key' => env('MNG_API_KEY'),
            'secret' => env('MNG_API_SECRET'),
            'customer_number' => env('MNG_CUSTOMER_NUMBER'),
        ],

        'ptt' => [
            'driver' => 'ptt',
            'endpoint' => 'https://pttkargo.com.tr/api',
            'username' => env('PTT_USERNAME'),
            'password' => env('PTT_PASSWORD'),
        ],

        'dhl' => [
            'driver' => 'dhl',
            'endpoint' => 'https://api-mock.dhl.com/mydhlapi',
            'api_key' => env('DHL_API_KEY'),
            'account' => env('DHL_ACCOUNT'),
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | İade Kargosu
    |--------------------------------------------------------------------------
    | Anlaşmalı tek bir firma üzerinden iade kodu üretilir.
    */

    'return_provider' => env('CARGO_RETURN_PROVIDER', 'yurtici'),
];
