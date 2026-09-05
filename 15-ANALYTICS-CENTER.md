# 15 — ANALYTICS CENTER & RAPORLAMA

## 15.1 Analytics Mimarisi

```
VERİ AKIŞI:
App Events → Redis Stream → Analytics Worker → ClickHouse/MySQL → Grafana/Dashboard

Gerçek zamanlı: Redis + SSE (Server-Sent Events)
Günlük raporlar: MySQL Aggregation + Cron Jobs
Büyük veri: ClickHouse (Yıl 2+ için, başlangıçta MySQL yeterli)
```

## 15.2 Satış Analitik Servisi

```php
// app/Services/Analytics/SalesAnalyticsService.php

class SalesAnalyticsService
{
    public function getSalesSummary(int $sellerId, string $period): array
    {
        $dates = $this->getPeriodDates($period);
        
        return [
            'total_revenue' => $this->getTotalRevenue($sellerId, $dates),
            'order_count' => $this->getOrderCount($sellerId, $dates),
            'avg_order_value' => $this->getAOV($sellerId, $dates),
            'conversion_rate' => $this->getConversionRate($sellerId, $dates),
            'return_rate' => $this->getReturnRate($sellerId, $dates),
            'chart_data' => $this->getDailyChart($sellerId, $dates),
            'comparison' => $this->getComparison($sellerId, $period),
            'top_products' => $this->getTopProducts($sellerId, $dates, 10),
            'top_categories' => $this->getTopCategories($sellerId, $dates, 5),
        ];
    }
    
    private function getDailyChart(int $sellerId, array $dates): array
    {
        return OrderItem::query()
            ->where('seller_id', $sellerId)
            ->whereBetween('created_at', [$dates['start'], $dates['end']])
            ->whereHas('order', fn($q) => $q->whereIn('status', ['delivered', 'processing', 'shipped']))
            ->selectRaw('DATE(created_at) as date, SUM(total_price) as revenue, COUNT(*) as orders')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($row) => [
                'date' => $row->date,
                'revenue' => (float) $row->revenue,
                'orders' => (int) $row->orders,
            ])
            ->toArray();
    }
    
    // CLV (Customer Lifetime Value)
    public function calculateCLV(int $sellerId): array
    {
        return DB::select(<<<SQL
            SELECT
                u.id as user_id,
                u.name,
                u.email,
                COUNT(DISTINCT o.id) as order_count,
                SUM(oi.total_price) as total_spent,
                AVG(oi.total_price) as avg_order_value,
                MIN(o.created_at) as first_order,
                MAX(o.created_at) as last_order,
                DATEDIFF(MAX(o.created_at), MIN(o.created_at)) as customer_lifespan_days,
                -- Basit CLV: AOV × satın alma sıklığı × müşteri ömrü
                (SUM(oi.total_price) / COUNT(DISTINCT o.id)) 
                    * (COUNT(DISTINCT o.id) / (DATEDIFF(MAX(o.created_at), MIN(o.created_at)) / 30 + 1))
                    * 24 as predicted_clv_24m
            FROM users u
            JOIN orders o ON o.user_id = u.id
            JOIN order_items oi ON oi.order_id = o.id
            WHERE oi.seller_id = :seller_id
            AND o.status = 'delivered'
            GROUP BY u.id, u.name, u.email
            ORDER BY predicted_clv_24m DESC
            LIMIT 100
        SQL, ['seller_id' => $sellerId]);
    }
}
```

## 15.3 RFM Analizi

```php
// app/Services/Analytics/RFMService.php

class RFMService
{
    public function analyze(int $sellerId): array
    {
        // Recency, Frequency, Monetary skorları hesapla
        $rfmData = DB::select(<<<SQL
            WITH customer_data AS (
                SELECT
                    u.id as user_id,
                    u.name,
                    u.email,
                    DATEDIFF(NOW(), MAX(o.created_at)) as recency_days,
                    COUNT(DISTINCT o.id) as frequency,
                    SUM(oi.total_price) as monetary
                FROM users u
                JOIN orders o ON o.user_id = u.id
                JOIN order_items oi ON oi.order_id = o.id
                WHERE oi.seller_id = :seller_id
                AND o.status = 'delivered'
                GROUP BY u.id, u.name, u.email
            ),
            rfm_scores AS (
                SELECT *,
                    NTILE(5) OVER (ORDER BY recency_days ASC) as r_score,
                    NTILE(5) OVER (ORDER BY frequency DESC) as f_score,
                    NTILE(5) OVER (ORDER BY monetary DESC) as m_score
                FROM customer_data
            )
            SELECT *,
                CONCAT(r_score, f_score, m_score) as rfm_score,
                CASE
                    WHEN r_score >= 4 AND f_score >= 4 AND m_score >= 4 THEN 'Champions'
                    WHEN r_score >= 3 AND f_score >= 3 THEN 'Loyal Customers'
                    WHEN r_score >= 4 AND f_score <= 2 THEN 'Recent Customers'
                    WHEN r_score >= 3 AND m_score >= 3 THEN 'Potential Loyalists'
                    WHEN r_score <= 2 AND f_score >= 3 AND m_score >= 3 THEN 'At Risk'
                    WHEN r_score <= 2 AND f_score >= 4 THEN 'Cant Lose Them'
                    WHEN r_score <= 1 THEN 'Lost'
                    ELSE 'Others'
                END as segment
            FROM rfm_scores
        SQL, ['seller_id' => $sellerId]);
        
        // Segmentlere göre grupla
        $segments = collect($rfmData)->groupBy('segment');
        
        return [
            'total_customers' => count($rfmData),
            'segments' => $segments->map(fn($customers, $segment) => [
                'segment' => $segment,
                'count' => $customers->count(),
                'avg_monetary' => $customers->avg('monetary'),
                'avg_frequency' => $customers->avg('frequency'),
                'percentage' => round($customers->count() / count($rfmData) * 100, 1),
            ])->values()->toArray(),
            'raw_data' => $rfmData,
        ];
    }
}
```

