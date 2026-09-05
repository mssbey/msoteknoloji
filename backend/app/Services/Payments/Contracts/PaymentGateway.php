<?php

namespace App\Services\Payments\Contracts;

use App\Models\Order;

interface PaymentGateway
{
    public function code(): string;

    /**
     * Ödeme oturumu/iframe URL'si üret.
     *
     * @return array{success: bool, redirect_url: ?string, token: ?string, error: ?string}
     */
    public function initiate(Order $order, array $options = []): array;

    /**
     * Gateway callback'ini doğrula ve siparişi onayla.
     *
     * @return array{success: bool, reference: ?string, error: ?string}
     */
    public function handleCallback(array $payload): array;

    /**
     * İade.
     */
    public function refund(Order $order, float $amount): array;
}
