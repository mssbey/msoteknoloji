# 11 — GÜVENLİK KATMANLARI

## 11.1 Güvenlik Mimarisi Genel Bakış

```
KATMAN 1: Ağ Güvenliği
  └── CloudFlare WAF + DDoS Koruma
  └── IP Allowlist/Blocklist
  └── Rate Limiting (Ağ seviyesi)

KATMAN 2: Uygulama Güvenliği
  └── Laravel Sanctum (API Auth)
  └── CSRF Koruma
  └── XSS Engelleme
  └── SQL Injection Engelleme (Eloquent ORM)
  └── Input Validation & Sanitization
  └── Rate Limiting (Uygulama seviyesi)

KATMAN 3: Kimlik & Erişim Yönetimi
  └── JWT / Sanctum Token
  └── 2FA (TOTP)
  └── Rol Tabanlı Erişim (RBAC)
  └── IP Bazlı Oturum Doğrulama

KATMAN 4: Veri Güvenliği
  └── Database Şifreleme (at rest)
  └── HTTPS / TLS 1.3
  └── Hassas Veri Maskeleme
  └── PCI DSS Uyumu (Ödeme)

KATMAN 5: İzleme & Tespit
  └── Fraud Detection AI
  └── Anomali Tespiti
  └── Log Analizi (SIEM)
  └── Penetrasyon Test Programı
```

## 11.2 API Güvenliği

```php
// app/Http/Middleware/ApiSecurityMiddleware.php

class ApiSecurityMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Rate Limiting
        $this->enforceRateLimit($request);
        
        // 2. IP Kontrol
        if ($this->isBlockedIP($request->ip())) {
            return response()->json(['error' => 'Erişim engellendi'], 403);
        }
        
        // 3. User-Agent Kontrolü (bot tespiti)
        if ($this->isMaliciousBot($request->userAgent())) {
            return response()->json(['error' => 'Geçersiz istek'], 400);
        }
        
        // 4. Content-Type Kontrolü
        if ($request->isMethod('POST') && !$request->isJson()) {
            return response()->json(['error' => 'Content-Type: application/json gerekli'], 415);
        }
        
        // 5. Payload boyutu
        if ($request->header('Content-Length') > 10485760) { // 10MB
            return response()->json(['error' => 'İstek boyutu çok büyük'], 413);
        }
        
        return $next($request);
    }
    
    private function enforceRateLimit(Request $request): void
    {
        $key = 'api_rate:' . $request->ip();
        $limit = auth()->check() ? 300 : 60; // Giriş yapanlara daha yüksek limit
        
        $current = Cache::increment($key);
        if ($current === 1) {
            Cache::expire($key, 60);
        }
        
        if ($current > $limit) {
            throw new TooManyRequestsException("Rate limit aşıldı. $limit istek/dakika");
        }
    }
}
```

## 11.3 Kimlik Doğrulama & 2FA

```php
// app/Services/Auth/TwoFactorAuthService.php

class TwoFactorAuthService
{
    public function enable(User $user): array
    {
        $secret = Google2FA::generateSecretKey(32);
        
        // Şifreli sakla
        $user->update([
            'two_factor_secret' => encrypt($secret),
            'two_factor_enabled' => false, // Doğrulama sonrası true
        ]);
        
        $qrCodeUrl = Google2FA::getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );
        
        // Yedek kodlar oluştur
        $backupCodes = $this->generateBackupCodes();
        $user->update([
            'two_factor_recovery_codes' => encrypt(json_encode($backupCodes))
        ]);
        
        return [
            'secret' => $secret,
            'qr_code_url' => $qrCodeUrl,
            'backup_codes' => $backupCodes,
        ];
    }
    
    public function verify(User $user, string $code): bool
    {
        $secret = decrypt($user->two_factor_secret);
        
        $valid = Google2FA::verifyKey($secret, $code, 1); // 1 window tolerance
        
        if ($valid) {
            $user->update(['two_factor_enabled' => true]);
        }
        
        return $valid;
    }
    
    private function generateBackupCodes(): array
    {
        return collect(range(1, 8))
            ->map(fn() => strtoupper(Str::random(10)))
            ->chunk(5)
            ->map(fn($chunk) => implode('-', $chunk->toArray()))
            ->values()
            ->toArray();
    }
}
```

## 11.4 Ödeme Güvenliği (PCI DSS)

```php
// KURAL: Kredi kartı verisini KESİNLİKLE saklama
// Tüm kart işlemleri iyzico/PayTR'ye devredilir

class PaymentService
{
    public function initiatePayment(Order $order, array $cardData): array
    {
        // Kart verisi ASLA veritabanına yazılmaz
        // Sadece ödeme gateway'ine iletilir
        
        return $this->iyzicoService->createPayment([
            'price' => $order->total,
            'paidPrice' => $order->total,
            'currency' => 'TRY',
            'installment' => 1,
            'basketId' => $order->order_number,
            'paymentChannel' => 'WEB',
            'paymentGroup' => 'PRODUCT',
            
            // Kart bilgisi - sadece iyzico API'ye gönderilir
            'paymentCard' => [
                'cardHolderName' => $cardData['holder_name'],
                'cardNumber' => $cardData['number'],
                'expireMonth' => $cardData['expire_month'],
                'expireYear' => $cardData['expire_year'],
                'cvc' => $cardData['cvc'],
                'registerCard' => 0, // Saklamıyoruz
            ],
        ]);
        
        // cardData bu noktadan sonra PHP'den tamamen silinir
        // unset($cardData); - GC'ye bırak
    }
    
    public function verifyWebhook(Request $request): bool
    {
        $signature = $request->header('X-Iyzico-Signature');
        $payload = $request->getContent();
        $secret = config('services.iyzico.secret_key');
        
        $expected = hash_hmac('sha256', $payload, $secret);
        return hash_equals($expected, $signature);
    }
}
```

