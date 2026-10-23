<?php

namespace App\Services\Integrations\Kargonomi;

use App\Models\Order;
use App\Services\Orders\OrderStatusService;
use Illuminate\Support\Str;

/**
 * Siparişten Kargonomi gönderisi oluşturur ve Kargonomi durumlarını siparişe yansıtır.
 *
 * Barkod oluşması kargoya verildi demek değildir: sipariş yalnızca taşıyıcı
 * gönderiyi teslim aldığında (webservice_shipment_started) "Kargoya verildi" olur.
 */
class KargonomiShipmentService
{
    /** Taşıyıcının gönderiyi teslim aldığı durum */
    public const PICKED_UP = 'webservice_shipment_started';
    public const DELIVERED = 'webservice_shipment_delivered';

    public const STATUS_LABELS = [
        'draft' => 'Taslak',
        'ready' => 'İşleme hazır',
        'webservice_order_creating' => 'Barkod oluşturuluyor',
        'webservice_order_created' => 'Barkod oluşturuldu',
        'webservice_order_failed' => 'Barkod oluşturulamadı',
        'webservice_checking_shipment' => 'Taşıyıcı teslim alımı bekleniyor',
        'webservice_shipment_started' => 'Taşıyıcıya teslim edildi',
        'webservice_shipment_delivered' => 'Alıcıya teslim edildi',
        'webservice_shipment_not_delivered' => 'Teslim edilemedi',
        'webservice_shipment_returning' => 'İade dönüşünde',
        'webservice_shipment_missing' => 'Kayıp',
        'request_for_cancellation' => 'İptal talep edildi',
        'cancelled' => 'İptal edildi',
    ];

    public function __construct(
        private readonly KargonomiClient $client,
        private readonly OrderStatusService $orders,
    ) {}

    public function canCreate(Order $order): bool
    {
        return !$order->kargonomi_shipment_id && in_array($order->status, ['confirmed', 'processing'], true);
    }

    /** Gönderiyi oluşturur ve taşıyıcıyı onaylar; sipariş "Hazırlanıyor" durumuna alınır. */
    public function createShipment(Order $order, ?int $actorId = null): Order
    {
        if ($order->kargonomi_shipment_id) {
            throw new KargonomiException('Bu sipariş için Kargonomi gönderisi zaten oluşturulmuş.');
        }
        if (!$this->canCreate($order)) {
            throw new KargonomiException('Gönderi yalnızca onaylanmış veya hazırlanan siparişler için oluşturulabilir.');
        }

        $shipment = $this->client->createShipment($this->payload($order->loadMissing('items.product', 'user')));
        $id = (int) ($shipment['id'] ?? 0);
        if (!$id) throw new KargonomiException('Kargonomi gönderi numarası dönmedi.');
        // Taşıyıcı onayı başarısız olsa bile gönderi numarası kaybolmasın.
        $order->update(['kargonomi_shipment_id' => $id, 'cargo_status' => $shipment['status'] ?? 'draft']);

        $shipment = $this->client->confirmShippingPrice($id, (int) config('integrations.kargonomi.shipping_provider_id', -1)) ?: $shipment;
        if ($order->status === 'confirmed') {
            $this->orders->transition($order, 'processing', 'admin', $actorId, 'Kargonomi gönderisi oluşturuldu');
        }

        return $this->apply($order->fresh(), $shipment);
    }

    public function refresh(Order $order): Order
    {
        if (!$order->kargonomi_shipment_id) throw new KargonomiException('Siparişin Kargonomi gönderisi yok.');

        return $this->apply($order, $this->client->shipment($order->kargonomi_shipment_id));
    }

    public function barcodePdf(Order $order): string
    {
        if (!$order->kargonomi_shipment_id) throw new KargonomiException('Siparişin Kargonomi gönderisi yok.');

        return $this->client->barcodePdf($order->kargonomi_shipment_id);
    }

