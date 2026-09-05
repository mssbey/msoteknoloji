# 09 — AI MODÜLLER & ENTEGRASYONLAR

## 9.1 AI Suite Genel Bakış

```
MSO AI SUITE
├── 🔤 AI SEO Assistant         → Ürün başlık, meta, anahtar kelime üretimi
├── ✍️ AI Product Writer        → Detaylı ürün açıklaması, bullet points
├── 📢 AI Campaign Generator    → Kampanya başlığı, metin, hedef kitle
├── 💬 AI WhatsApp Assistant    → Otomatik müşteri yanıt botu
├── 💰 AI Pricing Assistant     → Rakip analizi + fiyat önerisi
├── 🛡️ AI Customer Support      → Chatbot + self-service
├── 🔍 AI Fraud Detection       → Anomali tespiti + fraud engelleme
└── 📊 AI Analytics Insights    → Satış tahminleri, trend analizi
```

## 9.2 AI SEO & Ürün Yazarı

```php
// app/Services/AI/AIProductWriter.php

class AIProductWriter
{
    private AnthropicClient $client;
    
    public function generateFullContent(Product $product, array $options = []): array
    {
        $language = $options['language'] ?? 'tr';
        $tone = $options['tone'] ?? 'professional'; // professional|casual|technical
        $length = $options['length'] ?? 'medium';   // short|medium|long
        
        $prompt = $this->buildPrompt($product, $language, $tone, $length);
        
        $response = $this->client->messages()->create([
            'model' => 'claude-sonnet-4-6',
            'max_tokens' => 3000,
            'system' => $this->getSystemPrompt($language),
            'messages' => [['role' => 'user', 'content' => $prompt]],
        ]);
        
        $content = json_decode($response->content[0]->text, true);
        
        // Skoru hesapla
        $content['optimization_score'] = $this->calculateScore($content);
        
        // Mağazaya kaydet
        $product->update([
            'seo_title' => $content['seo_title'],
            'seo_description' => $content['seo_description'],
            'seo_keywords' => implode(', ', $content['keywords']),
            'ai_score' => $content['optimization_score'],
            'ai_suggestions' => $content['suggestions'] ?? [],
            'ai_generated_at' => now(),
        ]);
        
        return $content;
    }
    
    private function getSystemPrompt(string $language): string
    {
        return <<<SYSTEM
        Sen Türkiye'nin en iyi e-ticaret SEO uzmanısın.
        
        Görevin: Ürün için maksimum dönüşüm sağlayacak içerik üretmek.
        
        KRİTERLER:
        - Google E-E-A-T standartlarına uy
        - Anahtar kelime yoğunluğu %1-3 arası
        - Türkçe doğal ve akıcı dil kullan
        - Satın alma kararını hızlandıracak FOMO elementleri ekle
        - Teknik özellikleri kullanıcı faydalarına çevir
        
        YANIT FORMATI (kesinlikle JSON):
        {
          "title": "...",           (max 70 karakter, ana keyword başta)
          "seo_title": "...",       (max 60 karakter)
          "seo_description": "...", (max 155 karakter, CTA içermeli)
          "description": "...",     (min 300 kelime, HTML formatında)
          "short_description": "...", (max 150 karakter)
          "bullet_points": ["...", "...", "...", "...", "..."],
          "keywords": ["...", "..."],  (10-15 adet)
          "alt_text": "...",        (birincil görsel için)
          "og_description": "...",  (sosyal medya için)
          "faq": [{"q":"...","a":"..."}],  (3-5 soru-cevap)
          "suggestions": ["..."],   (iyileştirme önerileri)
        }
        SYSTEM;
    }
    
    private function calculateScore(array $content): int
    {
        $score = 0;
        
        // Title (20 puan)
        $titleLen = mb_strlen($content['title'] ?? '');
        if ($titleLen >= 50 && $titleLen <= 70) $score += 20;
        elseif ($titleLen >= 30) $score += 10;
        
        // Description (25 puan)
        $descWords = str_word_count($content['description'] ?? '');
        if ($descWords >= 300) $score += 25;
        elseif ($descWords >= 150) $score += 15;
        
        // SEO Description (15 puan)
        $seoDescLen = mb_strlen($content['seo_description'] ?? '');
        if ($seoDescLen >= 120 && $seoDescLen <= 155) $score += 15;
        elseif ($seoDescLen > 0) $score += 8;
        
        // Keywords (15 puan)
        $kwCount = count($content['keywords'] ?? []);
        if ($kwCount >= 10) $score += 15;
        elseif ($kwCount >= 5) $score += 8;
        
        // Bullet Points (15 puan)
        $bpCount = count($content['bullet_points'] ?? []);
        if ($bpCount >= 5) $score += 15;
        elseif ($bpCount >= 3) $score += 8;
        
        // FAQ (10 puan)
        if (!empty($content['faq'])) $score += 10;
        
        return min(100, $score);
    }
}
```