## 11.5 Input Validation & Sanitization

```php
// app/Http/Requests/CreateProductRequest.php

class CreateProductRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:3', 'max:500', 'no_html'],
            'description' => ['nullable', 'string', 'max:50000'],
            'price' => ['required', 'numeric', 'min:0.01', 'max:9999999'],
            'sale_price' => ['nullable', 'numeric', 'lt:price', 'min:0.01'],
            'sku' => ['required', 'string', 'max:100', 'regex:/^[A-Za-z0-9\-_]+$/'],
            'stock' => ['required', 'integer', 'min:0', 'max:999999'],
            'category_id' => ['required', 'exists:categories,id'],
            'images' => ['nullable', 'array', 'max:10'],
            'images.*' => ['image', 'max:5120', 'mimes:jpeg,png,webp,avif'],
            'seo_title' => ['nullable', 'string', 'max:70'],
            'seo_description' => ['nullable', 'string', 'max:160'],
        ];
    }
    
    protected function prepareForValidation(): void
    {
        $this->merge([
            // HTML strip - XSS koruması (Purifier ile izin verilenler hariç)
            'name' => strip_tags($this->name ?? ''),
            'description' => clean($this->description ?? ''), // HTML Purifier
            'sku' => strtoupper(trim($this->sku ?? '')),
        ]);
    }
}

// Custom Validation Rule
class NoHtmlRule implements Rule
{
    public function passes($attribute, $value): bool
    {
        return $value === strip_tags($value);
    }
    
    public function message(): string
    {
        return ':attribute HTML içeremez.';
    }
}
```

## 11.6 Hassas Veri Şifreleme

```php
// Hassas alanlar için model casting

class Seller extends Model
{
    protected $casts = [
        'iban' => 'encrypted',
        'bank_account_name' => 'encrypted',
        'tax_number' => 'encrypted',
    ];
}

// .env
APP_KEY=base64:... // 32 byte AES-256-CBC key

// Loglamada hassas veri maskeleme
class SanitizeLogContext
{
    private array $sensitiveKeys = [
        'password', 'password_confirmation', 'card_number',
        'cvc', 'iban', 'tax_number', 'secret',
    ];
    
    public function sanitize(array $context): array
    {
        foreach ($context as $key => $value) {
            if (in_array(strtolower($key), $this->sensitiveKeys)) {
                $context[$key] = '***MASKED***';
            }
        }
        return $context;
    }
}
```

## 11.7 SQL Injection & XSS Koruması

```php
// SQL Injection - Eloquent ORM kullan, raw query'den kaçın

// ❌ GÜVENSİZ
$products = DB::select("SELECT * FROM products WHERE name = '$name'");

// ✅ GÜVENLİ - Parametre bağlama
$products = DB::select("SELECT * FROM products WHERE name = ?", [$name]);

// ✅ DAHA İYİ - Eloquent ORM
$products = Product::where('name', $name)->get();

// XSS Koruması - Blade Template
// Blade {{ }} otomatik htmlspecialchars uygular
{{ $product->name }}  // ✅ Güvenli

// {!! !!} sadece güvenilir HTML için
{!! $product->description !!}  // ⚠️ Sadece HTMLPurifier'dan geçmişse
```

## 11.8 OWASP Top 10 Checklist

```
✅ A01: Broken Access Control
   → Spatie Permission + Policy + Gate kontrolü
   → Her endpoint'de yetki kontrolü
   → IDOR koruması (UUID kullanımı)

✅ A02: Cryptographic Failures
   → TLS 1.3 zorunlu
   → Hassas veri şifreli saklanır
   → Kart verisi saklannmaz

✅ A03: Injection
   → Eloquent ORM kullanımı
   → Parametre bağlama
   → Input validation

✅ A04: Insecure Design
   → Threat modeling yapıldı
   → Defence in depth

✅ A05: Security Misconfiguration
   → APP_DEBUG=false (production)
   → Gereksiz servisler kapalı
   → Default credential yok

✅ A06: Vulnerable Components
   → composer audit
   → npm audit
   → Dependabot alerts

✅ A07: Auth & Session
   → Sanctum token (httpOnly cookie)
   → 2FA desteği
   → Session fixation koruması

✅ A08: Integrity Failures
   → GitHub Actions signed commits
   → Container image imzalama

✅ A09: Logging & Monitoring
   → Tüm auth eventleri loglanır
   → Anomali tespiti aktif
   → Log tampering koruması

✅ A10: SSRF
   → Dış URL'ler whitelist'te
   → Internal network erişimi engellendi
```
