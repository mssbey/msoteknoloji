<?php

namespace App\Services\Payments\Gateways;

use App\Models\Order;
use App\Services\Payments\Contracts\PaymentGateway;

/**
 * İyzico (sandbox/production) — temel skeleton.
 * Üretim: iyzipay/iyzipay-php paketi ile genişletilebilir.
 */
class IyzicoGateway implements PaymentGateway
{
    public function __construct(private readonly array $config) {}

    public function code(): string { return 'iyzico'; }

    public function initiate(Order $order, array $options = []): array
    {
        // ⚠️ Üretimde iyzipay\Model\CheckoutFormInitialize::create(...)
        // Burada güvenli bir stub döner; gerçek entegrasyon sonrası genişletilecek.
        return [
            'success' => true,
            'redirect_url' => $this->config['base_url'] . '/payment/iyzico-checkout?orderId=' . $order->uuid,
            'token' => 'iyz_' . bin2hex(random_bytes(16)),
            'error' => null,
        ];
    }

    public function handleCallback(array $payload): array
    {
        // İyzico HMAC doğrulaması burada yapılmalı.
        $token = $payload['token'] ?? null;
        if (!$token) {
            return ['success' => false, 'reference' => null, 'error' => 'Token eksik'];
        }
        return [
            'success' => true,
            'reference' => $payload['paymentId'] ?? $token,
            'error' => null,
        ];
    }

    public function refund(Order $order, float $amount): array
    {
        return ['success' => true, 'reference' => 'iyz_refund_' . uniqid(), 'error' => null];
    }
}
