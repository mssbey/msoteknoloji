# 13 — B2B PORTAL & BAYİ SİSTEMİ

## 13.1 B2B İş Akışı

```
KURUMSAL SATIS SÜRECİ:

1. FİRMA KAYIT
   Firma bilgilerini girer → Admin onaylar → Giriş yetkisi verilir

2. KİŞİSEL FİYATLAR
   Giriş yapan firma → Özel fiyat listesini görür
   Normal müşteriler aynı fiyatları GÖREMEZ

3. SİPARİŞ YOLLARI
   a. Normal Sepet (tek tek ekle)
   b. Toplu Sipariş Ekranı
   c. Excel ile Sipariş
   d. Teklif İste → Satıcı fiyat verir → Firma kabul eder

4. ÖDEME SEÇENEKLERİ
   a. Anlık Ödeme (Kredi Kartı/Havale)
   b. Cari Hesap (Vadeli - risk limiti dahilinde)
   c. Teklif Bazlı Özel Ödeme

5. FATURA & MUHASEBE
   E-fatura otomatik kesilir
   ERP entegrasyonu (Logo/Mikro/Nebim/Eta)
```

## 13.2 B2B Özel Fiyatlandırma Sistemi

```php
// app/Services/B2B/B2BPricingService.php

class B2BPricingService
{
    public function getProductPrice(Product $product, B2BFirm $firm): float
    {
        // Öncelik sırası:
        // 1. Firmaya özel ürün fiyatı
        // 2. Firmaya özel fiyat listesi
        // 3. Bayi seviyesi fiyatlandırması
        // 4. Genel B2B indirim oranı
        // 5. Normal fiyat
        
        // 1. Firmaya özel ürün fiyatı
        $specificPrice = B2BPriceListItem::query()
            ->whereHas('priceList', fn($q) => $q->where('firm_id', $firm->id)->where('is_active', true))
            ->where('product_id', $product->id)
            ->where(fn($q) => $q->whereNull('min_qty')->orWhere('min_qty', 1))
            ->first();
        
        if ($specificPrice) return $specificPrice->custom_price;
        
        // 2. Firmaya özel fiyat listesi (kategori bazlı indirim)
        $firmPriceList = B2BPriceList::where('firm_id', $firm->id)
            ->where('is_active', true)
            ->where(fn($q) => $q->whereNull('valid_until')->orWhere('valid_until', '>=', today()))
            ->first();
        
        if ($firmPriceList) {
            return $this->applyDiscount($product->price, $firmPriceList);
        }
        
        // 3. Genel bayi/firma indirimi
        if ($firm->discount_rate > 0) {
            return round($product->price * (1 - $firm->discount_rate / 100), 2);
        }
        
        return $product->price;
    }
    
    public function getPriceForQuantity(Product $product, B2BFirm $firm, int $qty): float
    {
        // Miktar bazlı fiyatlandırma (kademeli indirim)
        $qtyPrices = B2BPriceListItem::query()
            ->whereHas('priceList', fn($q) => $q->where('firm_id', $firm->id))
            ->where('product_id', $product->id)
            ->where('min_qty', '<=', $qty)
            ->orderByDesc('min_qty')
            ->first();
        
        if ($qtyPrices) return $qtyPrices->custom_price;
        
        return $this->getProductPrice($product, $firm);
    }
    
    private function applyDiscount(float $price, B2BPriceList $list): float
    {
        return match($list->discount_type) {
            'percentage' => round($price * (1 - $list->discount_value / 100), 2),
            'fixed' => max(0, $price - $list->discount_value),
            default => $price,
        };
    }
}
```

## 13.3 Cari Hesap & Risk Yönetimi

