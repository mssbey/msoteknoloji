<?php

namespace App\Listeners;

use App\Events\OrderPlaced;
use App\Jobs\GenerateOrderContractJob;
use App\Services\Notifications\SmsService;
use App\Services\Notifications\WhatsAppService;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendOrderPlacedNotifications implements ShouldQueue
{
    public function __construct(
        private readonly SmsService $sms,
        private readonly WhatsAppService $whatsapp,
    ) {}

    public function handle(OrderPlaced $event): void
    {
        $order = $event->order->loadMissing('items', 'user');
        $phone = $order->buyer_phone;
        if (!$phone) return;

        $smsText = sprintf(
            'Siparişiniz alındı! Sipariş No: %s, Tutar: %s TL. Detay: msoteknoloji.com.tr/siparisler/%s',
            $order->order_number,
            number_format((float) $order->total, 2, ',', '.'),
            $order->order_number,
        );

        if ($order->user?->sms_opt_in ?? true) {
            $this->sms->send($phone, $smsText, ['template' => 'order_confirmed'], $order);
        }

        if ($order->user?->whatsapp_opt_in ?? true) {
            $this->whatsapp->sendTemplate(
                to: $phone,
                template: config('notifications.whatsapp.templates.order_confirmed'),
                variables: [
                    $order->buyer_name,
                    $order->order_number,
                    number_format((float) $order->total, 2, ',', '.'),
                ],
                related: $order,
            );
        }

        // Mesafeli satış sözleşmesi PDF üretimi (e-posta + storage)
        GenerateOrderContractJob::dispatch($order->id);
    }
}
