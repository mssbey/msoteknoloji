<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Coupons\CouponService;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function __construct(private readonly CouponService $coupons) {}

    /**
     * POST /api/coupons/validate
     * { code, subtotal }
     */
    public function validateCode(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string|max:50',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $result = $this->coupons->validate(
            code: $data['code'],
            subtotal: (float) $data['subtotal'],
            user: $request->user(),
        );

        return response()->json([
            'valid' => $result['error'] === null,
            'discount' => $result['discount'],
            'error' => $result['error'],
            'coupon' => $result['coupon'] ? [
                'code' => $result['coupon']->code,
                'discount_type' => $result['coupon']->discount_type,
                'amount' => $result['coupon']->amount,
                'expires_at' => $result['coupon']->expires_at?->toIso8601String(),
            ] : null,
        ]);
    }
}
