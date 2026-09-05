<?php

return [

    /*
    |--------------------------------------------------------------------------
    | SMS Sağlayıcı
    |--------------------------------------------------------------------------
    | Desteklenen: netgsm | iletimerkezi | mutlucell | log (test için)
    */

    'sms' => [
        'driver' => env('SMS_DRIVER', 'log'),
        'sender' => env('SMS_SENDER', 'MSOTEKN'),

        'netgsm' => [
            'usercode' => env('NETGSM_USERCODE'),
            'password' => env('NETGSM_PASSWORD'),
            'endpoint' => 'https://api.netgsm.com.tr/sms/send/get',
        ],

        'iletimerkezi' => [
            'username' => env('ILETIMERKEZI_USERNAME'),
            'password' => env('ILETIMERKEZI_PASSWORD'),
            'endpoint' => 'https://api.iletimerkezi.com/v1/send-sms/json',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | WhatsApp Business
    |--------------------------------------------------------------------------
    | Desteklenen: meta_cloud | wati | maytapi | log
    */

    'whatsapp' => [
        'driver' => env('WHATSAPP_DRIVER', 'log'),
        'phone_id' => env('WHATSAPP_PHONE_ID'),
        'business_id' => env('WHATSAPP_BUSINESS_ID'),

        'meta_cloud' => [
            'access_token' => env('WHATSAPP_META_TOKEN'),
            'api_version' => 'v20.0',
            'endpoint' => 'https://graph.facebook.com',
        ],

        'wati' => [
            'api_key' => env('WATI_API_KEY'),
            'tenant_id' => env('WATI_TENANT_ID'),
            'endpoint' => env('WATI_ENDPOINT', 'https://live-server.wati.io'),
        ],

        'templates' => [
            'order_confirmed' => 'mso_order_confirmed',
            'order_shipped' => 'mso_order_shipped',
            'order_delivered' => 'mso_order_delivered',
            'cart_recovery' => 'mso_cart_recovery',
            'review_request' => 'mso_review_request',
            'lead_welcome' => 'mso_lead_welcome',
        ],
    ],
];
