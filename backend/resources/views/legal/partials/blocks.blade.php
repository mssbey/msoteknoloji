@php
    // Yer tutucuları ({{alan}}) değerleriyle değiştirir; bilinmeyen alanlar "-" olur.
    $fill = fn (string $text) => preg_replace_callback('/\{\{\s*([a-z_]+)\s*\}\}/', fn ($m) => $vars[$m[1]] ?? '-', $text);
    $money = fn ($v) => number_format((float) $v, 2, ',', '.') . ' TL';
    $list = [];
@endphp
<div class="legal-doc">
@foreach ($blocks as $i => $block)
    @if ($block['type'] === 'item')
        @php $list[] = $fill($block['text']); @endphp
        @if (($blocks[$i + 1]['type'] ?? null) !== 'item')
            <ul>@foreach ($list as $li)<li>{{ $li }}</li>@endforeach</ul>
            @php $list = []; @endphp
        @endif
        @continue
    @endif
    @switch($block['type'])
        @case('title')
            <h1 class="legal-title">{{ $fill($block['text']) }}</h1>
            @break
        @case('heading')
            <h2 class="legal-heading">{{ $fill($block['text']) }}</h2>
            @break
        @case('field')
            <p class="legal-field"><b>{{ $fill($block['label']) }}:</b> {{ $fill($block['text']) }}</p>
            @break
        @case('products')
            <table>
                <thead><tr><th>Ürün</th><th>Ürün kodu</th><th>Seçenek</th><th class="num">Adet</th><th class="num">Birim fiyat (KDV dâhil)</th><th class="num">Toplam (KDV dâhil)</th></tr></thead>
                <tbody>
                @foreach ($items as $item)
                    <tr>
                        <td>{{ $item->name }}</td>
                        <td>{{ $item->sku ?: '-' }}</td>
                        <td>{{ collect($item->variant_options ?? [])->filter(fn ($v) => is_scalar($v))->map(fn ($v, $k) => is_string($k) ? "$k: $v" : $v)->implode(', ') ?: '-' }}</td>
                        <td class="num">{{ $item->quantity }}</td>
                        <td class="num">{{ $money($item->unit_price) }}</td>
                        <td class="num">{{ $money($item->total_price) }}</td>
                    </tr>
                @endforeach
                </tbody>
            </table>
            @break
        @case('table')
            <table>
                @foreach ($block['rows'] as $r => $row)
                    <tr>@foreach ($row as $cell)@if ($r === 0)<th>{{ $fill($cell) }}</th>@else<td>{{ $fill($cell) }}</td>@endif @endforeach</tr>
                @endforeach
            </table>
            @break
        @default
            <p>@if (!empty($block['strong']))<b>{{ $fill($block['text']) }}</b>@else{{ $fill($block['text']) }}@endif</p>
    @endswitch
@endforeach
</div>
