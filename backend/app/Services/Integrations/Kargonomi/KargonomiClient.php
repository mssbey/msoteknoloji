<?php

namespace App\Services\Integrations\Kargonomi;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/** Kargonomi REST API v1 istemcisi */
class KargonomiClient
{
    public function enabled(): bool
    {
        return (bool) config('integrations.kargonomi.enabled') && filled(config('integrations.kargonomi.token'));
    }

    private function http(): PendingRequest
    {
        if (!$this->enabled()) {
            throw new KargonomiException('Kargonomi entegrasyonu kapalı veya API anahtarı tanımlı değil.');
        }

        return Http::baseUrl(rtrim(config('integrations.kargonomi.base_url'), '/'))
            ->withToken(config('integrations.kargonomi.token'))
            ->acceptJson()
            ->timeout(config('integrations.kargonomi.timeout', 20));
    }

    private function unwrap(Response $response, string $action): array
    {
        if ($response->failed()) {
            $errors = collect($response->json('errors') ?? [])->flatten()->implode(' ');
            throw new KargonomiException(trim("Kargonomi {$action} başarısız ({$response->status()}). " . ($errors ?: $response->json('message') ?: mb_substr($response->body(), 0, 300))), $response->status());
        }

        return $response->json() ?? [];
    }

    /** Yanıttaki tek gönderi nesnesi ({data: {...}}, {data: [{...}]} veya düz nesne) */
    public static function shipmentFrom(array $json): array
    {
        $data = $json['data'] ?? $json['shipment'] ?? $json;
        if (array_is_list($data)) $data = $data[0] ?? [];

        return $data['shipment'] ?? $data;
    }

    public function createShipment(array $shipment): array
    {
        return self::shipmentFrom($this->unwrap($this->http()->post('/shipments', ['shipment' => $shipment]), 'gönderi oluşturma'));
    }

    public function confirmShippingPrice(int $shipmentId, int $providerId): array
    {
        return self::shipmentFrom($this->unwrap(
            $this->http()->asForm()->post('/confirm-shipping-price', ['shipment_id' => $shipmentId, 'shipping_provider_id' => $providerId]),
            'taşıyıcı onayı',
        ));
    }

    public function shipment(int $id): array
    {
        return self::shipmentFrom($this->unwrap($this->http()->get("/shipments/{$id}"), 'gönderi sorgulama'));
    }

    public function cancel(int $id): array
    {
        return $this->unwrap($this->http()->post('/shipments/cancel', ['shipment_id' => $id]), 'iptal');
    }

    /** Barkod etiketi (PDF) */
    public function barcodePdf(int $id): string
    {
        $json = $this->unwrap($this->http()->get("/shipments/{$id}/barcode", ['format' => 'pdf', 'packageContentVisibility' => 'true']), 'barkod alma');
        $encoded = $json['data']['barcode'] ?? $json['data']['pdf'] ?? $json['barcode'] ?? $json['pdf'] ?? $json['data'] ?? null;
        $pdf = is_string($encoded) ? base64_decode(preg_replace('#^data:application/pdf;base64,#', '', $encoded), true) : false;
        if (!$pdf || !str_starts_with($pdf, '%PDF')) {
            throw new KargonomiException('Kargonomi barkod yanıtı okunamadı.');
        }

        return $pdf;
    }

    public function states(): array
    {
        return Cache::remember('kargonomi:states', now()->addWeek(), fn () => $this->list($this->http()->get('/states'), 'il listesi'));
    }

    public function districts(int $stateId): array
    {
        return Cache::remember("kargonomi:cities:{$stateId}", now()->addWeek(), fn () => $this->list($this->http()->get("/cities/{$stateId}"), 'ilçe listesi'));
    }

    private function list(Response $response, string $action): array
    {
        $json = $this->unwrap($response, $action);
        $rows = $json['data'] ?? $json;
        return array_is_list($rows) ? $rows : array_values($rows);
    }

    public function webhooks(): array
    {
        return $this->list($this->http()->get('/webhooks'), 'webhook listesi');
    }

    public function createWebhook(string $name, string $url): array
    {
        return $this->unwrap($this->http()->post('/webhooks', [
            'name' => $name, 'url' => $url, 'event_type' => 'shipment.updated', 'is_active' => true,
        ]), 'webhook oluşturma');
    }
}
