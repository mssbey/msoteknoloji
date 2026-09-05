<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackUtm
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    private array $utmParams = [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        // URL'den UTM parametrelerini session ve cookie'ye kaydet
        foreach ($this->utmParams as $param) {
            if ($request->has($param)) {
                session([$param => $request->get($param)]);
                cookie()->queue(
                    cookie($param, $request->get($param), 60 * 24 * 30, '/', null, false, false)
                );
            }
        }

        // İlk giriş kaydı
        if ($request->has('utm_source') || $request->has('ref')) {
            try {
                \App\Models\UtmTracking::create([
                    'user_id' => $request->user()?->id,
                    'session_id' => session()->getId(),
                    'utm_source' => $request->utm_source,
                    'utm_medium' => $request->utm_medium,
                    'utm_campaign' => $request->utm_campaign,
                    'utm_content' => $request->utm_content,
                    'utm_term' => $request->utm_term,
                    'referrer' => $request->header('referer'),
                    'landing_page' => $request->path(),
                    'ip_address' => $request->ip(),
                    'device_type' => $this->detectDevice($request),
                    'first_seen_at' => now(),
                ]);
            } catch (\Exception) {
                // UTM tracking hatası ana akışı durdurmasın
            }
        }

        return $next($request);
    }

    private function detectDevice(Request $request): string
    {
        $ua = strtolower($request->userAgent() ?? '');
        if (str_contains($ua, 'mobile') || str_contains($ua, 'android')) return 'mobile';
        if (str_contains($ua, 'tablet') || str_contains($ua, 'ipad')) return 'tablet';
        return 'desktop';
    }
}
