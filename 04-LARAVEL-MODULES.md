# 04 — LARAVEL MODÜLLERİ & BACKEND

## 4.1 Proje Klasör Yapısı

```
app/
├── Console/
│   └── Commands/
│       ├── SyncCargoTracking.php
│       ├── ProcessAutomations.php
│       ├── SyncMeilisearch.php
│       ├── ExpirePoints.php
│       └── GenerateDailyReports.php
│
├── Events/
│   ├── OrderPlaced.php
│   ├── OrderStatusChanged.php
│   ├── CartAbandoned.php
│   ├── ProductViewed.php
│   └── PaymentCompleted.php
│
├── Http/
│   ├── Controllers/
│   │   ├── Auth/
│   │   ├── Public/
│   │   ├── Seller/
│   │   ├── Admin/
│   │   ├── B2B/
│   │   ├── Affiliate/
│   │   └── Webhook/
│   ├── Middleware/
│   │   ├── EnsureSellerAccess.php
│   │   ├── EnsurePackageFeature.php
│   │   ├── EnsureB2BAccess.php
│   │   ├── RateLimitApi.php
│   │   └── TrackUserActivity.php
│   └── Resources/
│       ├── ProductResource.php
│       ├── OrderResource.php
│       └── ...
│
├── Jobs/
│   ├── ProcessOrderJob.php
│   ├── SendWhatsAppJob.php
│   ├── SendSMSJob.php
│   ├── SendEmailJob.php
│   ├── ImportProductsJob.php
│   ├── SyncCargoJob.php
│   ├── GenerateAIContentJob.php
│   ├── ProcessAutomationJob.php
│   ├── UpdateSearchIndexJob.php
│   └── GenerateReportJob.php
│
├── Listeners/
│   ├── HandleOrderPlaced.php
│   ├── AwardPurchasePoints.php
│   ├── TriggerCartAbandonedFlow.php
│   └── UpdateSellerBalance.php
│
├── Models/
│   ├── User.php
│   ├── Seller.php
│   ├── Store.php
│   ├── Product.php
│   ├── ProductVariant.php
│   ├── Order.php
│   ├── OrderItem.php
│   ├── Shipment.php
│   ├── Payment.php
│   ├── Category.php
│   ├── Brand.php
│   ├── Coupon.php
│   ├── Campaign.php
│   ├── Review.php
│   ├── BlogPost.php
│   ├── B2BFirm.php
│   ├── AutomationWorkflow.php
│   ├── AdCampaign.php
│   ├── LoyaltyPoint.php
│   ├── AffiliatePartner.php
│   └── Subscription.php
│
├── Notifications/
│   ├── OrderConfirmationNotification.php
│   ├── OrderShippedNotification.php
│   ├── PaymentSuccessNotification.php
│   └── LowStockNotification.php
│
├── Observers/
│   ├── ProductObserver.php
│   ├── OrderObserver.php
│   └── SellerObserver.php
│
├── Policies/
│   ├── ProductPolicy.php
│   ├── OrderPolicy.php
│   └── SellerPolicy.php
│
└── Services/
    ├── (bkz. 1.5 Servis Listesi)
```

## 4.2 Queue Konfigürasyonu (Laravel Horizon)

```php
// config/horizon.php

'environments' => [
    'production' => [
        'supervisor-default' => [
            'maxProcesses' => 10,
            'balanceMaxShift' => 1,
            'balanceCooldown' => 3,
        ],
        
        // Kritik işler - hızlı
        'supervisor-critical' => [
            'queue' => ['critical'],
            'maxProcesses' => 5,
            'tries' => 3,
            'timeout' => 60,
        ],
        
        // Ödeme & sipariş
        'supervisor-orders' => [
            'queue' => ['orders', 'payments'],
            'maxProcesses' => 8,
            'tries' => 5,
            'timeout' => 120,
        ],
        
        // Bildirimler
        'supervisor-notifications' => [
            'queue' => ['whatsapp', 'sms', 'email', 'push'],
            'maxProcesses' => 15,
            'tries' => 3,
            'timeout' => 30,
        ],
        
        // AI işleri - yavaş
        'supervisor-ai' => [
            'queue' => ['ai'],
            'maxProcesses' => 3,
            'tries' => 2,
            'timeout' => 300,
        ],
        
        // Import işleri
        'supervisor-import' => [
            'queue' => ['import'],
            'maxProcesses' => 2,
            'tries' => 2,
            'timeout' => 600,
        ],
        
        // Kargo takip
        'supervisor-cargo' => [
            'queue' => ['cargo'],
            'maxProcesses' => 5,
            'tries' => 3,
            'timeout' => 30,
        ],
    ],
],
```

