<?php

namespace App\Console\Commands;

use App\Jobs\ScrapeMarketplaceReviewsJob;
use App\Models\Product;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('reviews:scrape {--platform=trendyol} {--limit=50}')]
#[Description('Pazar yerlerinden (Trendyol/Hepsiburada) MSO ürünleri için yorumları çeker')]
class ScrapeMarketplaceReviews extends Command
{
    public function handle(): void
    {
        if (!config('marketplace.review_scraper.enabled')) {
            $this->warn('Review scraper devre dışı. config/marketplace.php → review_scraper.enabled = true yapın.');
            return;
        }

        $platform = $this->option('platform');
        $limit = (int) $this->option('limit');

        $products = Product::whereNotNull('barcode')
            ->orWhereNotNull('sku')
            ->limit($limit)
            ->get();

        foreach ($products as $p) {
            // Üretimde ürünün pazar yeri URL'leri ayrı bir tabloda tutulur.
            $url = "https://www.{$platform}.com/sr?q=" . urlencode($p->name);
            ScrapeMarketplaceReviewsJob::dispatch($p->id, $platform, $url);
        }

        $this->info("🤖 {$products->count()} ürün için yorum scraping kuyruğa alındı.");
    }
}
