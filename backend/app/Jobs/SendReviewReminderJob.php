<?php

namespace App\Jobs;

use App\Models\OrderItem;
use App\Services\Notifications\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendReviewReminderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly int $orderItemId) {}

    public function handle(WhatsAppService $whatsapp): void
    {
        $item = OrderItem::with('order.user', 'product')->find($this->orderItemId);
        if (!$item || !$item->order?->buyer_phone) return;

        // Daha önce yorum yapmışsa atla
        $alreadyReviewed = $item->order->user?->id
            && \App\Models\Review::where('order_item_id', $item->id)->exists();
        if ($alreadyReviewed) return;

        $whatsapp->sendTemplate(
            to: $item->order->buyer_phone,
            template: config('notifications.whatsapp.templates.review_request'),
            variables: [
                $item->order->buyer_name,
                $item->name,
            ],
            related: $item->order,
        );
    }
}
