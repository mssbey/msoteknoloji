<?php

namespace App\Services\Legal;

use App\Models\Order;
use App\Models\OrderDocument;
use Barryvdh\DomPDF\Facade\Pdf;

/**
 * Hukuki metinler resources/legal/*.json dosyalarından gelir
 * (kaynak: proje kökündeki .docx dosyaları, scripts/import_legal_docs.py).
 */
class LegalDocumentService
{
    public const ORDER_DOCUMENTS = [
        'on-bilgilendirme-formu' => 'Ön Bilgilendirme Formu',
        'mesafeli-satis-sozlesmesi' => 'Mesafeli Satış Sözleşmesi',
    ];

    private const PAYMENT_METHODS = [
        'bank_transfer' => 'Havale / EFT',
        'credit_card' => 'Kredi / banka kartı',
    ];

    private array $definitions = [];

    public function definition(string $slug): array
    {
        return $this->definitions[$slug] ??= json_decode(
            file_get_contents(resource_path("legal/{$slug}.json")), true, flags: JSON_THROW_ON_ERROR,
        );
    }

    public function version(string $slug): string
    {
        return $this->definition($slug)['version'];
    }

    /** Sipariş (kaydedilmemiş taslak da olabilir) için yer tutucu değerleri */
    public function orderVariables(Order $order): array
    {
        $shipping = $order->shipping_address ?? [];
        $billing = $order->billing_address ?: $shipping;
        $created = ($order->created_at ?? now())->timezone('Europe/Istanbul');
        $accepted = data_get($order->metadata, 'legal.accepted_at');
        $accepted = $accepted ? \Illuminate\Support\Carbon::parse($accepted)->timezone('Europe/Istanbul') : $created;
        $money = fn ($v) => number_format((float) $v, 2, ',', '.') . ' TL';
        $name = fn (array $a) => trim(($a['company_name'] ?? '') ?: trim(($a['first_name'] ?? '') . ' ' . ($a['last_name'] ?? '')));
        $address = fn (array $a) => trim(implode(', ', array_filter([
            $a['address'] ?? $a['address_line'] ?? null,
            trim(($a['district'] ?? '') . ' / ' . ($a['city'] ?? ''), ' /'),
        ])));
        $number = $order->order_number ?: 'Sipariş onayında oluşturulur';
        $frontend = rtrim(config('app.frontend_url'), '/');

        return [
            'sozlesme_no' => $order->order_number ? 'MSS-' . $order->order_number : $number,
            'siparis_no' => $number,
            'siparis_tarihi' => $created->format('d.m.Y'),
            'siparis_saati' => $created->format('H:i'),
            'onay_tarihi_saati' => $accepted->format('d.m.Y H:i'),
            'musteri_adi' => $name($billing) ?: $name($shipping),
            'musteri_kimlik_no' => $billing['tax_number'] ?? $billing['tc_kimlik'] ?? 'Belirtilmedi',
            'musteri_eposta' => $order->customer_email ?? '-',
            'musteri_telefon' => $shipping['phone'] ?? $billing['phone'] ?? '-',
            'fatura_adresi' => $address($billing),
            'teslimat_adresi' => $address($shipping),
            'teslim_alacak_kisi' => $name($shipping),
            'ara_toplam' => $money($order->subtotal),
            'indirim_tutari' => $money($order->discount_amount),
            'kargo_ucreti' => (float) $order->shipping_cost > 0 ? $money($order->shipping_cost) : 'Ücretsiz',
            'vergi_tutari' => (float) $order->tax_amount > 0 ? $money($order->tax_amount) : 'Fiyatlara KDV dâhildir',
            'genel_toplam' => $money($order->total),
            'odeme_yontemi' => self::PAYMENT_METHODS[$order->payment_method] ?? ($order->payment_method ?: '-'),
            'kargo_firmasi' => $order->cargo_company ?: config('legal.carrier'),
            'tahmini_teslimat' => config('legal.estimated_delivery'),
            'iade_talep_linki' => $frontend . '/hesabim/siparislerim' . ($order->order_number ? '/' . $order->order_number : ''),
            'iade_kargo_firmasi' => config('legal.return_carrier'),
            'iade_kargo_kodu' => 'İade talebi oluşturulduğunda hesabınızda gösterilir',
            'iade_adresi' => config('legal.return_address'),
            'satici_eposta' => config('legal.seller.email'),
            'sozlesme_versiyonu' => $this->version('mesafeli-satis-sozlesmesi'),
            'form_versiyonu' => $this->version('on-bilgilendirme-formu'),
        ];
    }

    /** Ödeme öncesi önizleme ve PDF için ortak HTML gövdesi */
    public function renderBody(string $slug, Order $order): string
    {
        return view('legal.partials.blocks', [
            'blocks' => $this->definition($slug)['blocks'],
            'vars' => $this->orderVariables($order),
            'items' => $order->items,
        ])->render();
    }

    public function renderPdf(string $slug, Order $order): string
    {
        return Pdf::loadView('legal.document', [
            'title' => $this->definition($slug)['title'],
            'body' => $this->renderBody($slug, $order),
        ])->setOption('isFontSubsettingEnabled', true)->setPaper('a4', 'portrait')->output();
    }

    /** Siparişe ait sözleşme ve ön bilgilendirme PDF'lerini üretip arşivler. */
    public function archiveOrderDocuments(Order $order): array
    {
        $order->loadMissing(['items', 'user']);
        $documents = [];
        foreach (array_keys(self::ORDER_DOCUMENTS) as $slug) {
            $documents[$slug] = OrderDocument::where('order_id', $order->id)->where('type', $slug)->first()
                ?? $this->store($order, $slug);
        }
        return $documents;
    }

    private function store(Order $order, string $slug): OrderDocument
    {
        $pdf = $this->renderPdf($slug, $order);

        return OrderDocument::create([
            'order_id' => $order->id,
            'type' => $slug,
            'version' => $this->version($slug),
            'sha256' => hash('sha256', $pdf),
            'contents' => base64_encode($pdf),
        ]);
    }
}