```php
// app/Services/B2B/CurrentAccountService.php

class CurrentAccountService
{
    public function canPlaceOrder(B2BFirm $firm, float $orderAmount): array
    {
        $currentBalance = $this->getCurrentBalance($firm->id);
        $availableCredit = $firm->credit_limit - $currentBalance;
        
        if ($orderAmount > $availableCredit) {
            return [
                'allowed' => false,
                'reason' => 'Kredi limitiniz yetersiz',
                'required' => $orderAmount,
                'available' => $availableCredit,
                'credit_limit' => $firm->credit_limit,
                'current_balance' => $currentBalance,
            ];
        }
        
        // Vadesi geçmiş borç kontrolü
        $overdueAmount = $this->getOverdueAmount($firm->id);
        if ($overdueAmount > 0) {
            return [
                'allowed' => false,
                'reason' => 'Vadesi geçmiş borcunuz bulunuyor',
                'overdue_amount' => $overdueAmount,
            ];
        }
        
        return ['allowed' => true, 'available_credit' => $availableCredit];
    }
    
    public function debit(B2BFirm $firm, float $amount, string $description, $reference = null): void
    {
        $currentBalance = $this->getCurrentBalance($firm->id);
        
        B2BCurrentAccount::create([
            'firm_id' => $firm->id,
            'seller_id' => $reference?->seller_id,
            'type' => 'debit',
            'amount' => $amount,
            'balance_after' => $currentBalance + $amount,
            'description' => $description,
            'reference_type' => $reference ? get_class($reference) : null,
            'reference_id' => $reference?->id,
            'due_date' => now()->addDays($firm->payment_terms),
        ]);
    }
    
    public function credit(B2BFirm $firm, float $amount, string $description): void
    {
        $currentBalance = $this->getCurrentBalance($firm->id);
        
        B2BCurrentAccount::create([
            'firm_id' => $firm->id,
            'type' => 'credit',
            'amount' => $amount,
            'balance_after' => $currentBalance - $amount,
            'description' => $description,
        ]);
    }
    
    public function getCurrentBalance(int $firmId): float
    {
        return B2BCurrentAccount::where('firm_id', $firmId)
            ->latest()
            ->value('balance_after') ?? 0;
    }
    
    public function getOverdueAmount(int $firmId): float
    {
        return B2BCurrentAccount::where('firm_id', $firmId)
            ->where('type', 'debit')
            ->whereNull('paid_at')
            ->where('due_date', '<', today())
            ->sum('amount');
    }
}
```

## 13.4 Excel ile Toplu Sipariş

```php
// app/Http/Controllers/B2B/BulkOrderController.php

class BulkOrderController extends Controller
{
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:10240'],
        ]);
        
        $path = $request->file('file')->store('b2b-imports');
        $firm = auth()->user()->b2bFirm;
        
        // Job ile arka planda işle
        $jobId = ProcessB2BBulkOrderJob::dispatch($path, $firm)->onQueue('import');
        
        return response()->json([
            'success' => true,
            'message' => 'Dosya yüklendi, işleniyor...',
            'job_id' => $jobId->id,
        ]);
    }
}

// app/Jobs/ProcessB2BBulkOrderJob.php

class ProcessB2BBulkOrderJob implements ShouldQueue
{
    public function handle(B2BPricingService $pricing): void
    {
        $rows = Excel::toArray([], storage_path('app/' . $this->path))[0];
        
        $items = [];
        $errors = [];
        
        // Başlık satırını atla
        foreach (array_slice($rows, 1) as $index => $row) {
            $sku = trim($row[0] ?? '');
            $qty = (int)($row[1] ?? 0);
            $note = trim($row[2] ?? '');
            
            if (empty($sku) || $qty <= 0) continue;
            
            $product = Product::where('sku', $sku)->where('status', 'approved')->first();
            
            if (!$product) {
                $errors[] = "Satır " . ($index + 2) . ": SKU '$sku' bulunamadı";
                continue;
            }
            
            if ($product->stock < $qty) {
                $errors[] = "Satır " . ($index + 2) . ": '$sku' için yeterli stok yok (Mevcut: {$product->stock})";
                continue;
            }
            
            $price = $pricing->getPriceForQuantity($product, $this->firm, $qty);
            
            $items[] = [
                'product_id' => $product->id,
                'sku' => $sku,
                'quantity' => $qty,
                'unit_price' => $price,
                'total_price' => $price * $qty,
                'note' => $note,
            ];
        }
        
        // Sonucu firmaya bildir
        $this->firm->user->notify(new B2BBulkOrderReadyNotification($items, $errors));
    }
}
```

## 13.5 ERP Entegrasyonları