## 15.4 Cohort Analizi

```php
// app/Services/Analytics/CohortService.php

class CohortService
{
    // Müşteri tutma oranını aylık cohort'larla göster
    public function getRetentionCohort(int $sellerId, int $months = 6): array
    {
        $cohorts = [];
        
        for ($i = $months; $i >= 0; $i--) {
            $cohortMonth = now()->subMonths($i)->format('Y-m');
            
            // Bu ayda ilk alışveriş yapan müşteriler
            $newCustomers = DB::select(<<<SQL
                SELECT COUNT(DISTINCT user_id) as count
                FROM (
                    SELECT user_id, MIN(DATE_FORMAT(created_at, '%Y-%m')) as first_month
                    FROM orders o
                    JOIN order_items oi ON oi.order_id = o.id
                    WHERE oi.seller_id = :seller_id
                    AND o.status = 'delivered'
                    GROUP BY user_id
                ) first_orders
                WHERE first_month = :cohort_month
            SQL, ['seller_id' => $sellerId, 'cohort_month' => $cohortMonth]);
            
            $cohortSize = $newCustomers[0]->count;
            if ($cohortSize === 0) continue;
            
            $retention = ['cohort' => $cohortMonth, 'size' => $cohortSize, 'months' => []];
            
            // Sonraki aylarda geri dönen müşteri oranı
            for ($j = 0; $j <= $i; $j++) {
                $checkMonth = now()->subMonths($i - $j)->format('Y-m');
                
                $returning = DB::select(<<<SQL
                    SELECT COUNT(DISTINCT o.user_id) as count
                    FROM orders o
                    JOIN order_items oi ON oi.order_id = o.id
                    WHERE oi.seller_id = :seller_id
                    AND o.status = 'delivered'
                    AND DATE_FORMAT(o.created_at, '%Y-%m') = :check_month
                    AND o.user_id IN (
                        SELECT user_id FROM (
                            SELECT user_id, MIN(DATE_FORMAT(created_at, '%Y-%m')) as first_month
                            FROM orders o2
                            JOIN order_items oi2 ON oi2.order_id = o2.id
                            WHERE oi2.seller_id = :seller_id2
                            GROUP BY user_id
                        ) first_orders WHERE first_month = :cohort_month
                    )
                SQL, [
                    'seller_id' => $sellerId,
                    'seller_id2' => $sellerId,
                    'check_month' => $checkMonth,
                    'cohort_month' => $cohortMonth,
                ]);
                
                $retention['months'][$j] = [
                    'month' => $checkMonth,
                    'count' => $returning[0]->count,
                    'rate' => round($returning[0]->count / $cohortSize * 100, 1),
                ];
            }
            
            $cohorts[] = $retention;
        }
        
        return $cohorts;
    }
}
```

## 15.5 Analytics Dashboard Wireframe

