<?php

namespace App\Services\Cargo\Adapters;

use App\Models\OrderItem;
use App\Models\ProductReturn;
use App\Services\Cargo\Contracts\CargoProvider;
use Illuminate\Support\Str;

abstract class AbstractCargoAdapter implements CargoProvider
{
    public function __construct(protected readonly array $config) {}

    abstract public function code(): string;

    protected function fakeTrackingNumber(string $prefix): string
    {
        return strtoupper($prefix . now()->format('ymd') . Str::upper(Str::random(8)));
    }

    public function createShipment(OrderItem $item, array $options = []): array
    {
        // ⚠️ Üretimde her sağlayıcının kendi SOAP/REST entegrasyonu burada doldurulur.
        $tracking = $this->fakeTrackingNumber($this->code() . '-');
        return [
            'tracking_number' => $tracking,
            'tracking_url' => $this->trackingUrl($tracking),
            'raw' => ['provider' => $this->code(), 'item_id' => $item->id],
        ];
    }

    public function createReturnLabel(ProductReturn $return, array $options = []): array
    {
        $tracking = $this->fakeTrackingNumber($this->code() . '-R-');
        return [
            'tracking_number' => $tracking,
            'tracking_url' => $this->trackingUrl($tracking),
            'raw' => ['provider' => $this->code(), 'return_id' => $return->id],
        ];
    }

    public function trackStatus(string $trackingNumber): array
    {
        return [
            'status' => 'in_transit',
            'events' => [],
            'raw' => ['provider' => $this->code(), 'tracking' => $trackingNumber],
        ];
    }

    abstract protected function trackingUrl(string $trackingNumber): string;
}