```php
// app/Services/B2B/ERP/LogoIntegration.php

interface ERPIntegrationInterface
{
    public function syncOrder(Order $order): bool;
    public function syncInvoice(Order $order): string;  // Fatura no
    public function syncProduct(Product $product): bool;
    public function syncCustomer(B2BFirm $firm): bool;
    public function getStockLevels(array $skus): array;
}

class LogoERPIntegration implements ERPIntegrationInterface
{
    private string $baseUrl;
    private string $apiKey;
    
    public function syncOrder(Order $order): bool
    {
        $payload = [
            'OrderType' => 'SATIS_SIPARISI',
            'CustomerCode' => $order->b2bFirm->erp_code,
            'Date' => $order->created_at->format('Y-m-d'),
            'Lines' => $order->items->map(fn($item) => [
                'ItemCode' => $item->sku,
                'Quantity' => $item->quantity,
                'UnitPrice' => $item->unit_price,
                'DiscountRate' => 0,
            ])->toArray(),
            'ExternalOrderNo' => $order->order_number,
        ];
        
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type' => 'application/json',
        ])->post("{$this->baseUrl}/api/SalesOrders", $payload);
        
        if ($response->successful()) {
            $order->update(['erp_order_id' => $response->json('OrderID')]);
            return true;
        }
        
        Log::error('Logo ERP sipariş sync hatası', [
            'order' => $order->order_number,
            'error' => $response->json(),
        ]);
        
        return false;
    }
}

// Desteklenen ERP Sistemleri:
// - Logo Tiger / Logo Go (REST API)
// - Mikro (SOAP/REST API)
// - Nebim V3 (REST API)
// - Eta (REST API)
// - SAP Business One (REST API)
```

## 13.6 B2B Portal Ekranları

```
B2B PORTAL — FİRMA DASHBOARD
──────────────────────────────────────────────────────────────────────────

Hoşgeldiniz, ABC Teknoloji A.Ş.
─────────────────────────────────

┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ KREDİ LİMİTİ│ │ KULLANILANLAR│ │ KULLANILABİLİR│ │ VADELİ BORÇ  │
│  100,000 TL  │ │  35,420 TL   │ │  64,580 TL   │ │  12,400 TL   │
│              │ │              │ │              │ │  (15 Haz'da) │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

FAVORI ÜRÜNLER (Hızlı Sipariş):
┌──────────┬──────────────────────────┬────────┬────────┬─────────────────┐
│ SKU      │ ÜRÜN ADI                 │ STOK   │ FİYAT  │ ADET & SİPARİŞ  │
├──────────┼──────────────────────────┼────────┼────────┼─────────────────┤
│APKL-001  │ iPhone 15 Pro Kılıf     │  234   │ 180 TL │ [___] [Sepete]  │
│SCHR-065  │ Samsung 65W Şarj        │   89   │ 380 TL │ [___] [Sepete]  │
│ANKR-2M   │ Anker USB-C 2M          │  456   │ 110 TL │ [___] [Sepete]  │
└──────────┴──────────────────────────┴────────┴────────┴─────────────────┘
[Excel ile Toplu Sipariş] [Son Siparişi Tekrarla]

CAR HESAP ÖZETI:
Son İşlemler                              Bakiye: 35,420 TL (Borç)
──────────────────────────────────────────────────────
01.06.2026  Sipariş #B2B-2026-0892        +8,400 TL   35,420 TL
28.05.2026  Ödeme                         -20,000 TL  27,020 TL
25.05.2026  Sipariş #B2B-2026-0845        +12,300 TL  47,020 TL

VADE DURUMU:
✅ 0-30 gün:   5,000 TL  (normal)
⚠️ 31-60 gün:  7,400 TL  (yaklaşıyor)
🔴 60+ gün:        0 TL
```

## 13.7 Teklif İste Sistemi

```
TEKLİF TALEP FORMU
──────────────────────────────────────────────────────────────────────────

Talep No: TKL-2026-0123 | Durum: ⏳ Satıcı Değerlendiriyor

Satıcı: TechStore Pro

ÜRÜNLER:
┌──────────────────────────┬──────┬────────────────┬─────────────────────┐
│ ÜRÜN                     │ ADET │ LİSTE FİYATI   │ TALEP EDİLEN FİYAT  │
├──────────────────────────┼──────┼────────────────┼─────────────────────┤
│ iPhone 15 Pro Kılıf      │ 100  │ 299 TL         │ 220 TL              │
│ Samsung Şarj 65W         │  50  │ 489 TL         │ 390 TL              │
└──────────────────────────┴──────┴────────────────┴─────────────────────┘

Notlar: Temmuz ayı için kampanya stoku. Aylık tekrarlayan sipariş planlıyoruz.

Talep Edilen Teslim: 10 Haziran 2026
Ödeme Şekli: 30 gün vadeli cari hesap

[Teklifi Gönder] [Müzakere Et] [Reddet]

GEÇMIŞ TEKLİFLER:
TKL-2026-0098  Apple Aksesuar    12,400 TL  ✅ Kabul edildi  28.05.2026
TKL-2026-0076  Samsung Ürünler   8,200 TL   ❌ Reddedildi    15.05.2026
```
