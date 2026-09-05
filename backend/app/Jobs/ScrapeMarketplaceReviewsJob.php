<?php

namespace App\Jobs;

use App\Models\Product;
use App\Models\ScrapedReview;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Pazar yeri yorum çekme job'u.
 * Sadece MSO Teknoloji'nin kendi ürünleri scrape edilir.
 * Üretim: ayrı bir Node.js / Playwright servisinin REST API'sini çağırır.
 */
class ScrapeMarketplaceReviewsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly int $productId,
        public readonly string $platform,
        public readonly string $externalUrl,
    ) {}

    public function handle(): void
    {
        if (!config('marketplace.review_scraper.enabled')) return;

        $product = Product::find($this->productId);
        if (!$product) return;

        // ⚠️ Gerçek scraping ayrı bir mikroservise outsource edilir.
        // Bu job, scraping servisi geri çağrıldığında upsert eder.
        // Burada bir placeholder işlemi:
        $reviews = $this->fetchExternal();

        foreach ($reviews as $r) {
            ScrapedReview::updateOrCreate(
                ['platform' => $this->platform, 'external_review_id' => $r['id'] ?? md5($r['content'])],
                [
                    'product_id' => $product->id,
                    'match_key' => $product->sku,
                    'external_product_url' => $this->externalUrl,
                    'rating' => $r['rating'] ?? 5,
                    'reviewer_name' => $r['author'] ?? 'Anonim',
                    'title' => $r['title'] ?? null,
                    'content' => $r['content'] ?? '',
                    'review_date' => isset($r['date']) ? \Carbon\Carbon::parse($r['date'])->toDateString() : null,
                    'is_verified_purchase' => $r['verified'] ?? false,
                ],
            );
        }

        sleep((int) config('marketplace.review_scraper.rate_limit_seconds', 5));
    }

    private function fetchExternal(): array
    {
        // Üretimde Playwright mikroservisi: POST /scrape { url, platform }
        return [];
    }
}
