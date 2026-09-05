<?php

namespace App\Services\Integrations\Sentos;

use App\Models\SentosIntegration;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;

/**
 * Sentos API client — https://firma-adi.sentos.com.tr/api
 * Kimlik doğrulama: HTTP Basic Auth (kullanıcı = API Anahtar, şifre = API Şifre).
 * Resmi OpenAPI: https://api.sentos.com.tr/apidir/docs/sentos.json
 */
class SentosClient
{
    public function __construct(
        private readonly string $apiKey,
        private readonly string $apiSecret,
        private readonly string $baseUrl,
        private readonly bool $verifySsl = true,
    ) {}

    public static function forSeller(SentosIntegration $integration): self
    {
        return new self(
            apiKey: $integration->api_key,
            apiSecret: $integration->api_secret,
            baseUrl: config('integrations.sentos.base_url'),
            verifySsl: (bool) config('integrations.sentos.verify_ssl', true),
        );
    }

    public static function make(string $apiKey, string $apiSecret, string $baseUrl): self
    {
        return new self($apiKey, $apiSecret, rtrim($baseUrl, '/'), (bool) config('integrations.sentos.verify_ssl', true));
    }

    /** Tek sayfa ürün listesi (ham Sentos objeleri). */
    public function getProducts(int $page = 1, int $size = 100): array
    {
        $response = $this->http()->get('/products', [
            'page' => $page,
            'size' => $size,
        ]);

        if (!$response->successful()) {
            return [];
        }

        $json = $response->json();

        // Sentos düz dizi ya da {data:[...]} sarmalı döndürebilir.
        if (isset($json['data']) && is_array($json['data'])) {
            return $json['data'];
        }
        return is_array($json) ? $json : [];
    }

    /** ID ile tek ürünün tam detayı (resim + varyant dahil). */
    public function getProduct(int $id): ?array
    {
        $response = $this->http()->get("/products/{$id}");
        return $response->successful() ? $response->json() : null;
    }

    /** Kategori ağacı. Rate-limit (GET 2/dk) durumunda bir kez bekleyip yeniden dener. */
    public function getCategories(): array
    {
        $response = $this->http()->get('/categories');
        if ($response->status() === 429) {
            sleep(31);
            $response = $this->http()->get('/categories');
        }
        return $response->successful() ? ($response->json() ?? []) : [];
    }

    /** Ham yanıtı (status + body) döndürür — bağlantı testleri için. */
    public function ping(): array
    {
        try {
            // /products kullanılıyor; /categories rate-limit bütçesini tüketmesin.
            $response = $this->http()->get('/products', ['page' => 1, 'size' => 1]);
            return [
                'ok' => $response->successful(),
                'status' => $response->status(),
                'body' => mb_substr((string) $response->body(), 0, 300),
            ];
        } catch (\Throwable $e) {
            return ['ok' => false, 'status' => 0, 'body' => $e->getMessage()];
        }
    }

    private function http(): PendingRequest
    {
        return Http::baseUrl($this->baseUrl)
            ->withBasicAuth($this->apiKey, $this->apiSecret)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])
            ->withOptions(['verify' => $this->verifySsl])
            ->timeout(60)
            ->retry(2, 1500, throw: false);
    }
}