    /** Kargonomi gönderi nesnesini siparişe uygular (webhook, senkron ve oluşturma sonrası). */
    public function apply(Order $order, array $shipment): Order
    {
        $status = $shipment['status'] ?? $order->cargo_status;
        $code = ($shipment['shipping_webservice_tracking_code'] ?? null)
            ?: ($shipment['shipping_webservice_barcode'] ?? null)
            ?: $order->cargo_tracking_number;
        $slug = $shipment['shipping_provider_slug'] ?? null;
        $carrier = $shipment['shipping_provider_name'] ?? null;

        $cargo = array_filter([
            'cargo_status' => $status,
            'cargo_company' => $carrier && $slug !== 'otomatik' ? $carrier : null,
            'cargo_tracking_number' => $code,
            'cargo_tracking_url' => $code ? $this->trackingUrl($slug, $code) : null,
        ], fn ($v) => $v !== null && $v !== '');
        $order->update($cargo);

        $note = 'Kargonomi: ' . (self::STATUS_LABELS[$status] ?? $status);
        if ($status === self::PICKED_UP) {
            $this->advance($order, ['processing', 'shipped'], $note);
        } elseif ($status === self::DELIVERED) {
            $this->advance($order, ['processing', 'shipped', 'delivered'], $note);
        }

        return $order->fresh();
    }

    /** Siparişi sırayla hedef duruma ilerletir; zaten geçilmiş adımları atlar. */
    private function advance(Order $order, array $path, string $note): void
    {
        $target = end($path);
        foreach ($path as $step) {
            $order->refresh();
            if ($order->status === $target) return;
            if ($this->orders->canTransition($order, $step)) {
                $this->orders->transition($order, $step, 'integration', null, $note);
            }
        }
    }

    public function trackingUrl(?string $slug, string $code): string
    {
        $key = Str::of((string) $slug)->lower()->ascii()->replaceMatches('/[^a-z]/', '')->toString();
        $template = config("integrations.kargonomi.tracking_urls.{$key}") ?? config('integrations.kargonomi.fallback_tracking_url');

        return str_replace('{code}', rawurlencode($code), $template);
    }

    private function payload(Order $order): array
    {
        $address = $order->shipping_address ?? [];
        [$stateId, $cityId] = $this->resolveLocation($address['city'] ?? '', $address['district'] ?? '');
        $phone = substr(preg_replace('/\D/', '', $address['phone'] ?? ''), -10);
        $desi = max(1, round($order->items->sum(
            fn ($item) => max((float) ($item->product?->weight ?? 0), (float) config('integrations.kargonomi.default_desi', 1)) * $item->quantity,
        ), 2));

        $shipment = [
            'buyer_name' => trim(($address['first_name'] ?? '') . ' ' . ($address['last_name'] ?? '')),
            'buyer_email' => $order->customer_email,
            'buyer_phone' => $phone,
            'buyer_address' => trim(($address['address'] ?? '') . ' ' . ($address['district'] ?? '') . '/' . ($address['city'] ?? '')),
            'buyer_state_id' => $stateId,
            'buyer_city_id' => $cityId,
            'packages' => [[
                'desi' => $desi,
                'barcode' => $order->order_number,
                'content' => Str::limit($order->items->map(fn ($i) => "{$i->quantity}x {$i->name}")->implode(', '), 250, ''),
            ]],
        ];
        if ($warehouse = config('integrations.kargonomi.warehouse_id')) {
            $shipment['warehouse_id'] = (int) $warehouse;
        }

        return $shipment;
    }

    /** İl ve ilçe adını Kargonomi kimliklerine çevirir. */
    public function resolveLocation(string $city, string $district): array
    {
        $state = $this->match($this->client->states(), $city);
        if (!$state) throw new KargonomiException("Kargonomi il listesinde \"{$city}\" bulunamadı.");
        $town = $this->match($this->client->districts((int) $state['id']), $district);
        if (!$town) throw new KargonomiException("Kargonomi ilçe listesinde \"{$district}\" ({$city}) bulunamadı.");

        return [(int) $state['id'], (int) $town['id']];
    }

    private function match(array $rows, string $name): ?array
    {
        $needle = self::normalize($name);
        foreach ($rows as $row) {
            if (self::normalize($row['name'] ?? $row['title'] ?? '') === $needle) return $row;
        }

        return null;
    }

    public static function normalize(string $value): string
    {
        $value = strtr($value, ['İ' => 'i', 'I' => 'ı', 'Ç' => 'ç', 'Ğ' => 'ğ', 'Ö' => 'ö', 'Ş' => 'ş', 'Ü' => 'ü']);
        $value = mb_strtolower($value, 'UTF-8');
        $value = strtr($value, ['ı' => 'i', 'ç' => 'c', 'ğ' => 'g', 'ö' => 'o', 'ş' => 's', 'ü' => 'u', 'â' => 'a', 'î' => 'i', 'û' => 'u']);

        return preg_replace('/[^a-z0-9]/', '', $value);
    }
}
