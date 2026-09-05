# 12 — CRM, WHATSAPP & MARKETING AUTOMATION

## 12.1 Marketing Automation Workflow Engine

```php
// app/Services/CRM/AutomationEngine.php

class AutomationEngine
{
    public function processEvent(string $event, User $user, array $context = []): void
    {
        // Bu event için aktif workflowları bul
        $workflows = AutomationWorkflow::query()
            ->where('trigger_event', $event)
            ->where('is_active', true)
            ->when(isset($context['seller_id']), fn($q) => 
                $q->where(fn($q) =>
                    $q->where('seller_id', $context['seller_id'])
                      ->orWhereNull('seller_id') // Platform geneli
                )
            )
            ->get();
        
        foreach ($workflows as $workflow) {
            // Kullanıcı bu workflow'u daha önce tamamladı mı?
            if ($this->hasCompletedRecently($user, $workflow)) continue;
            
            // Her adım için gecikmiş job oluştur
            foreach ($workflow->steps as $index => $step) {
                $delay = $this->calculateDelay($step['delay'], $step['delay_unit']);
                
                ProcessAutomationStepJob::dispatch($workflow, $user, $index, $context)
                    ->delay($delay)
                    ->onQueue('notifications');
            }
            
            // Log
            AutomationLog::create([
                'workflow_id' => $workflow->id,
                'user_id' => $user->id,
                'step_index' => 0,
                'channel' => $workflow->steps[0]['channel'],
                'status' => 'pending',
            ]);
        }
    }
    
    private function calculateDelay(int $value, string $unit): \DateTimeInterface
    {
        return match($unit) {
            'minutes' => now()->addMinutes($value),
            'hours'   => now()->addHours($value),
            'days'    => now()->addDays($value),
        };
    }
}
```

## 12.2 Sepet Terk Senaryosu (Örnek)

```json
// Automation Workflow JSON Yapısı — Sepet Terk

{
  "name": "Sepet Terk Kurtarma",
  "trigger_event": "cart_abandoned",
  "is_active": true,
  "steps": [
    {
      "step": 1,
      "delay": 30,
      "delay_unit": "minutes",
      "channel": "whatsapp",
      "template": "cart_abandoned_1",
      "content": "Merhaba {{first_name}}, sepetinizdeki {{product_name}} sizi bekliyor! Hemen tamamlamak için: {{checkout_url}}"
    },
    {
      "step": 2,
      "delay": 24,
      "delay_unit": "hours",
      "channel": "sms",
      "content": "{{store_name}}: Favorileriniz stokta azalıyor! Sepetinizi tamamlayın: {{checkout_url}}",
      "condition": {
        "field": "step_1.status",
        "operator": "not_in",
        "value": ["opened", "clicked"]
      }
    },
    {
      "step": 3,
      "delay": 48,
      "delay_unit": "hours",
      "channel": "email",
      "template": "cart_abandoned_coupon",
      "coupon_discount": 5,
      "content": "Özel teklifiniz: %5 indirim kuponu {{coupon_code}}",
      "condition": {
        "field": "converted",
        "operator": "=",
        "value": false
      }
    },
    {
      "step": 4,
      "delay": 7,
      "delay_unit": "days",
      "channel": "whatsapp",
      "template": "last_chance",
      "coupon_discount": 10,
      "content": "Son şans! Sepetinize özel %10 indirim: {{coupon_code}} — Sadece 24 saat geçerli!"
    }
  ]
}
```

## 12.3 WhatsApp Business API Entegrasyonu

