<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SalesContractNotification extends Notification
{
    use Queueable;

    public function __construct(
        public readonly Order $order,
        public readonly string $pdfPath,
    ) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $absolute = storage_path('app/' . $this->pdfPath);

        $message = (new MailMessage())
            ->subject('Mesafeli Satış Sözleşmeniz — ' . $this->order->order_number)
            ->greeting('Merhaba ' . ($notifiable->name ?? ''))
            ->line('Sipariş No: **' . $this->order->order_number . '**')
            ->line('Aşağıda mesafeli satış sözleşmenizin PDF kopyası yer almaktadır.')
            ->line('Sipariş detayları için web sitemizi ziyaret edebilirsiniz.')
            ->salutation('MSO Teknoloji');

        if (is_file($absolute)) {
            $message->attach($absolute, ['as' => 'mesafeli-satis-sozlesmesi.pdf', 'mime' => 'application/pdf']);
        }

        return $message;
    }
}
