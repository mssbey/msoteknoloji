<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\IntegrationEvent;
use App\Models\Order;
use App\Services\Integrations\Kargonomi\KargonomiShipmentService;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/** Kargonomi shipment.updated bildirimleri */
class KargonomiWebhookController extends Controller
{
    public function __invoke(Request $request, KargonomiShipmentService $shipments)
    {
        $secret = config('integrations.kargonomi.webhook_secret');
        if (!$secret) {
            return response()->json(['message' => 'Webhook yapılandırılmamış.'], 503);
        }
        $body = $request->getContent();
        $signature = (string) $request->header('X-Webhook-Signature');
        $raw = hash_hmac('sha256', $body, $secret, true);
        if (!hash_equals(bin2hex($raw), strtolower($signature)) && !hash_equals(base64_encode($raw), $signature)) {
            return response()->json(['message' => 'Geçersiz imza.'], 401);
        }

        $payload = json_decode($body, true) ?? [];
        $shipment = $payload['shipment'] ?? null;
        $key = $payload['meta']['idempotency_key'] ?? null;
        if (!is_array($shipment) || empty($shipment['id'])) {
            return response()->json(['message' => 'Gönderi bilgisi yok.'], 422);
        }

        $order = Order::where('kargonomi_shipment_id', $shipment['id'])->first()
            ?? (!empty($shipment['ecommerce_provider_order_no'])
                ? Order::where('order_number', $shipment['ecommerce_provider_order_no'])->first() : null);

        try {
            // Savepoint: PostgreSQL'de benzersizlik hatası dış transaction'ı bozmasın.
            $event = DB::transaction(fn () => IntegrationEvent::create([
                'provider' => 'kargonomi',
                'event' => $payload['meta']['webhook']['event_type'] ?? 'shipment.updated',
                'idempotency_key' => $key ? "kargonomi:{$key}" : null,
                'order_id' => $order?->id,
                'payload' => $payload,
            ]));
        } catch (UniqueConstraintViolationException) {
            $previous = IntegrationEvent::where('idempotency_key', "kargonomi:{$key}")->first();
            if ($previous?->status !== 'failed') {
                return response()->json(['message' => 'Daha önce işlendi.']);
            }
            $event = $previous;
        }

        if (!$order) {
            // Bu siteye ait olmayan gönderi; tekrar denenmesin.
            $event->update(['status' => 'ignored', 'error' => 'Eşleşen sipariş bulunamadı.']);
            return response()->json(['message' => 'Sipariş bulunamadı.']);
        }

        try {
            if (!$order->kargonomi_shipment_id) $order->update(['kargonomi_shipment_id' => $shipment['id']]);
            $shipments->apply($order, $shipment);
            $event->update(['status' => 'processed', 'error' => null]);
        } catch (\Throwable $e) {
            $event->update(['status' => 'failed', 'error' => mb_substr($e->getMessage(), 0, 2000)]);
            report($e);
            return response()->json(['message' => 'İşlenemedi.'], 500);
        }

        return response()->json(['message' => 'OK']);
    }
}