```php
// app/Services/CRM/WhatsAppService.php

class WhatsAppService
{
    private string $apiUrl = 'https://graph.facebook.com/v18.0';
    private string $phoneNumberId;
    private string $accessToken;
    
    public function __construct()
    {
        $this->phoneNumberId = config('services.whatsapp.phone_number_id');
        $this->accessToken = config('services.whatsapp.access_token');
    }
    
    public function sendTemplate(string $phone, string $template, array $vars = []): array
    {
        $payload = [
            'messaging_product' => 'whatsapp',
            'to' => $this->formatPhone($phone),
            'type' => 'template',
            'template' => [
                'name' => $template,
                'language' => ['code' => 'tr'],
                'components' => $this->buildComponents($vars),
            ],
        ];
        
        $response = Http::withToken($this->accessToken)
            ->post("{$this->apiUrl}/{$this->phoneNumberId}/messages", $payload);
        
        if ($response->failed()) {
            Log::error('WhatsApp gönderim hatası', [
                'phone' => $phone,
                'template' => $template,
                'error' => $response->json(),
            ]);
            throw new WhatsAppException("Mesaj gönderilemedi: " . $response->body());
        }
        
        return $response->json();
    }
    
    public function sendText(string $phone, string $message): array
    {
        return Http::withToken($this->accessToken)
            ->post("{$this->apiUrl}/{$this->phoneNumberId}/messages", [
                'messaging_product' => 'whatsapp',
                'to' => $this->formatPhone($phone),
                'type' => 'text',
                'text' => ['body' => $message, 'preview_url' => false],
            ])
            ->json();
    }
    
    private function formatPhone(string $phone): string
    {
        // Türkiye: 05XX XXX XXXX → 905XXXXXXXXX
        $phone = preg_replace('/[^0-9]/', '', $phone);
        if (str_starts_with($phone, '0')) {
            $phone = '90' . substr($phone, 1);
        } elseif (!str_starts_with($phone, '90')) {
            $phone = '90' . $phone;
        }
        return $phone;
    }
    
    private function buildComponents(array $vars): array
    {
        if (empty($vars)) return [];
        
        return [[
            'type' => 'body',
            'parameters' => array_map(
                fn($v) => ['type' => 'text', 'text' => (string)$v],
                $vars
            ),
        ]];
    }
}
```

## 12.4 Müşteri Segmentasyon Motoru

```php
// app/Services/CRM/SegmentationEngine.php

class SegmentationEngine
{
    // Dinamik segment kuralları
    private array $ruleHandlers = [
        'order_count' => 'filterByOrderCount',
        'total_spent' => 'filterByTotalSpent',
        'last_order_days' => 'filterByLastOrderDays',
        'cart_abandoned' => 'filterByCartAbandoned',
        'viewed_category' => 'filterByViewedCategory',
        'has_review' => 'filterByHasReview',
        'city' => 'filterByCity',
        'loyalty_tier' => 'filterByLoyaltyTier',
    ];
    
    public function evaluateSegment(CustomerSegment $segment): \Illuminate\Support\Collection
    {
        $rules = $segment->rules;
        $query = User::query()->where('status', 'active');
        
        foreach ($rules['conditions'] as $condition) {
            $handler = $this->ruleHandlers[$condition['field']] ?? null;
            if ($handler) {
                $query = $this->$handler($query, $condition);
            }
        }
        
        // Logic: AND / OR
        return $query->get();
    }
    
    private function filterByLastOrderDays(Builder $query, array $condition): Builder
    {
        return $query->whereHas('orders', fn($q) =>
            $q->where('created_at', '>=', now()->subDays($condition['value']))
              ->where('status', 'delivered')
        );
    }
    
    private function filterByTotalSpent(Builder $query, array $condition): Builder
    {
        return match($condition['operator']) {
            '>=' => $query->whereHas('orders', fn($q) =>
                $q->select('user_id')
                  ->selectRaw('SUM(total) as total_spent')
                  ->where('status', 'delivered')
                  ->groupBy('user_id')
                  ->havingRaw('SUM(total) >= ?', [$condition['value']])
            ),
            default => $query,
        };
    }
}
```

## 12.5 Email Marketing Sistemi

