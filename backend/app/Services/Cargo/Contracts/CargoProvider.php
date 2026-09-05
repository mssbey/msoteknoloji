<?php

namespace App\Services\Cargo\Contracts;

use App\Models\OrderItem;

interface CargoProvider
{
    public function code(): string;

    /**
     * Sipariş kalemi için kargo barkodu/kodu üret.
     *
     * @return array{tracking_number: string, tracking_url: ?string, raw: mixed}
     */
    public function createShipment(OrderItem $item, array $options = []): array;

    /**
     * İade kargo kodu üret.
     *
     * @return array{tracking_number: string, tracking_url: ?string, raw: mixed}
     */
    public function createReturnLabel(\App\Models\ProductReturn $return, array $options = []): array;

    /**
     * Kargo durumu sorgula.
     *
     * @return array{status: string, events: array, raw: mixed}
     */
    public function trackStatus(string $trackingNumber): array;
}