## 9.3 AI Dynamic Pricing Engine

```php
// app/Services/AI/DynamicPricingEngine.php

class DynamicPricingEngine
{
    public function analyzePricing(Product $product): array
    {
        // 1. Rakip fiyatlarını topla
        $competitorPrices = $this->scrapeCompetitorPrices($product->sku, $product->name);
        
        // 2. Kendi satış geçmişini analiz et
        $salesVelocity = $this->getSalesVelocity($product->id);
        
        // 3. Stok durumu
        $stockLevel = $product->stock;
        $daysOfStock = $salesVelocity > 0 ? floor($stockLevel / $salesVelocity) : 999;
        
        // 4. Kategori trend
        $categoryTrend = $this->getCategoryTrend($product->category_id);
        
        // 5. AI'ya analiz yaptır
        $aiAnalysis = $this->runAIAnalysis([
            'product' => [
                'name' => $product->name,
                'current_price' => $product->price,
                'cost_price' => $product->cost_price,
                'stock' => $stockLevel,
                'days_of_stock' => $daysOfStock,
                'sales_last_7_days' => $salesVelocity * 7,
                'rating' => $product->rating,
                'review_count' => $product->review_count,
            ],
            'competitors' => $competitorPrices,
            'category_trend' => $categoryTrend,
        ]);
        
        return [
            'current_price' => $product->price,
            'suggested_price' => $aiAnalysis['suggested_price'],
            'price_range' => $aiAnalysis['price_range'],
            'action' => $aiAnalysis['action'], // increase|decrease|maintain|discount
            'reason' => $aiAnalysis['reason'],
            'confidence' => $aiAnalysis['confidence'],
            'competitors' => $competitorPrices,
            'projected_impact' => $aiAnalysis['projected_impact'],
        ];
    }
    
    private function scrapeCompetitorPrices(string $sku, string $name): array
    {
        // Trendyol API / Scraping
        // Hepsiburada API
        // N11 API
        // Amazon TR API
        
        // Gerçek implementasyonda proxy + rate limiting gerekli
        return [
            ['platform' => 'Trendyol', 'price' => 289.90, 'url' => '...'],
            ['platform' => 'Hepsiburada', 'price' => 295.00, 'url' => '...'],
            ['platform' => 'N11', 'price' => 299.00, 'url' => '...'],
        ];
    }
    
    private function runAIAnalysis(array $data): array
    {
        $prompt = <<<PROMPT
        Aşağıdaki ürün verilerini analiz et ve optimal fiyatlandırma stratejisi öner:
        
        ÜRÜN: {$data['product']['name']}
        Mevcut Fiyat: {$data['product']['current_price']} TL
        Maliyet: {$data['product']['cost_price']} TL
        Stok: {$data['product']['stock']} adet ({$data['product']['days_of_stock']} günlük stok)
        Son 7 gün satış: {$data['product']['sales_last_7_days']} adet
        
        RAKİP FİYATLARI:
        {$this->formatCompetitors($data['competitors'])}
        
        KATEGORİ TRENDI: {$data['category_trend']['direction']} (%{$data['category_trend']['change']})
        
        JSON formatında yanıt ver:
        {
          "suggested_price": 000.00,
          "price_range": {"min": 000, "max": 000},
          "action": "increase|decrease|maintain|discount",
          "reason": "...",
          "confidence": 0-100,
          "projected_impact": {
            "sales_change": "+/-X%",
            "revenue_change": "+/-X%",
            "margin": "X%"
          }
        }
        PROMPT;
        
        $response = $this->callClaude($prompt);
        return json_decode($response, true);
    }
}
```

