<?php

namespace App\Listeners;

use App\Events\OrderDelivered;
use App\Jobs\SendReviewReminderJob;
use App\Services\Notifications\WhatsAppService;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendOrderDeliveredNotifications implements ShouldQueue
{
    public function __construct(private readonly WhatsAppService $whatsapp) {}

    public function handle(OrderDelivered $event): void
    {
        $item = $event->item->loadMissing('order.user');
        $order = $item->order;
        $phone = $order?->buyer_phone;
        if (!$phone) return;

        if ($order->user?->whatsapp_opt_in ?? true) {
            $this->whatsapp->sendTemplate(
                to: $phone,
                template: config('notifications.whatsapp.templates.order_delivered'),
                variables: [$order->buyer_name, $order->order_number],
                related: $order,
            );
        }

        // 3 gün sonra yorum isteği
        SendReviewReminderJob::dispatch($item->id)->delay(now()->addDays(3));
    }
}
