<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use App\Services\Notifications\SmsService;
use App\Services\Notifications\WhatsAppService;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendOrderShippedNotifications implements ShouldQueue
{
    public function __construct(
        private readonly SmsService $sms,
        private readonly WhatsAppService $whatsapp,
    ) {}

    public function handle(OrderShipped $event): void
    {
        $item = $event->item->loadMissing('order.user');
        $order = $item->order;
        $phone = $order?->buyer_phone;
        if (!$phone) return;

        $sms = sprintf(
            'Siparişiniz kargoya verildi! %s — Takip: %s',
            $item->cargo_company,
            $item->cargo_tracking_number,
        );

        if ($order->user?->sms_opt_in ?? true) {
            $this->sms->send($phone, $sms, ['template' => 'order_shipped'], $order);
        }

        if ($order->user?->whatsapp_opt_in ?? true) {
            $this->whatsapp->sendTemplate(
                to: $phone,
                template: config('notifications.whatsapp.templates.order_shipped'),
                variables: [
                    $order->buyer_name,
                    $order->order_number,
                    $item->cargo_company ?? '-',
                    $item->cargo_tracking_number ?? '-',
                    $item->cargo_tracking_url ?? '-',
                ],
                related: $order,
            );
        }
    }
}
