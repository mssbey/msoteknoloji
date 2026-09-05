<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Mesafeli Satış Sözleşmesi</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #333; margin: 20px; line-height: 1.6; }
        h1 { font-size: 14px; text-align: center; margin-bottom: 5px; text-transform: uppercase; }
        h2 { font-size: 12px; margin-top: 15px; border-bottom: 1px solid #ccc; padding-bottom: 3px; }
        .header { text-align: center; margin-bottom: 20px; }
        .logo { font-size: 18px; font-weight: bold; color: #0066FF; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        td, th { border: 1px solid #ddd; padding: 5px 8px; font-size: 10px; }
        th { background: #f5f5f5; font-weight: bold; }
        .total { font-weight: bold; font-size: 13px; }
        .footer { margin-top: 30px; font-size: 10px; color: #777; border-top: 1px solid #eee; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">MSO Teknoloji</div>
        <div>msoteknoloji.com.tr</div>
    </div>

    <h1>MESAFELİ SATIŞ SÖZLEŞMESİ</h1>
    <p style="text-align:center; font-size:10px;">Sözleşme No: {{ $order->order_number }} | Tarih: {{ $order->created_at->format('d.m.Y H:i') }}</p>

    <h2>1. SATICI BİLGİLERİ</h2>
    <table>
        <tr><td style="width:40%"><strong>Firma Adı:</strong></td><td>{{ $seller->company_name }}</td></tr>
        <tr><td><strong>Vergi No:</strong></td><td>{{ $seller->tax_number }}</td></tr>
        <tr><td><strong>E-posta:</strong></td><td>{{ $seller->email }}</td></tr>
        <tr><td><strong>Web Sitesi:</strong></td><td>msoteknoloji.com.tr</td></tr>
    </table>

    <h2>2. ALICI BİLGİLERİ</h2>
    <table>
        <tr><td style="width:40%"><strong>Ad Soyad:</strong></td><td>{{ $buyer['name'] }}</td></tr>
        <tr><td><strong>Adres:</strong></td><td>{{ $buyer['address'] }}, {{ $buyer['district'] }}/{{ $buyer['city'] }}</td></tr>
        <tr><td><strong>Telefon:</strong></td><td>{{ $buyer['phone'] }}</td></tr>
        <tr><td><strong>E-posta:</strong></td><td>{{ $buyer['email'] }}</td></tr>
    </table>

    <h2>3. ÜRÜN BİLGİLERİ</h2>
    <table>
        <tr>
            <th>Ürün Adı</th>
            <th>Miktar</th>
            <th>Birim Fiyat</th>
            <th>Toplam</th>
        </tr>
        @foreach($order->items as $item)
        <tr>
            <td>{{ $item->name }}</td>
            <td>{{ $item->quantity }}</td>
            <td>{{ number_format($item->unit_price, 2) }} TL</td>
            <td>{{ number_format($item->total_price, 2) }} TL</td>
        </tr>
        @endforeach
        <tr>
            <td colspan="3" style="text-align:right"><strong>Kargo:</strong></td>
            <td>{{ number_format($order->shipping_cost, 2) }} TL</td>
        </tr>
        @if($order->discount_amount > 0)
        <tr>
            <td colspan="3" style="text-align:right"><strong>İndirim:</strong></td>
            <td>-{{ number_format($order->discount_amount, 2) }} TL</td>
        </tr>
        @endif
        <tr class="total">
            <td colspan="3" style="text-align:right"><strong>TOPLAM (KDV Dahil):</strong></td>
            <td><strong>{{ number_format($order->total, 2) }} TL</strong></td>
        </tr>
    </table>

    <h2>4. TESLİMAT BİLGİLERİ</h2>
    <p>Ürün/ürünler, sipariş tarihinden itibaren <strong>1-5 iş günü</strong> içinde kargo firmasına teslim edilecektir.</p>

    <h2>5. CAYMA HAKKI</h2>
    <p>Alıcı, sözleşmenin kurulmasından itibaren <strong>14 gün içinde</strong> herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir. Cayma hakkının kullanılması için <strong>destek@msoteknoloji.com.tr</strong> adresine veya kullanıcı paneli üzerinden iade talebi oluşturulması gerekmektedir.</p>

    <h2>6. UYUŞMAZLIK ÇÖZÜMÜ</h2>
    <p>Bu sözleşmeden doğacak uyuşmazlıklarda <strong>İstanbul</strong> Tüketici Sorunları Hakem Heyetleri veya Tüketici Mahkemeleri yetkilidir.</p>

    <div class="footer">
        <p>Bu belge, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında düzenlenmiştir.</p>
        <p>© {{ date('Y') }} MSO Teknoloji — msoteknoloji.com.tr</p>
    </div>
</body>
</html>
