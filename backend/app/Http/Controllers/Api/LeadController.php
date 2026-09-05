<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Services\Coupons\CouponService;
use App\Services\Notifications\WhatsAppService;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    public function __construct(
        private readonly CouponService $coupons,
        private readonly WhatsAppService $whatsapp,
    ) {}

    /**
     * Hoş geldin pop-up'tan gelen lead'i kaydeder ve %15 kupon üretir.
     * KVKK onayı zorunludur; ticari ileti onayı isteğe bağlıdır.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|min:2|max:100',
            'phone' => 'required|string|min:10|max:20',
            'email' => 'nullable|email|max:150',
            'kvkk_consent' => 'required|accepted',
            'commercial_consent' => 'nullable|boolean',
            'source' => 'nullable|string|max:30',
        ]);

        $phone = preg_replace('/\D/', '', $validated['phone']);

        $existing = Lead::where('phone', $phone)->first();
        if ($existing) {
            return response()->json([
                'success' => true,
                'message' => 'Daha önce kayıt olmuşsunuz.',
                'data' => ['coupon_code' => $existing->coupon_code],
            ]);
        }

        $lead = Lead::create([
            'name' => $validated['name'],
            'phone' => $phone,
            'email' => $validated['email'] ?? null,
            'kvkk_consent' => true,
            'commercial_consent' => (bool) ($validated['commercial_consent'] ?? false),
            'source' => $validated['source'] ?? 'popup',
            'ip_address' => $request->ip(),
            'utm_source' => $request->input('utm_source') ?? session('utm_source'),
            'utm_medium' => $request->input('utm_medium') ?? session('utm_medium'),
            'utm_campaign' => $request->input('utm_campaign') ?? session('utm_campaign'),
        ]);

        $coupon = $this->coupons->issueWelcomeCoupon($lead);
        $lead->update(['coupon_code' => $coupon->code]);

        // Ticari ileti onayı verdiyse hoş geldin WA mesajı gönder
        if ($lead->commercial_consent) {
            try {
                $this->whatsapp->sendTemplate(
                    to: $phone,
                    template: config('notifications.whatsapp.templates.lead_welcome'),
                    variables: [$lead->name, $coupon->code, "%" . (int) $coupon->amount],
                    related: $lead,
                );
            } catch (\Throwable $e) {
                report($e);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Hoş geldin kuponunuz hazır!',
            'data' => [
                'coupon_code' => $coupon->code,
                'discount_percent' => (int) $coupon->amount,
                'expires_at' => $coupon->expires_at?->toIso8601String(),
            ],
        ], 201);
    }
}
