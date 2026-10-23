<?php

namespace App\Services\Orders;

use App\Jobs\SendOrderEmailJob;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\DB;

/**
 * Sipariş durumlarının tek giriş noktası: geçiş kuralları, durum geçmişi,
 * iptal stok iadesi ve müşteri e-postaları burada yönetilir.
 */
class OrderStatusService
{
    public const TRANSITIONS = [
        'pending' => ['received', 'payment_failed', 'cancelled'],
        'payment_failed' => ['pending', 'received', 'cancelled'],
        'received' => ['confirmed', 'cancelled'],
        'confirmed' => ['processing', 'cancelled'],
        'processing' => ['shipped', 'cancelled'],
        'shipped' => ['delivered'],
        'delivered' => ['return_requested'],
        'return_requested' => ['delivered', 'refunded'],
        'cancelled' => [],
        'refunded' => [],
    ];

    /** Müşteriye e-posta gönderilen sipariş durumları → e-posta türü */
    public const EMAILS = [
        'received' => 'order_received',
        'confirmed' => 'order_confirmed',
        'shipped' => 'order_shipped',
        'delivered' => 'order_delivered',
    ];

    /** Sipariş kalemlerine yansıtılan durumlar */
    private const ITEM_STATUSES = ['processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

    public function canTransition(Order $order, string $to): bool
    {
        return in_array($to, self::TRANSITIONS[$order->status] ?? [], true);
    }

    public function recordInitial(Order $order, string $actorType = 'customer', ?int $actorId = null): void
    {
        OrderStatusHistory::create([
            'order_id' => $order->id,
            'status' => $order->status,
            'actor_type' => $actorType,
            'actor_id' => $actorId,
        ]);
    }

    /**
     * @param  array  $attributes  Durumla birlikte kaydedilecek ek alanlar (ör. kargo bilgileri)
     *
     * @throws \DomainException geçiş kurala uymuyorsa
     */
    public function transition(
        Order $order,
        string $to,
        string $actorType = 'system',
        ?int $actorId = null,
        ?string $note = null,
        array $attributes = [],
    ): Order {
        if (!array_key_exists($to, self::TRANSITIONS)) {
            throw new \InvalidArgumentException("Bilinmeyen sipariş durumu: {$to}");
        }

        $locked = DB::transaction(function () use ($order, $to, $actorType, $actorId, $note, $attributes) {
            $locked = Order::query()->lockForUpdate()->findOrFail($order->getKey());

            // Aynı durum tekrar bildirilirse (ör. tekrarlanan webhook) yeni kayıt ve e-posta üretilmez.
            if ($locked->status === $to) {
                return $locked;
            }
            if (!$this->canTransition($locked, $to)) {
                $from = Order::STATUS_LABELS[$locked->status] ?? $locked->status;
                $target = Order::STATUS_LABELS[$to];
                throw new \DomainException("Sipariş \"{$from}\" durumundan \"{$target}\" durumuna geçirilemez.");
            }

            $from = $locked->status;
            if ($to === 'cancelled') {
                $this->restock($locked);
            }

            $locked->update(['status' => $to] + $attributes);
            if (in_array($to, self::ITEM_STATUSES, true)) {
                $locked->items()->where('status', '!=', 'cancelled')->update(['status' => $to]);
            }

            OrderStatusHistory::create([
                'order_id' => $locked->id,
                'from_status' => $from,
                'status' => $to,
                'actor_type' => $actorType,
                'actor_id' => $actorId,
                'note' => $note,
            ]);

            if ($type = self::EMAILS[$to] ?? null) {
                // QUEUE_CONNECTION=sync iken e-posta hatası durum değişikliğini bozmasın;
                // başarısız kayıtlar orders:retry-emails ile yeniden denenir.
                DB::afterCommit(fn () => rescue(fn () => Bus::dispatch(new SendOrderEmailJob($locked->id, $type, "order:{$locked->id}:{$type}"))));
            }

            return $locked;
        });

        $order->setRawAttributes($locked->getAttributes(), true);

        return $order;
    }

    private function restock(Order $order): void
    {
        foreach ($order->items as $item) {
            $product = Product::withTrashed()->lockForUpdate()->find($item->product_id);
            if ($product?->track_stock) {
                $stockItem = $item->variant_id ? $product->variants()->lockForUpdate()->find($item->variant_id) : $product;
                $stockItem?->increment('stock', $item->quantity);
            }
        }
    }
}
