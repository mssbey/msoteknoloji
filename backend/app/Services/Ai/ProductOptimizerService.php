<?php

namespace App\Services\Ai;

use App\Models\Product;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Satıcı paneline gömülen AI asistan.
 * Ürün başlık + açıklama + SEO meta önerileri üretir.
 */
class ProductOptimizerService
{
    public function suggest(Product $product): array
    {
        $config = config('integrations.claude');
        if (empty($config['api_key'])) {
            return $this->fallback($product, 'AI API anahtarı yapılandırılmamış.');
        }

        $prompt = $this->buildPrompt($product);

        try {
            $response = Http::withHeaders([
                'x-api-key' => $config['api_key'],
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])->timeout(30)->post($config['endpoint'], [
                'model' => $config['model'],
                'max_tokens' => $config['max_tokens'],
                'messages' => [
                    ['role' => 'user', 'content' => $prompt],
                ],
            ]);

            if (!$response->successful()) {
                return $this->fallback($product, $response->body());
            }

            $text = $response->json('content.0.text') ?? '';
            $parsed = $this->tryParseJson($text);

            $product->update([
                'ai_suggestions' => $parsed,
                'ai_generated_at' => now(),
                'ai_score' => (int) ($parsed['score'] ?? 70),
            ]);

            return $parsed;
        } catch (\Throwable $e) {
            Log::error('AI optimizer hatası', ['error' => $e->getMessage(), 'product' => $product->id]);
            return $this->fallback($product, $e->getMessage());
        }
    }

    private function buildPrompt(Product $product): string
    {
        return <<<PROMPT
        Sen bir Türkiye e-ticaret SEO uzmanısın. Aşağıdaki ürün için Trendyol/Hepsiburada
        seviyesinde başlık ve açıklama önerileri üret. Yanıtı SADECE JSON ver:
        {
          "title": "...",
          "short_description": "...",
          "long_description": "...",
          "seo_title": "...",
          "seo_description": "...",
          "keywords": ["..."],
          "alt_text_template": "...",
          "score": 0-100
        }

        Mevcut ürün:
        - Ad: {$product->name}
        - SKU: {$product->sku}
        - Kategori: {$product->category?->name}
        - Marka: {$product->brand?->name}
        - Fiyat: {$product->price} TL
        - Mevcut Açıklama: {$product->description}
        PROMPT;
    }

    private function tryParseJson(string $text): array
    {
        if (preg_match('/\{.*\}/s', $text, $m)) {
            $decoded = json_decode($m[0], true);
            if (is_array($decoded)) return $decoded;
        }
        return ['raw' => $text];
    }

    private function fallback(Product $product, string $reason): array
    {
        return [
            'error' => true,
            'reason' => $reason,
            'fallback' => [
                'title' => $product->name,
                'seo_title' => $product->name . ' | MSO Teknoloji',
            ],
        ];
    }
}