```php
// app/Mail/MarketingCampaignMail.php

class MarketingCampaignMail extends Mailable
{
    use Queueable, SerializesModels;
    
    public function __construct(
        private EmailCampaign $campaign,
        private User $recipient,
        private array $personalizeData = []
    ) {}
    
    public function build(): self
    {
        return $this
            ->from($this->campaign->from_email, $this->campaign->from_name)
            ->subject($this->personalizeSubject())
            ->view('emails.campaigns.template')
            ->with([
                'content' => $this->personalizeContent(),
                'unsubscribe_url' => $this->getUnsubscribeUrl(),
                'tracking_pixel' => $this->getTrackingPixel(),
            ]);
    }
    
    private function personalizeContent(): string
    {
        $content = $this->campaign->content;
        
        // Kişiselleştirme değişkenleri
        $replacements = [
            '{{first_name}}' => $this->recipient->name,
            '{{email}}' => $this->recipient->email,
            ...($this->personalizeData ?? []),
        ];
        
        return str_replace(
            array_keys($replacements),
            array_values($replacements),
            $content
        );
    }
    
    private function getTrackingPixel(): string
    {
        $trackId = encrypt([
            'campaign_id' => $this->campaign->id,
            'user_id' => $this->recipient->id,
        ]);
        return route('email.track.open', ['t' => $trackId]);
    }
}
```

## 12.6 UTM & Dönüşüm Takibi

```php
// app/Http/Middleware/TrackUTMMiddleware.php

class TrackUTMMiddleware
{
    private array $utmParams = [
        'utm_source', 'utm_medium', 'utm_campaign',
        'utm_content', 'utm_term', 'ref', 'affiliate_code'
    ];
    
    public function handle(Request $request, Closure $next): Response
    {
        foreach ($this->utmParams as $param) {
            if ($request->has($param)) {
                session([$param => $request->get($param)]);
                // 30 gün boyunca sakla
                cookie()->queue($param, $request->get($param), 43200);
            }
        }
        
        // Affiliate kod takibi
        if ($request->has('ref')) {
            $this->trackAffiliateClick($request->get('ref'), $request);
        }
        
        return $next($request);
    }
    
    private function trackAffiliateClick(string $code, Request $request): void
    {
        $link = AffiliateLink::where('code', $code)->where('is_active', true)->first();
        if (!$link) return;
        
        $link->increment('click_count');
        
        AffiliateClickLog::create([
            'link_id' => $link->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'referer' => $request->header('referer'),
        ]);
    }
}
```

## 12.7 CRM Dashboard Veri Yapısı

```
CRM DASHBOARD — DÖNÜŞÜM HUNİSİ

ZİYARETÇİ                    100,000
    │
    │ %45 aktif arama
    ↓
ÜRÜN GÖRÜNTÜLEME              45,000
    │
    │ %12 sepete ekle
    ↓
SEPETE EKLEME                  5,400
    │
    │ %62 sepet terk
    ↓
SEPETİ TERK EDEN               3,348
    │
    │ %23 kurtarma oranı (Otomasyon)
    ↓
KURTARILAN SİPARİŞ               769
    │
    ↓
ÖDEMEYE GİDEN                  2,052
    │
    │ %94 tamamlama oranı
    ↓
TAMAMLANAN SİPARİŞ             1,929

KAMPANYA PERFORMANSI:
WhatsApp Açılma Oranı:  %89.2  ✅ Mükemmel
E-posta Açılma Oranı:   %24.7  ✅ İyi
SMS Teslim Oranı:       %97.8  ✅ Mükemmel
Push Açılma Oranı:      %12.3  ⚠️ Ortalama

RFM ANALİZİ SEGMENTLER:
Champions (R:5 F:5 M:5):        892 müşteri   %23.1 kazanç
Loyal Customers:               1,247 müşteri
At Risk:                         342 müşteri   ⚠️ Yeniden kazan!
Lost Customers:                  189 müşteri   🔴 Son şans kampanyası
```