## 9.4 AI Fraud Detection

```php
// app/Services/AI/FraudDetectionService.php

class FraudDetectionService
{
    private array $riskFactors = [
        'same_ip_multiple_orders' => 30,    // Ağırlık
        'vpn_detected' => 20,
        'new_account_large_order' => 25,
        'multiple_failed_payments' => 35,
        'unusual_address' => 15,
        'different_ip_from_usual' => 10,
        'multiple_accounts_same_device' => 40,
        'bulk_same_product' => 20,
        'abnormal_order_time' => 5,
    ];
    
    public function analyzeOrder(Order $order): array
    {
        $riskScore = 0;
        $flags = [];
        
        $user = $order->user;
        $ip = $order->ip_address;
        
        // Aynı IP'den çoklu sipariş kontrolü
        $recentOrdersSameIP = Order::where('ip_address', $ip)
            ->where('created_at', '>=', now()->subHours(1))
            ->count();
        if ($recentOrdersSameIP > 3) {
            $riskScore += $this->riskFactors['same_ip_multiple_orders'];
            $flags[] = "Son 1 saatte {$recentOrdersSameIP} sipariş (aynı IP)";
        }
        
        // VPN/Proxy tespiti
        if ($this->isVPN($ip)) {
            $riskScore += $this->riskFactors['vpn_detected'];
            $flags[] = 'VPN/Proxy kullanımı tespit edildi';
        }
        
        // Yeni hesap + büyük sipariş
        $accountAge = $user->created_at->diffInDays();
        if ($accountAge < 7 && $order->total > 5000) {
            $riskScore += $this->riskFactors['new_account_large_order'];
            $flags[] = "Yeni hesap ({$accountAge} gün) + yüksek tutar ({$order->total} TL)";
        }
        
        // Başarısız ödeme denemeleri
        $failedPayments = Payment::where('order_id', $order->id)
            ->where('status', 'failed')
            ->count();
        if ($failedPayments >= 3) {
            $riskScore += $this->riskFactors['multiple_failed_payments'];
            $flags[] = "{$failedPayments} başarısız ödeme denemesi";
        }
        
        $riskLevel = match(true) {
            $riskScore >= 70 => 'critical',
            $riskScore >= 40 => 'high',
            $riskScore >= 20 => 'medium',
            default => 'low',
        };
        
        // Kritik ise otomatik durdur
        if ($riskLevel === 'critical') {
            $order->update(['status' => 'on_hold']);
            $this->notifyAdmins($order, $riskScore, $flags);
        }
        
        return [
            'risk_score' => $riskScore,
            'risk_level' => $riskLevel,
            'flags' => $flags,
            'auto_action' => $riskLevel === 'critical' ? 'held' : 'none',
        ];
    }
}
```

## 9.5 AI WhatsApp Asistanı

```php
// app/Services/AI/WhatsAppAIAssistant.php

class WhatsAppAIAssistant
{
    public function handleIncoming(string $phone, string $message, Seller $seller): string
    {
        // Konuşma geçmişini al
        $history = $this->getConversationHistory($phone, $seller->id);
        
        // Intent tespiti
        $intent = $this->detectIntent($message);
        
        // Mağaza context'ini hazırla
        $storeContext = $this->buildStoreContext($seller);
        
        $response = $this->callClaude([
            'system' => $this->buildSystemPrompt($seller, $storeContext),
            'messages' => [
                ...$history,
                ['role' => 'user', 'content' => $message]
            ],
        ]);
        
        // Konuşmayı kaydet
        $this->saveMessage($phone, $seller->id, 'inbound', $message);
        $this->saveMessage($phone, $seller->id, 'outbound', $response);
        
        return $response;
    }
    
    private function buildSystemPrompt(Seller $seller, array $storeContext): string
    {
        return <<<SYSTEM
        Sen {$seller->store->name} mağazasının müşteri destek asistanısın.
        
        MAĞAZA BİLGİLERİ:
        - Mağaza: {$seller->store->name}
        - Çalışma Saatleri: 09:00-18:00
        - Kargo: 1-3 iş günü
        - İade: 30 gün
        
        KATEGORİLER: {$storeContext['categories']}
        
        GÖREVLERİN:
        1. Müşteri sorularını kibarca yanıtla
        2. Sipariş durumu sorularını yönlendir
        3. Ürün önerisi yap
        4. Şikayet varsa özür dile ve çözüm öner
        5. İnsan temsilciye yönlendirmeyi bildir
        
        KURALLAR:
        - Her zaman Türkçe yaz
        - Kısa ve net cevaplar ver (max 2-3 paragraf)
        - Emoji kullan ama abartma
        - Belirsizsen "kontrol edip size geri dönelim" de
        SYSTEM;
    }
}
```

