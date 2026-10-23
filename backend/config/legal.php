<?php

return [
    // Hukuki metinlerdeki satıcı bilgileri (resources/legal/*.json ile aynı olmalı)
    'seller' => [
        'title' => 'MSO TEKNOLOJİ TİCARET ANONİM ŞİRKETİ',
        'email' => env('LEGAL_SELLER_EMAIL', 'info@msoteknoloji.com.tr'),
        'address' => 'Caferağa Mahallesi, General Asım Gündüz Caddesi, No: 62, İç Kapı No: 5, Kadıköy / İstanbul',
    ],

    'carrier' => env('LEGAL_DEFAULT_CARRIER', 'Kargonomi üzerinden anlaşmalı kargo firması'),
    'return_carrier' => env('LEGAL_RETURN_CARRIER', 'Kargonomi üzerinden anlaşmalı kargo firması'),
    'return_address' => env('LEGAL_RETURN_ADDRESS', 'Caferağa Mahallesi, General Asım Gündüz Caddesi, No: 62, İç Kapı No: 5, Kadıköy / İstanbul'),

    // Kesin tarih verilmez; yasal üst sınır 30 gündür.
    'estimated_delivery' => env('LEGAL_ESTIMATED_DELIVERY', 'Sipariş onayından itibaren genellikle 1-3 iş günü içinde kargoya verilir; teslimat en geç 30 gün içinde yapılır.'),
];
