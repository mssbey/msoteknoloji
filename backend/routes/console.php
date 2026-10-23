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

// Gönderilemeyen sipariş/iade e-postaları (10 dakikada bir)
Schedule::command('orders:retry-emails')->everyTenMinutes()->withoutOverlapping();

// Kargonomi webhook'u kaçırılırsa gönderi durumları (30 dakikada bir)
Schedule::command('kargonomi:sync')->everyThirtyMinutes()->withoutOverlapping();

// Gün boyunca yerel katalog kullanılır; Sentos yalnızca gece güncellenir.
Schedule::command('sentos:nightly')->dailyAt('00:00')->timezone('Europe/Istanbul')->withoutOverlapping(1440);

// Pazar yeri yorum scraping (gece 02:00)
Schedule::command('reviews:scrape --platform=trendyol')->dailyAt('02:00');
Schedule::command('reviews:scrape --platform=hepsiburada')->dailyAt('02:30');
