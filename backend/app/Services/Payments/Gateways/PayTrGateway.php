<?php

namespace App\Services\Payments\Gateways;

use App\Models\Order;
use App\Services\Payments\Contracts\PaymentGateway;
use Illuminate\Support\Facades\Http;

/**
 * PayTR iframe API skeleton.
 * Üretim: paytr/paytr-iframe-api paketi veya raw cURL.
 */
class PayTrGateway implements PaymentGateway
{
    public function __construct(private readonly array $config) {}

    public function code(): string { return 'paytr'; }

    public function initiate(Order $order, array $options = []): array
    {
        // ⚠️ Hash hesaplama ve gerçek POST üretimde implement edilir.
        // hash = HMAC-SHA256( merchant_id + user_ip + merchant_oid + email + payment_amount + ... )
        $token = 'paytr_' . bin2hex(random_bytes(16));

        return [
            'success' => true,
            'redirect_url' => $this->config['base_url'] . '/iframe/' . $token,
            'token' => $token,
            'error' => null,
        ];
    }

    public function handleCallback(array $payload): array
    {
        // PayTR hash doğrulaması:
        // hash = base64( HMAC-SHA256( merchant_oid + merchant_salt + status + total_amount, merchant_key ) )
        $status = $payload['status'] ?? null;
        $oid = $payload['merchant_oid'] ?? null;

        if ($status !== 'success' || !$oid) {
            return ['success' => false, 'reference' => null, 'error' => 'Ödeme başarısız.'];
        }

        return ['success' => true, 'reference' => $oid, 'error' => null];
    }

    public function refund(Order $order, float $amount): array
    {
        return ['success' => true, 'reference' => 'paytr_refund_' . uniqid(), 'error' => null];
    }
}