## 4.3 Model Örneği — Product.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Scout\Searchable;
use App\Observers\ProductObserver;

class Product extends Model
{
    use HasFactory, SoftDeletes, Searchable;

    protected $fillable = [
        'seller_id', 'store_id', 'category_id', 'brand_id',
        'uuid', 'name', 'slug', 'sku', 'barcode',
        'description', 'short_description',
        'price', 'sale_price', 'cost_price', 'currency',
        'tax_rate', 'tax_included',
        'stock', 'min_stock_alert', 'track_stock',
        'weight', 'width', 'height', 'depth',
        'status', 'is_active', 'is_featured', 'is_digital',
        'seo_title', 'seo_description', 'seo_keywords',
        'ai_score', 'ai_suggestions', 'metadata',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'tax_included' => 'boolean',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'ai_suggestions' => 'array',
        'metadata' => 'array',
    ];

    protected static function booted(): void
    {
        static::observe(ProductObserver::class);
    }

    // Relationships
    public function seller() { return $this->belongsTo(Seller::class); }
    public function store() { return $this->belongsTo(Store::class); }
    public function category() { return $this->belongsTo(Category::class); }
    public function brand() { return $this->belongsTo(Brand::class); }
    public function variants() { return $this->hasMany(ProductVariant::class); }
    public function images() { return $this->hasMany(ProductImage::class)->orderBy('sort_order'); }
    public function videos() { return $this->hasMany(ProductVideo::class); }
    public function attributes() { return $this->hasMany(ProductAttribute::class)->orderBy('sort_order'); }
    public function reviews() { return $this->hasMany(Review::class)->where('is_approved', true); }
    public function questions() { return $this->hasMany(ProductQuestion::class); }

    // Scopes
    public function scopeActive($q) { return $q->where('is_active', true)->where('status', 'approved'); }
    public function scopeFeatured($q) { return $q->where('is_featured', true); }
    public function scopeInStock($q) { return $q->where('stock', '>', 0); }
    
    public function scopeForSeller($q, $sellerId)
    {
        return $q->where('seller_id', $sellerId);
    }

    // Accessors
    public function getCurrentPriceAttribute(): float
    {
        return $this->sale_price ?? $this->price;
    }

    public function getDiscountPercentAttribute(): ?int
    {
        if ($this->sale_price && $this->sale_price < $this->price) {
            return (int) round((($this->price - $this->sale_price) / $this->price) * 100);
        }
        return null;
    }

    public function getPrimaryImageAttribute(): ?string
    {
        return $this->images->where('is_primary', true)->first()?->url
            ?? $this->images->first()?->url;
    }

    // Meilisearch
    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->short_description,
            'sku' => $this->sku,
            'price' => $this->current_price,
            'sale_price' => $this->sale_price,
            'category_id' => $this->category_id,
            'category_name' => $this->category?->name,
            'brand_id' => $this->brand_id,
            'brand_name' => $this->brand?->name,
            'store_id' => $this->store_id,
            'store_name' => $this->store?->name,
            'seller_id' => $this->seller_id,
            'rating' => $this->rating,
            'review_count' => $this->review_count,
            'sale_count' => $this->sale_count,
            'in_stock' => $this->stock > 0,
            'is_featured' => $this->is_featured,
            'image' => $this->primary_image,
            'slug' => $this->slug,
            'tags' => $this->seo_keywords,
        ];
    }
}
```

## 4.4 Servis Örneği — OrderService.php

```php
<?php

namespace App\Services\Marketplace;

