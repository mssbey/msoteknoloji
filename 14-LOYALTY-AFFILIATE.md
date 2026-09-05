# 14 — LOYALTY ENGINE, AFFİLİATE & GAMİFİCATİON

## 14.1 Loyalty Puan Sistemi

```php
// app/Services/LoyaltyService.php

class LoyaltyService
{
    // Puan kazanma oranları
    private array $earnRates = [
        'purchase'      => ['rate' => 1, 'unit' => 'per_10_tl'],  // 10 TL'ye 1 puan
        'review'        => ['points' => 50],
        'review_photo'  => ['points' => 100],
        'referral'      => ['points' => 200],
        'daily_login'   => ['points' => 5],
        'signup'        => ['points' => 500],
        'birthday'      => ['points' => 250],
        'social_share'  => ['points' => 25],
        'profile_complete' => ['points' => 100],
    ];
    
    // Seviye gereksinimleri
    private array $tiers = [
        'bronze'   => ['min_points' => 0,       'multiplier' => 1.0, 'color' => '#CD7F32'],
        'silver'   => ['min_points' => 1000,     'multiplier' => 1.2, 'color' => '#C0C0C0'],
        'gold'     => ['min_points' => 5000,     'multiplier' => 1.5, 'color' => '#FFD700'],
        'platinum' => ['min_points' => 20000,    'multiplier' => 2.0, 'color' => '#E5E4E2'],
        'vip'      => ['min_points' => 50000,    'multiplier' => 3.0, 'color' => '#8B008B'],
    ];
    
    public function awardPoints(User $user, string $reason, array $context = []): int
    {
        $points = $this->calculatePoints($user, $reason, $context);
        
        if ($points <= 0) return 0;
        
        // Mevcut bakiyeyi al
        $summary = $user->loyaltySummary()->firstOrCreate(['user_id' => $user->id]);
        $newBalance = $summary->available_points + $points;
        $newLifetime = $summary->lifetime_earned + $points;
        
        DB::transaction(function () use ($user, $points, $reason, $context, $summary, $newBalance, $newLifetime) {
            // İşlem kaydı
            LoyaltyPoint::create([
                'user_id' => $user->id,
                'points' => $points,
                'balance_after' => $newBalance,
                'type' => 'earn',
                'reason' => $reason,
                'reference_type' => $context['reference_type'] ?? null,
                'reference_id' => $context['reference_id'] ?? null,
                'expires_at' => now()->addYear(), // 1 yıl geçerli
            ]);
            
            // Özet güncelle
            $summary->update([
                'total_points' => $newLifetime,
                'available_points' => $newBalance,
                'lifetime_earned' => $newLifetime,
            ]);
            
            // Tier kontrolü
            $newTier = $this->calculateTier($newLifetime);
            if ($newTier !== $summary->tier) {
                $summary->update(['tier' => $newTier, 'tier_updated_at' => now()]);
                $user->notify(new TierUpgradeNotification($newTier));
                $this->awardBadge($user, $newTier);
            }
        });
        
        return $points;
    }
    
    private function calculatePoints(User $user, string $reason, array $context): int
    {
        $tier = $user->loyaltySummary?->tier ?? 'bronze';
        $multiplier = $this->tiers[$tier]['multiplier'];
        
        $basePoints = match($reason) {
            'purchase' => (int) floor(($context['order_total'] ?? 0) / 10),
            default => $this->earnRates[$reason]['points'] ?? 0,
        };
        
        return (int) floor($basePoints * $multiplier);
    }
    
    public function redeemPoints(User $user, int $points, string $couponCode): float
    {
        $summary = $user->loyaltySummary;
        
        if ($summary->available_points < $points) {
            throw new InsufficientPointsException("Yetersiz puan");
        }
        
        // 100 puan = 1 TL
        $discount = $points / 100;
        
        DB::transaction(function () use ($user, $points, $couponCode, $discount, $summary) {
            LoyaltyPoint::create([
                'user_id' => $user->id,
                'points' => -$points,
                'balance_after' => $summary->available_points - $points,
                'type' => 'spend',
                'reason' => 'coupon',
            ]);
            
            $summary->decrement('available_points', $points);
            $summary->increment('lifetime_spent', $points);
        });
        
        return $discount;
    }
    
    public function calculateTier(int $lifetimePoints): string
    {
        $tier = 'bronze';
        foreach ($this->tiers as $name => $config) {
            if ($lifetimePoints >= $config['min_points']) {
                $tier = $name;
            }
        }
        return $tier;
    }
}
```

## 14.2 Rozet & Gamification Sistemi

```
ROZET SİSTEMİ

🥉 BRONZ          🥈 GÜMÜŞ         🥇 ALTIN         💎 PLATİN        👑 VIP
──────────────    ─────────────    ─────────────    ─────────────    ─────────────
0-999 puan        1000-4999        5000-19999       20000-49999      50000+ puan
Normal müşteri    %20 bonus puan   %50 bonus puan   2× bonus puan    3× bonus puan

ÖZEL ROZET KOLEKSIYONU:

🛒 İlk Alışveriş         → +500 puan (Tek seferlik)
⭐ İlk Değerlendirme      → +50 puan
📸 Fotoğraflı Yorum       → +100 puan
👥 İlk Davet              → +200 puan
🔥 5 Gün Üst Üste Giriş   → +50 puan bonus
💯 100. Sipariş           → Özel rozet + 1000 puan
🎂 Doğum Günü             → +250 puan (her yıl)
❤️ 10 Mağaza Takibi       → +75 puan
🗣️ 10 Soru Yanıtı         → Uzman rozeti

ÖZEL VIP AVANTAJLARI:
• Ücretsiz kargo (her siparişte, limitsiz)
• Erken kampanya erişimi (24 saat önce)
• Öncelikli müşteri desteği
• Yıllık özel hediye paketi
• VIP etkinlik davetleri
```

