<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ── Otomasyon Takvimi ────────────────────────────────────────────────────────
// Sepet terk işlemi (her saat): 30 dk üzeri terk edilmiş sepetleri işaretler
Schedule::command('carts:process-abandoned')->hourly()->withoutOverlapping();

// Sentos ürün/stok senkronizasyonu (her 15 dk)
Schedule::command('sentos:sync')->everyFifteenMinutes()->withoutOverlapping();

// Pazar yeri yorum scraping (gece 02:00)
Schedule::command('reviews:scrape --platform=trendyol')->dailyAt('02:00');
Schedule::command('reviews:scrape --platform=hepsiburada')->dailyAt('02:30');
