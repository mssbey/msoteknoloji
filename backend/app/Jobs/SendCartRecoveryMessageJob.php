<?php

namespace App\Jobs;

use App\Models\Cart;
use App\Services\Coupons\CouponService;
use App\Services\Notifications\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class SendCartRecoveryMessageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly Cart $cart) {}

    public function handle(WhatsAppService $whatsapp, CouponService $coupons): void
    {
        $cart = $this->cart->loadMissing('user');
        $user = $cart->user;
        if (!$user?->phone) return;

        // Recovery token üret
        $token = Str::random(48);
        $cart->update([
            'recovery_token' => $token,
            'recovery_sent' => true,
            'recovery_sent_at' => now(),
        ]);

        $coupon = $coupons->issueCartRecoveryCoupon($user);
        $recoveryUrl = config('app.frontend_url', 'http://localhost:3000') . "/sepet-kurtar/{$token}";

        $whatsapp->sendTemplate(
            to: $user->phone,
            template: config('notifications.whatsapp.templates.cart_recovery'),
            variables: [
                $user->name,
                (string) $cart->item_count,
                $coupon->code,
                "%" . (int) $coupon->amount,
                $recoveryUrl,
            ],
            related: $cart,
        );
    }
}