use App\Models\{Order, OrderItem, Cart, Product, Coupon};
use App\Events\OrderPlaced;
use App\Jobs\ProcessOrderJob;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    public function __construct(
        private PaymentService $paymentService,
        private StockService $stockService,
        private CouponService $couponService,
        private LoyaltyService $loyaltyService,
    ) {}

    public function createOrder(array $data, $user): Order
    {
        return DB::transaction(function () use ($data, $user) {
            $cart = $this->getValidatedCart($user);
            
            // Kupon doğrula
            $couponDiscount = 0;
            if ($data['coupon_code'] ?? null) {
                $couponDiscount = $this->couponService->apply($data['coupon_code'], $cart);
            }

            // Sipariş oluştur
            $order = Order::create([
                'uuid' => Str::uuid(),
                'order_number' => $this->generateOrderNumber(),
                'user_id' => $user->id,
                'billing_address' => $data['billing_address'],
                'shipping_address' => $data['shipping_address'],
                'subtotal' => $cart->subtotal,
                'shipping_cost' => $this->calculateShipping($cart, $data['shipping_address']),
                'discount_amount' => $couponDiscount,
                'tax_amount' => $cart->tax_amount,
                'total' => $cart->total - $couponDiscount,
                'coupon_code' => $data['coupon_code'] ?? null,
                'payment_method' => $data['payment_method'],
                'customer_note' => $data['note'] ?? null,
                'ip_address' => request()->ip(),
                'utm_source' => session('utm_source'),
                'utm_medium' => session('utm_medium'),
                'utm_campaign' => session('utm_campaign'),
                'is_b2b' => $user->hasRole('b2b_firm'),
                'b2b_firm_id' => $user->b2bFirm?->id,
            ]);

            // Sipariş kalemleri
            foreach ($cart->items as $cartItem) {
                $this->createOrderItem($order, $cartItem);
                $this->stockService->decrement($cartItem->product_id, $cartItem->variant_id, $cartItem->quantity);
            }

            // Sepeti temizle
            $cart->clear();

            // Event fırlat
            event(new OrderPlaced($order));

            // Background iş
            ProcessOrderJob::dispatch($order)->onQueue('orders');

            return $order;
        });
    }

    private function generateOrderNumber(): string
    {
        $prefix = 'MSO';
        $date = now()->format('ymd');
        $random = strtoupper(Str::random(6));
        return "{$prefix}{$date}{$random}";
    }

    public function updateStatus(Order $order, string $status, string $note = null, $byUser = null): void
    {
        $oldStatus = $order->status;
        $order->update(['status' => $status]);

        $order->statusHistory()->create([
            'status' => $status,
            'note' => $note,
            'created_by' => $byUser?->id,
        ]);

        event(new OrderStatusChanged($order, $oldStatus, $status));
    }
}
```

## 4.5 AI Servis Örneği — ProductDescriptionAI.php

```php
<?php

namespace App\Services\AI;

use App\Models\Product;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class ProductDescriptionAI
{
    private string $apiKey;
    private string $model = 'claude-sonnet-4-6';

    public function __construct()
    {
        $this->apiKey = config('services.anthropic.api_key');
    }

    public function generate(Product $product): array
    {
        $cacheKey = "ai_product_{$product->id}_" . md5($product->name . $product->sku);
        
        return Cache::remember($cacheKey, 86400, function () use ($product) {
            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
                'anthropic-version' => '2023-06-01',
            ])->post('https://api.anthropic.com/v1/messages', [
                'model' => $this->model,
                'max_tokens' => 2048,
                'system' => $this->getSystemPrompt(),
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => $this->buildPrompt($product),
                    ]
                ],
            ]);

            $content = $response->json('content.0.text');
            return json_decode($content, true);
        });
    }

    private function getSystemPrompt(): string
    {
        return <<<PROMPT
        Sen bir e-ticaret SEO uzmanısın. Verilen ürün bilgilerine göre Türkçe içerik üretiyorsun.
        Her zaman JSON formatında yanıt ver.
        Yanıt şeması:
        {
          "title": "SEO dostu ürün başlığı (max 70 karakter)",
          "description": "Detaylı ürün açıklaması (min 300, max 800 kelime)",
          "short_description": "Kısa açıklama (max 160 karakter)",
          "seo_title": "Meta başlık (max 60 karakter)",
          "seo_description": "Meta açıklama (max 155 karakter)",
          "keywords": ["anahtar", "kelimeler", "dizisi"],
          "alt_text": "Birincil görsel için alt text",
          "bullet_points": ["5 önemli özellik noktası"],
          "score": 0-100 arası optimizasyon puanı
        }
        PROMPT;
    }

    private function buildPrompt(Product $product): string
    {
        return <<<PROMPT
        Ürün Bilgileri:
        - Ad: {$product->name}
        - SKU: {$product->sku}
        - Kategori: {$product->category?->name}
        - Marka: {$product->brand?->name}
        - Fiyat: {$product->price} TL
        - Mevcut açıklama: {$product->description}
        - Özellikler: {$product->attributes->pluck('value', 'name')->toJson()}
        
        Yukarıdaki ürün için tam SEO içeriği üret.
        PROMPT;
    }

    public function generateBulk(array $productIds): void
    {
        foreach ($productIds as $id) {
            \App\Jobs\GenerateAIContentJob::dispatch($id)->onQueue('ai');
        }
    }
}
```

## 4.6 Filament Admin Paneli Yapısı

```php
// app/Filament/Resources/

