<?php

namespace App\Services\Orders;

use App\Jobs\SendOrderEmailJob;
use App\Models\ProductReturn;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\DB;

/**
 * İade talebi durum değişikliklerini müşteri e-postalarına ve sipariş durumuna yansıtır.
 */
class ReturnLifecycle
{
    private const OPEN = ['pending', 'approved', 'shipped_back', 'received'];

    private const EMAILS = [
        'approved' => 'return_approved',
        'refunded' => 'return_refunded',
    ];

    public function __construct(private readonly OrderStatusService $orders) {}

    public function handle(ProductReturn $return, ?string $from): void
    {
        $order = $return->order;
        if (!$order) return;

        if ($from === null) {
            $this->email($return, 'return_received');
            if ($this->orders->canTransition($order, 'return_requested')) {
                $this->orders->transition($order, 'return_requested', note: "İade talebi: {$return->return_number}");
            }
        }

        if ($type = self::EMAILS[$return->status] ?? null) {
            $this->email($return, $type);
        }

        if (!in_array($return->status, ['refunded', 'rejected'], true) || $order->status !== 'return_requested') {
            return;
        }
        if ($order->returns()->whereIn('status', self::OPEN)->exists()) {
            return;
        }

        $activeItems = $order->items()->where('status', '!=', 'cancelled')->pluck('id');
        $refundedItems = $order->returns()->where('status', 'refunded')->pluck('order_item_id');
        $fullyRefunded = $activeItems->diff($refundedItems)->isEmpty();

        $this->orders->transition(
            $order,
            $fullyRefunded ? 'refunded' : 'delivered',
            note: $fullyRefunded ? 'Tüm ürünlerin ücret iadesi yapıldı' : 'İade talebi sonuçlandı',
        );
    }

    private function email(ProductReturn $return, string $type): void
    {
        DB::afterCommit(fn () => rescue(fn () => Bus::dispatch(new SendOrderEmailJob(
            $return->order_id, $type, "return:{$return->id}:{$type}", $return->id,
        ))));
    }
}