```
ANALYTICS CENTER
──────────────────────────────────────────────────────────────────────────

TAB: [Satış] [Müşteriler] [Ürünler] [Kampanyalar] [Affiliate] [CRM] [SEO]

DÖNEM: [Bugün] [Bu Hafta] [Bu Ay] [Bu Yıl] [Özel Tarih ▼]

── SATIŞ ANALİTİĞİ ────────────────────────────────────────────────────────

KARŞILAŞTIRMALı GRAFİK (Geçen dönemle kıyasla)
  ┌──────────────────────────────────────────────────────────────────┐
  │  90K ▄                                                          │
  │  75K   ▄  ▄           ▄▄                   ▄▄▄               │
  │  60K  █  ██       ████  ████  █████    ██████ ██           │
  │  45K ██ ███    ████       ████        ████      ██████      │
  │     Pzt Sal  Çar  Per  Cum  Cmt  Paz  Pzt  Sal  Çar  Per   │
  │      ─── Bu Hafta    ╌╌╌ Geçen Hafta                          │
  └──────────────────────────────────────────────────────────────────┘

SAATLİK SATIŞ DAĞILIMI (Hangi saat en çok satış yapılıyor?)
  12-14 arası ve 20-22 arası yoğun — Reklam bütçesini bu saatlere kaydır

── MÜŞTERİ ANALİTİĞİ ─────────────────────────────────────────────────────

CLV DAĞILIMI:                        RFM SEGMENTLER:
┌────────────────────┐                Champions: 247 (%12.3)
│  <500 TL: 45%      │                Loyal:     412 (%20.5)
│  500-2K TL: 32%    │                At Risk:   89  (%4.4)
│  2K-5K TL: 15%     │                Lost:      67  (%3.3)
│  5K+ TL:    8%     │
└────────────────────┘

COHORT RETENTION MATRISI:
         Ay 0   Ay 1   Ay 2   Ay 3   Ay 4   Ay 5
Oca'26:  100%   34%    18%    12%    9%     7%
Şub'26:  100%   38%    21%    14%    11%
Mar'26:  100%   35%    19%    13%
Nis'26:  100%   41%    23%
May'26:  100%   39%
Haz'26:  100%

── TAHMİNSEL ANALİTİK (AI) ────────────────────────────────────────────────

🔮 Gelecek Ay Tahmini: 892,000 TL ciro (%87 güven)
🔮 Sonraki 90 gün: 2.8M TL ciro
🔮 En yüksek riskte:  89 müşteri tekrar alış yapmayabilir
🔮 Trend Uyarısı: "Akıllı Saat" kategorisi +%145 büyüme → Stok hazırla

── ISISI HARİTASI (HEATMAP) ──────────────────────────────────────────────

Sayfa üzerinde en çok tıklanan alanlar:
[Ürün görseli: %34] [Fiyat: %28] [Sepete Ekle: %18] [Yorum: %12] [Diğer: %8]

Kaydırma derinliği: Kullanıcıların %67'si ürün açıklamasını okuyor ✅
                    Kullanıcıların %23'ü yorumlara ulaşıyor
```

## 15.6 AI Tahmin Motoru

```php
// app/Services/Analytics/PredictiveAnalyticsService.php

class PredictiveAnalyticsService
{
    public function forecastSales(int $sellerId, int $days = 30): array
    {
        // Son 90 günün satış verisi
        $historicalData = $this->getHistoricalSales($sellerId, 90);
        
        // Prompt ile AI'ya tahmin yaptır
        $prompt = <<<PROMPT
        Aşağıdaki e-ticaret satış verisini analiz et ve gelecek {$days} gün için tahmin yap.
        
        SON 90 GÜN VERİSİ:
        {$this->formatData($historicalData)}
        
        Lütfen şunları analiz et:
        1. Trend (artış/azalış/sabit)
        2. Mevsimsellik (haftalık pattern)
        3. Anomaliler
        4. Gelecek {$days} gün tahmini
        
        JSON formatında:
        {
          "forecast": [{"date":"YYYY-MM-DD","predicted_revenue":0.0,"confidence":0-100}],
          "trend": "upward|downward|stable",
          "trend_rate": "+/-X%",
          "key_insights": ["..."],
          "risk_factors": ["..."],
          "opportunities": ["..."]
        }
        PROMPT;
        
        return $this->callClaudeAI($prompt);
    }
    
    public function predictChurn(int $sellerId): array
    {
        // Müşteri terk etme riski
        $atRiskCustomers = User::query()
            ->whereHas('orders', fn($q) => $q->where('seller_id', $sellerId))
            ->get()
            ->filter(fn($user) => $this->calculateChurnProbability($user, $sellerId) > 0.6)
            ->map(fn($user) => [
                'user' => $user,
                'churn_probability' => $this->calculateChurnProbability($user, $sellerId),
                'last_order_days' => $user->orders()->where('seller_id', $sellerId)->max('created_at')
                    ? now()->diffInDays($user->orders()->where('seller_id', $sellerId)->max('created_at'))
                    : 999,
                'recommended_action' => $this->getChurnPreventionAction($user, $sellerId),
            ]);
        
        return $atRiskCustomers->sortByDesc('churn_probability')->values()->toArray();
    }
    
    private function calculateChurnProbability(User $user, int $sellerId): float
    {
        $lastOrder = $user->orders()
            ->where('seller_id', $sellerId)
            ->where('status', 'delivered')
            ->latest()
            ->first();
        
        if (!$lastOrder) return 1.0;
        
        $daysSinceLastOrder = now()->diffInDays($lastOrder->created_at);
        $orderCount = $user->orders()->where('seller_id', $sellerId)->count();
        
        // Basit churn modeli (gerçekte ML modeli olur)
        $recencyScore = min(1, $daysSinceLastOrder / 180); // 180 günden sonra %100 risk
        $frequencyScore = max(0, 1 - ($orderCount / 10)); // 10+ sipariş düşük risk
        
        return ($recencyScore * 0.7 + $frequencyScore * 0.3);
    }
}
```
