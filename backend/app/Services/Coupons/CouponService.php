<?php

namespace App\Services\Coupons;

use App\Models\Coupon;
use App\Models\CouponRedemption;
use App\Models\Lead;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Str;

class CouponService
{
    /**
     * Lead capture (hoş geldin pop-up) için %15 kupon üret.
     */
    public function issueWelcomeCoupon(Lead $lead): Coupon
    {
        $cfg = config('marketplace.coupons.welcome_popup');

        return Coupon::create([
            'code' => $this->generateCode('WELCOME'),
            'source' => 'welcome_popup',
            'discount_type' => $cfg['discount_type'],
            'amount' => $cfg['amount'],
            'min_order_amount' => $cfg['min_order'],
            'usage_limit' => $cfg['usage_limit'],
            'per_user_limit' => 1,
            'lead_id' => $lead->id,
            'first_order_only' => true,
            'is_active' => true,
            'expires_at' => now()->addDays($cfg['expires_days']),
            'campaign_name' => 'Hoş Geldin %15 İndirim',
        ]);
    }

    /**
     * Diğer pazar yerinden gelen müşteriler için kutu içi kupon.
     */
    public function issueBoxInsertCoupon(?string $note = null): Coupon
    {
        $cfg = config('marketplace.coupons.box_insert');
        return Coupon::create([
            'code' => $this->generateCode('BOX'),
            'source' => 'box_insert',
            'discount_type' => $cfg['discount_type'],
            'amount' => $cfg['amount'],
            'min_order_amount' => $cfg['min_order'],
            'usage_limit' => $cfg['usage_limit'],
            'per_user_limit' => 1,
            'is_active' => true,
            'expires_at' => now()->addDays($cfg['expires_days']),
            'campaign_name' => $note ?? 'Kutu İçi Hediye Kupon',
        ]);
    }

    /**
     * Sepet terk eden kullanıcı için kurtarma kuponu.
     */
    public function issueCartRecoveryCoupon(User $user): Coupon
    {
        $cfg = config('marketplace.coupons.cart_recovery');
        return Coupon::create([
            'code' => $this->generateCode('GERIDON'),
            'source' => 'cart_recovery',
            'discount_type' => $cfg['discount_type'],
            'amount' => $cfg['amount'],
            'min_order_amount' => $cfg['min_order'],
            'usage_limit' => $cfg['usage_limit'],
            'per_user_limit' => 1,
            'user_id' => $user->id,
            'is_active' => true,
            'expires_at' => now()->addDays($cfg['expires_days']),
            'campaign_name' => 'Sepetini Tamamla',
        ]);
    }

    /**
     * Yorum yapana teşvik kuponu (yorum onaylandığında).
     */
    public function issueReviewRewardCoupon(User $user): Coupon
    {
        $cfg = config('marketplace.coupons.review_reward');
        return Coupon::create([
            'code' => $this->generateCode('YORUM'),
            'source' => 'review_reward',
            'discount_type' => $cfg['discount_type'],
            'amount' => $cfg['amount'],
            'min_order_amount' => $cfg['min_order'],
            'usage_limit' => $cfg['usage_limit'],
            'per_user_limit' => 1,
            'user_id' => $user->id,
            'is_active' => true,
            'expires_at' => now()->addDays($cfg['expires_days']),
            'campaign_name' => 'Yorum Teşvik İndirimi',
        ]);
    }

    /**
     * Kupon doğrula + indirim hesapla.
     *
     * @return array{coupon: Coupon, discount: float, error: ?string}
     */
    public function validate(string $code, float $subtotal, ?User $user = null): array
    {
        $coupon = Coupon::where('code', $code)->first();
        if (!$coupon) {
            return ['coupon' => null, 'discount' => 0.0, 'error' => 'Kupon kodu bulunamadı.'];
        }

        if (!$coupon->isUsable()) {
            return ['coupon' => $coupon, 'discount' => 0.0, 'error' => 'Kupon kullanılamaz (süresi dolmuş veya pasif).'];
        }

        if ($coupon->user_id && $user && $coupon->user_id !== $user->id) {
            return ['coupon' => $coupon, 'discount' => 0.0, 'error' => 'Bu kupon başka bir kullanıcıya ait.'];
        }

        if ($subtotal < $coupon->min_order_amount) {
            return [
                'coupon' => $coupon,
                'discount' => 0.0,
                'error' => "Bu kupon için minimum {$coupon->min_order_amount} TL sepet gerekir.",
            ];
        }

        // Per-user limit
        if ($user && $coupon->per_user_limit > 0) {
            $usedByUser = CouponRedemption::where('coupon_id', $coupon->id)
                ->where('user_id', $user->id)
                ->count();
            if ($usedByUser >= $coupon->per_user_limit) {
                return ['coupon' => $coupon, 'discount' => 0.0, 'error' => 'Bu kuponu daha önce kullandınız.'];
            }
        }

        // First order only
        if ($coupon->first_order_only && $user) {
            $hasOrder = Order::where('user_id', $user->id)->where('payment_status', 'paid')->exists();
            if ($hasOrder) {
                return ['coupon' => $coupon, 'discount' => 0.0, 'error' => 'Sadece ilk siparişe geçerlidir.'];
            }
        }

        return ['coupon' => $coupon, 'discount' => $coupon->calculateDiscount($subtotal), 'error' => null];
    }

    /**
     * Sipariş sırasında kuponu kullanılmış olarak işaretle.
     */
    public function redeem(Coupon $coupon, Order $order, float $discount): CouponRedemption
    {
        $coupon->increment('used_count');

        if ($coupon->source === 'welcome_popup' && $coupon->lead_id) {
            $coupon->lead?->update(['coupon_used' => true, 'coupon_used_at' => now()]);
        }

        return CouponRedemption::create([
            'coupon_id' => $coupon->id,
            'order_id' => $order->id,
            'user_id' => $order->user_id,
            'discount_amount' => $discount,
            'redeemed_at' => now(),
        ]);
    }

    private function generateCode(string $prefix): string
    {
        do {
            $code = $prefix . '-' . strtoupper(Str::random(6));
        } while (Coupon::where('code', $code)->exists());
        return $code;
    }
}