## 9.6 AI Satış & Kampanya Önerileri

```php
// app/Services/AI/CampaignAIService.php

class CampaignAIService
{
    public function generateCampaignIdeas(Seller $seller): array
    {
        // Satıcı verilerini topla
        $salesData = $this->getSalesData($seller->id, 30);
        $topProducts = $this->getTopProducts($seller->id, 10);
        $slowProducts = $this->getSlowProducts($seller->id, 10);
        $upcomingEvents = $this->getUpcomingEvents();
        
        $prompt = <<<PROMPT
        {$seller->store->name} mağazası için kampanya önerileri üret.
        
        SON 30 GÜN VERİLERİ:
        - Toplam Ciro: {$salesData['total_revenue']} TL
        - Sipariş Adedi: {$salesData['order_count']}
        - Dönüşüm Oranı: %{$salesData['conversion_rate']}
        - En çok satan: {$topProducts[0]['name']}
        - Stokta duran: {$slowProducts[0]['name']}
        
        YAKLAŞAN ETKINLIKLER: {$this->formatEvents($upcomingEvents)}
        
        JSON formatında 5 kampanya önerisi üret:
        [
          {
            "title": "Kampanya başlığı",
            "type": "discount|bundle|flash|seasonal",
            "description": "Kısa açıklama",
            "discount": 10-50,
            "products": ["ürün adları"],
            "expected_revenue_increase": "X%",
            "duration": "X gün",
            "priority": "high|medium|low",
            "reason": "Bu kampanyayı neden önerdim"
          }
        ]
        PROMPT;
        
        return $this->callClaude($prompt);
    }
}
```

## 9.7 AI Dashboard (Satıcı)

```
AI ASİSTAN DASHBOARD
──────────────────────────────────────────────────────────────────────────

MAĞAZA OPTİMİZASYON SKORU: 78/100  ████████████████████░░░░░

TAB: [📊 Genel Bakış] [🔤 SEO] [💰 Fiyatlandırma] [📢 Kampanyalar] [🔮 Tahminler]

── HAFTALIK AI TAHMİNLERİ ─────────────────────────────────────────────────

  Tahmin Edilen Satış (Bu hafta): 892 sipariş
  Tahmin Edilen Ciro:              48,200 TL
  Model Güven Skoru:               %87

  ┌──────────────────────────────────────────────────────────┐
  │  Haftalık Satış Tahmini                                  │
  │  Pzt  Sal  Çar  Per  Cum  Cmt  Paz                      │
  │  ▅▆   ▇█   ▅▆   ▆▇   █▇   ▅▄   ▃▂                      │
  │  112  134  118  127  156  108  67                        │
  └──────────────────────────────────────────────────────────┘

── FİYAT FIRSAT ALARMLARı ─────────────────────────────────────────────────

🟢 Samsung Şarj Cihazı — Trendyol'da %12 pahalısın
   Önerimiz: 489 TL → 435 TL yapınca +%34 satış artışı bekleniyor
   [Fiyatı Güncelle]

🟡 Anker Kablo — Rakiple aynı fiyat, ürün kaliten daha iyi
   Öneri: 5-10 TL artışa yer var, müşteri incelemelerinde avantajlısın
   [Analizi Gör]

── TREND FIRSATLAR ────────────────────────────────────────────────────────

🔥 Gaming Mouse — Bu hafta %240 arama artışı
   Mağazanda bu ürün yok. Stokla!
   [Benzer Ürünleri Gör]

🔥 iPhone 15 Kılıf Yeni Renkler — Trend renk: Titanium Blue
   [AI Ürün Açıklaması Üret]
```
