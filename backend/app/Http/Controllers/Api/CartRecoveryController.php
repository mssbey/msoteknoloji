<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use Illuminate\Http\Request;

class CartRecoveryController extends Controller
{
    public function show(string $token)
    {
        $cart = Cart::where('recovery_token', $token)
            ->where('is_abandoned', true)
            ->where('recovered', false)
            ->with('user:id,name,email')
            ->firstOrFail();

        return response()->json([
            'data' => [
                'cart_id'    => $cart->id,
                'items'      => array_values($cart->items ?? []),
                'item_count' => $cart->item_count,
                'subtotal'   => (float) $cart->subtotal,
                'coupon_code' => $cart->coupon_code,
                'user_name'  => $cart->user?->name,
            ],
        ]);
    }

    public function restore(Request $request, string $token)
    {
        $cart = Cart::where('recovery_token', $token)
            ->where('is_abandoned', true)
            ->where('recovered', false)
            ->firstOrFail();

        $cart->update(['recovered' => true, 'is_abandoned' => false]);

        // Kullanıcının aktif sepetini bu verilerle güncelle
        $user = $request->user();
        if ($user) {
            $active = Cart::firstOrCreate(
                ['user_id' => $user->id, 'recovered' => false, 'is_abandoned' => false],
                ['items' => [], 'subtotal' => 0, 'expires_at' => now()->addDays(14)],
            );
            $active->update([
                'items'    => $cart->items,
                'subtotal' => $cart->subtotal,
                'coupon_code' => $cart->coupon_code,
            ]);
        }

        return response()->json(['message' => 'Sepetiniz geri yüklendi.']);
    }
}
