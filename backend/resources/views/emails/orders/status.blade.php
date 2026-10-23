<x-mail::message>
# {{ $heading }}

Merhaba {{ $customerName }},

{{ $intro }}

**Sipariş No:** {{ $order->order_number }}<br>
**Sipariş Tarihi:** {{ $order->created_at?->timezone('Europe/Istanbul')->format('d.m.Y H:i') }}

@if ($return)
**İade No:** {{ $return->return_number }}<br>
**Ürün:** {{ $return->orderItem?->name }}
@if ($return->cargo_code)
<br>**İade Kargo Kodu:** {{ $return->cargo_code }}
@endif
@if ($return->refund_amount)
<br>**İade Tutarı:** {{ number_format((float) $return->refund_amount, 2, ',', '.') }} TL
@endif
@endif

@if ($showCargo && $order->cargo_tracking_number)
**Kargo Firması:** {{ $order->cargo_company }}<br>
**Takip No:** {{ $order->cargo_tracking_number }}
@endif

@if ($showItems)
<x-mail::table>
| Ürün | Adet | Tutar |
|:-----|:----:|------:|
@foreach ($order->items as $item)
| {{ $item->name }} | {{ $item->quantity }} | {{ number_format((float) $item->total_price, 2, ',', '.') }} TL |
@endforeach
| **Toplam** | | **{{ number_format((float) $order->total, 2, ',', '.') }} TL** |
</x-mail::table>
@endif

@if ($trackingUrl)
<x-mail::button :url="$trackingUrl">
Kargom Nerede?
</x-mail::button>
@endif

<x-mail::button :url="$orderUrl" :color="$trackingUrl ? 'success' : 'primary'">
Siparişimi Görüntüle
</x-mail::button>

Sorularınız için bu e-postayı yanıtlayabilirsiniz.

Teşekkürler,<br>
{{ config('app.name') }}
</x-mail::message>