## 14.3 Gamification Challenge Sistemi

```php
// app/Models/LoyaltyChallenge.php

// Örnek Challenge'lar:
$challenges = [
    [
        'name' => 'Haftalık Alışveriş Koşusu',
        'description' => 'Bu hafta 3 farklı mağazadan alışveriş yap',
        'type' => 'weekly',
        'reward_points' => 300,
        'target' => ['different_stores' => 3],
        'icon' => '🏃',
    ],
    [
        'name' => 'Yorum Ustası',
        'description' => 'Bu ay 5 ürünü değerlendir',
        'type' => 'monthly',
        'reward_points' => 500,
        'target' => ['review_count' => 5],
        'icon' => '✍️',
    ],
    [
        'name' => 'Teknoloji Avcısı',
        'description' => 'Elektronik kategorisinden 3 ürün satın al',
        'type' => 'one_time',
        'reward_points' => 750,
        'target' => ['category_purchases' => ['electronics' => 3]],
        'icon' => '🔧',
    ],
];
```

## 14.4 Affiliate Marketing Sistemi

```php
// app/Services/AffiliateService.php

class AffiliateService
{
    public function generateLink(AffiliatePartner $partner, array $target): AffiliateLink
    {
        $code = $this->generateUniqueCode();
        
        $link = AffiliateLink::create([
            'partner_id' => $partner->id,
            'code' => $code,
            'target_type' => $target['type'],
            'target_id' => $target['id'] ?? null,
            'custom_url' => $this->buildUrl($target, $code),
        ]);
        
        // QR Kod oluştur
        $qrCode = QrCode::format('png')
            ->size(300)
            ->generate($link->custom_url);
        
        $qrPath = 'affiliate/qr/' . $code . '.png';
        Storage::put($qrPath, $qrCode);
        
        $link->update(['qr_code' => Storage::url($qrPath)]);
        
        return $link;
    }
    
    public function trackConversion(Order $order): void
    {
        // Cookie veya session'dan affiliate kodu bul
        $affiliateCode = cookie('affiliate_code') ?? session('affiliate_code');
        if (!$affiliateCode) return;
        
        $link = AffiliateLink::where('code', $affiliateCode)
            ->where('is_active', true)
            ->where(fn($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>=', now()))
            ->first();
        
        if (!$link) return;
        
        $partner = $link->partner;
        $commissionAmount = round($order->total * $partner->commission_rate / 100, 2);
        
        AffiliateConversion::create([
            'link_id' => $link->id,
            'partner_id' => $partner->id,
            'order_id' => $order->id,
            'order_total' => $order->total,
            'commission_rate' => $partner->commission_rate,
            'commission_amount' => $commissionAmount,
            'status' => 'pending', // Sipariş teslim edilince approved
        ]);
        
        $partner->increment('conversion_count');
        $partner->increment('pending_payout', $commissionAmount);
        $link->increment('conversion_count');
    }
    
    public function approveCommission(Order $order): void
    {
        // Sipariş teslim edilince komisyonu onayla
        $conversion = AffiliateConversion::where('order_id', $order->id)
            ->where('status', 'pending')
            ->first();
        
        if (!$conversion) return;
        
        $conversion->update(['status' => 'approved']);
        
        $partner = $conversion->partner;
        $partner->increment('total_earned', $conversion->commission_amount);
        $partner->decrement('pending_payout', $conversion->commission_amount);
        
        DB::transaction(fn() => $partner->increment('total_earned', $conversion->commission_amount));
        
        // Influencer'a bildirim
        $partner->user->notify(new CommissionApprovedNotification($conversion));
    }
}
```

## 14.5 Influencer Paneli Ekranı

```
INFLUENCER PANELİ — @techreviewer_ahmet
──────────────────────────────────────────────────────────────────────────

ÖZET:
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ TOPLAM       │ │ BEKLEYEN     │ │ ONAYLANAN    │ │ ÇEKİLEBİLİR  │
│ KAZANÇ       │ │ KOMİSYON     │ │ KOMİSYON     │ │ BAKİYE       │
│ 8,420 TL     │ │  892 TL      │ │ 7,528 TL     │ │ 6,800 TL     │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

KOMİSYON ORANIM: %8.5  |  Dönüşümlerim: 347  |  Link Tıklamaları: 12,456

LİNKLERİM:
┌──────────────────────────────────────────────────┬──────┬──────┬──────┐
│ ÜRÜN/HEDEF                                       │TIKL. │DÖNÜŞ.│KAZANÇ│
├──────────────────────────────────────────────────┼──────┼──────┼──────┤
│ iPhone 15 Pro Kılıf — ref.msocommerce.com/TECH01 │ 2,341│  89  │2,400 │
│ Samsung Şarj Paketi — ref.msocommerce.com/TECH02 │ 1,892│  67  │1,850 │
│ Ana Sayfa — ref.msocommerce.com/TECH00            │ 8,223│ 191  │4,170 │
└──────────────────────────────────────────────────┴──────┴──────┴──────┘

[Yeni Link Oluştur] [QR Kodu İndir] [Raporu İndir]

ÖDEME TALEP ET:
Talep Tutarı: [6,800] TL  (Max: 6,800 TL)
Banka: [TR00 0000 0000 0000 0000 0000 00]
[Para Çekme Talebi Gönder]
```