SellerResource.php          // Satıcı yönetimi
ProductResource.php         // Ürün onayı
OrderResource.php           // Sipariş yönetimi
UserResource.php            // Kullanıcı yönetimi
SubscriptionResource.php    // Abonelik yönetimi
PayoutResource.php          // Para çekme talepleri
CategoryResource.php        // Kategori yönetimi
BrandResource.php           // Marka yönetimi
CouponResource.php          // Kupon yönetimi
AdCampaignResource.php      // Reklam yönetimi
B2BFirmResource.php         // B2B firma yönetimi
AffiliateResource.php       // Affiliate yönetimi
ReviewResource.php          // Yorum moderasyonu
BlogPostResource.php        // Blog yönetimi
ForumResource.php           // Forum moderasyonu
SettingsResource.php        // Sistem ayarları

// Widgets
TotalRevenueWidget.php
DailySalesWidget.php
ActiveSellersWidget.php
LiveOrderMapWidget.php
TopProductsWidget.php
FraudAlertsWidget.php
AIInsightsWidget.php
```

## 4.7 Meilisearch Konfigürasyonu

```php
// config/scout.php

'meilisearch' => [
    'host' => env('MEILISEARCH_HOST', 'http://localhost:7700'),
    'key' => env('MEILISEARCH_KEY'),
    'index-settings' => [
        Product::class => [
            'filterableAttributes' => [
                'category_id', 'brand_id', 'store_id', 'seller_id',
                'price', 'rating', 'in_stock', 'is_featured',
                'tax_rate', 'free_shipping',
            ],
            'sortableAttributes' => [
                'price', 'rating', 'review_count', 'sale_count',
                'created_at', 'view_count',
            ],
            'searchableAttributes' => [
                'name', 'description', 'sku', 'brand_name',
                'category_name', 'store_name', 'tags',
            ],
            'rankingRules' => [
                'words', 'typo', 'proximity', 'attribute',
                'sort', 'exactness',
                'sale_count:desc', 'rating:desc',
            ],
            'typoTolerance' => [
                'enabled' => true,
                'minWordSizeForTypos' => [
                    'oneTypo' => 4,
                    'twoTypos' => 8,
                ],
            ],
        ],
    ],
],
```

## 4.8 Scheduled Commands (Zamanlanmış Görevler)

```php
// app/Console/Kernel.php

protected function schedule(Schedule $schedule): void
{
    // Kargo takip - her 30 dakika
    $schedule->command('cargo:sync-tracking')
             ->everyThirtyMinutes()
             ->withoutOverlapping();

    // CRM Otomasyon - her dakika
    $schedule->command('crm:process-automations')
             ->everyMinute()
             ->withoutOverlapping();

    // Meilisearch senkron - her saat
    $schedule->command('scout:sync-index-settings')
             ->hourly();

    // Puan süresi dolma - her gece yarısı
    $schedule->command('loyalty:expire-points')
             ->dailyAt('00:01');

    // Günlük raporlar - sabah 06:00
    $schedule->command('reports:generate-daily')
             ->dailyAt('06:00');

    // Abonelik hatırlatma - her gün
    $schedule->command('subscriptions:send-reminders')
             ->dailyAt('09:00');

    // AI Pricing güncelleme - her 4 saat
    $schedule->command('ai:update-pricing-suggestions')
             ->every(240);

    // Fraud analizi - her saat
    $schedule->command('ai:analyze-fraud')
             ->hourly();

    // Segment güncelleme - her 6 saat
    $schedule->command('crm:sync-segments')
             ->every(360);
             
    // Arama indeks optimizasyonu - gece 02:00
    $schedule->command('search:optimize-index')
             ->dailyAt('02:00');
}
```
