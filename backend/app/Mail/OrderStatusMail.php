<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\ProductReturn;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public const TYPES = [
        'order_documents' => [
            'subject' => 'Sipariş Sözleşmeleriniz',
            'intro' => 'Siparişinize ait Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi ekte PDF olarak yer almaktadır. Bu belgeleri saklamanızı öneririz.',
        ],
        'order_received' => [
            'subject' => 'Siparişiniz Alındı',
            'intro' => 'Siparişiniz başarıyla alındı. Ekibimiz siparişinizi kontrol edip onayladığında sizi tekrar bilgilendireceğiz.',
        ],
        'order_confirmed' => [
            'subject' => 'Siparişiniz Onaylandı',
            'intro' => 'Siparişiniz onaylandı ve hazırlık sırasına alındı.',
        ],
        'order_shipped' => [
            'subject' => 'Siparişiniz Kargoya Verildi',
            'intro' => 'Siparişiniz kargo firmasına teslim edildi.',
        ],
        'order_delivered' => [
            'subject' => 'Siparişiniz Teslim Edildi',
            'intro' => 'Siparişiniz teslim edildi. Bizi tercih ettiğiniz için teşekkür ederiz.',
        ],
        'return_received' => [
            'subject' => 'İade Talebiniz Alındı',
            'intro' => 'İade talebiniz bize ulaştı. Talebiniz incelendikten sonra sizi bilgilendireceğiz.',
        ],
        'return_approved' => [
            'subject' => 'İadeniz Onaylandı',
            'intro' => 'İade talebiniz onaylandı.',
        ],
        'return_refunded' => [
            'subject' => 'Ücret İadeniz Gerçekleştirildi',
            'intro' => 'İade ettiğiniz ürünün ücret iadesi ödeme yönteminize gönderildi. Tutarın hesabınıza yansıma süresi bankanıza göre değişebilir.',
        ],
    ];

    public function __construct(
        public readonly Order $order,
        public readonly string $type,
        public readonly ?ProductReturn $productReturn = null,
    ) {
        if (!isset(self::TYPES[$type])) {
            throw new \InvalidArgumentException("Bilinmeyen e-posta türü: {$type}");
        }
    }

    public function subjectLine(): string
    {
        return self::TYPES[$this->type]['subject'] . ' — ' . $this->order->order_number;
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->subjectLine());
    }

    public function attachments(): array
    {
        if ($this->type !== 'order_documents') return [];

        return collect(app(\App\Services\Legal\LegalDocumentService::class)->archiveOrderDocuments($this->order))
            ->map(fn ($doc) => Attachment::fromData(fn () => $doc->pdf(), $doc->filename())->withMime('application/pdf'))
            ->values()->all();
    }

    public function content(): Content
    {
        $frontend = rtrim(config('app.frontend_url'), '/');

        return new Content(markdown: 'emails.orders.status', with: [
            'order' => $this->order,
            'return' => $this->productReturn,
            'heading' => self::TYPES[$this->type]['subject'],
            'intro' => self::TYPES[$this->type]['intro'],
            'customerName' => $this->order->buyer_name ?: ($this->order->user?->name ?? ''),
            'showItems' => str_starts_with($this->type, 'order_'),
            'showCargo' => $this->type === 'order_shipped',
            'trackingUrl' => $this->type === 'order_shipped' ? $this->order->cargo_tracking_url : null,
            'orderUrl' => $frontend . '/hesabim/siparislerim/' . $this->order->order_number,
        ]);
    }
}
