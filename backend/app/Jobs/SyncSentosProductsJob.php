<?php

namespace App\Jobs;

use App\Models\SentosIntegration;
use App\Services\Integrations\Sentos\SentosClient;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SyncSentosProductsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly int $integrationId) {}

    public function handle(): void
    {
        $integration = SentosIntegration::with('seller')->find($this->integrationId);
        if (!$integration || !$integration->is_active) return;

        $client = SentosClient::forSeller($integration);

        $page = 1;
        $synced = 0;
        $errors = [];

        do {
            $products = $client->getProducts($page);
            foreach ($products as $remote) {
                try {
                    $this->upsert($integration, $remote);
                    $synced++;
                } catch (\Throwable $e) {
                    $errors[] = $e->getMessage();
                }
            }
            $page++;
        } while (!empty($products) && $page < 100);

        $integration->update([
            'last_sync_at' => now(),
            'last_sync_status' => empty($errors) ? 'success' : ($synced ? 'partial' : 'failed'),
            'synced_products_count' => $synced,
            'last_error' => empty($errors) ? null : implode('; ', array_slice($errors, 0, 5)),
        ]);
    }

    private function upsert(SentosIntegration $integration, array $remote): void
    {
        // ⚠️ Üretimde Sentos alan adlarına göre mapping zenginleştirilir.
        $sku = $remote['sku'] ?? $remote['code'] ?? null;
        if (!$sku) return;

        \App\Models\Product::updateOrCreate(
            ['seller_id' => $integration->seller_id, 'sku' => $sku],
            [
                'name' => $remote['name'] ?? $sku,
                'price' => $remote['price'] ?? 0,
                'stock' => $remote['stock'] ?? 0,
                'sentos_id' => $remote['id'] ?? null,
                'last_synced_at' => now(),
                'status' => 'pending',
                'description' => $remote['description'] ?? null,
                'barcode' => $remote['barcode'] ?? null,
                'slug' => \Illuminate\Support\Str::slug(($remote['name'] ?? $sku) . '-' . $sku),
                'uuid' => (string) \Illuminate\Support\Str::uuid(),
                'store_id' => $integration->seller->store?->id,
                'category_id' => $remote['category_id'] ?? 1,
            ],
        );
    }
}
