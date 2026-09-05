# 03 — API YAPISI & ENDPOINT HARİTASI

## 3.1 API Tasarım İlkeleri

```
Base URL:  https://api.msocommerce.com/v1
Auth:      Bearer Token (Laravel Sanctum)
Format:    JSON
Versioning: URI path (/v1, /v2)
Rate Limit: 60/min (default), 300/min (premium)
```

### Standart Response Formatı

```json
// Başarılı
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "last_page": 8
  }
}

// Hatalı
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Email adresi geçersiz"],
    "price": ["Fiyat 0'dan büyük olmalı"]
  },
  "code": "VALIDATION_ERROR"
}
```

## 3.2 Kimlik Doğrulama API

```
POST   /auth/register              Kayıt ol
POST   /auth/login                 Giriş yap
POST   /auth/logout                Çıkış yap
POST   /auth/refresh               Token yenile
POST   /auth/forgot-password       Şifre sıfırlama isteği
POST   /auth/reset-password        Şifre sıfırla
POST   /auth/verify-email          Email doğrula
POST   /auth/verify-phone          Telefon doğrula
POST   /auth/send-otp              OTP gönder
POST   /auth/verify-otp            OTP doğrula
GET    /auth/me                    Kullanıcı bilgileri
PUT    /auth/profile               Profil güncelle
POST   /auth/two-factor/enable     2FA aktif et
POST   /auth/two-factor/disable    2FA pasif et
GET    /auth/social/{provider}     Sosyal giriş (Google/Apple)
POST   /auth/social/{provider}     Sosyal giriş callback
```

## 3.3 Ürün & Kategori API

```
-- Kategoriler
GET    /categories                 Tüm kategoriler (ağaç)
GET    /categories/{slug}          Kategori detayı
GET    /categories/{slug}/products Kategorideki ürünler

-- Markalar
GET    /brands                     Tüm markalar
GET    /brands/{slug}              Marka detayı
GET    /brands/{slug}/products     Markadaki ürünler

-- Ürünler (Public)
GET    /products                   Ürün listesi (filtreli)
GET    /products/{slug}            Ürün detayı
GET    /products/{slug}/variants   Ürün varyantları
GET    /products/{slug}/reviews    Ürün yorumları
GET    /products/{slug}/questions  Ürün soruları
GET    /products/{slug}/related    İlgili ürünler
GET    /products/search            Anlık arama (Meilisearch)
GET    /products/compare           Karşılaştır (id[]=1&id[]=2)
POST   /products/{slug}/view       Görüntülenme kaydı

-- Ürün Yorumları
POST   /products/{slug}/reviews    Yorum ekle
PUT    /reviews/{id}               Yorum düzenle
DELETE /reviews/{id}               Yorum sil
POST   /reviews/{id}/helpful       Yararlı oy
POST   /reviews/{id}/report        Yorum şikayet

-- Ürün Soruları
POST   /products/{slug}/questions  Soru sor
POST   /questions/{id}/answers     Yanıt ver

-- Mağazalar
GET    /stores                     Mağaza listesi
GET    /stores/{slug}              Mağaza detayı
GET    /stores/{slug}/products     Mağaza ürünleri
POST   /stores/{slug}/follow       Mağaza takip et
DELETE /stores/{slug}/follow       Takibi bırak
```

## 3.4 Alışveriş API

```
-- Sepet
GET    /cart                       Sepeti getir
POST   /cart/items                 Sepete ekle
PUT    /cart/items/{id}            Sepet güncelle
DELETE /cart/items/{id}            Sepetten çıkar
DELETE /cart                       Sepeti temizle
POST   /cart/coupon                Kupon uygula
DELETE /cart/coupon                Kuponu kaldır

-- Sipariş
POST   /checkout                   Sipariş oluştur
GET    /checkout/{uuid}/payment    Ödeme sayfası bilgileri
POST   /checkout/{uuid}/pay        Ödeme başlat
GET    /orders                     Siparişlerim
GET    /orders/{order_number}      Sipariş detayı
POST   /orders/{id}/cancel         Sipariş iptal
POST   /orders/{id}/return         İade talebi

-- Kargo Takip
GET    /tracking/{tracking_number} Kargo takip
GET    /orders/{id}/tracking       Sipariş kargo takip

-- İstek Listesi
GET    /wishlist                   İstek listesi
POST   /wishlist/{product_id}      İstek listesine ekle
DELETE /wishlist/{product_id}      İstek listesinden çıkar
```

## 3.5 Satıcı API (Seller Panel)

```
-- Seller Auth
POST   /seller/register            Satıcı kayıt
GET    /seller/profile             Profil
PUT    /seller/profile             Profil güncelle
GET    /seller/store               Mağaza bilgileri
PUT    /seller/store               Mağaza güncelle
GET    /seller/subscription        Abonelik bilgisi
POST   /seller/subscription/upgrade Paket yükselt

-- Dashboard
GET    /seller/dashboard           Ana sayfa verileri
GET    /seller/analytics/summary   Özet analitik
GET    /seller/analytics/sales     Satış analitik
GET    /seller/analytics/products  Ürün analitik

-- Ürün Yönetimi
GET    /seller/products            Ürünler
POST   /seller/products            Yeni ürün
GET    /seller/products/{id}       Ürün detayı
PUT    /seller/products/{id}       Ürün güncelle
DELETE /seller/products/{id}       Ürün sil
POST   /seller/products/{id}/images Görsel ekle
DELETE /seller/products/{id}/images/{imageId}
POST   /seller/products/bulk-upload Toplu yükleme
POST   /seller/products/excel-import Excel import
POST   /seller/products/xml-import  XML import
GET    /seller/products/import/status/{jobId} Import durumu
POST   /seller/products/{id}/ai-generate AI içerik üret

-- Varyant Yönetimi
GET    /seller/products/{id}/variants
POST   /seller/products/{id}/variants
PUT    /seller/products/{id}/variants/{variantId}
DELETE /seller/products/{id}/variants/{variantId}

-- Sipariş Yönetimi
GET    /seller/orders              Siparişler
GET    /seller/orders/{id}         Sipariş detayı
PUT    /seller/orders/{id}/status  Durum güncelle
POST   /seller/orders/{id}/shipment Kargo oluştur
GET    /seller/orders/export       Sipariş export

-- Finans
GET    /seller/finance/balance     Bakiye
GET    /seller/finance/transactions İşlemler
POST   /seller/finance/payout      Para çekme talebi
GET    /seller/finance/reports     Finansal raporlar
GET    /seller/finance/invoices    Faturalar

-- Kupon
GET    /seller/coupons             Kuponlar
POST   /seller/coupons             Kupon oluştur
PUT    /seller/coupons/{id}        Kupon güncelle
DELETE /seller/coupons/{id}        Kupon sil

-- Kampanya
GET    /seller/campaigns           Kampanyalar
POST   /seller/campaigns           Kampanya oluştur
PUT    /seller/campaigns/{id}      Kampanya güncelle
POST   /seller/campaigns/{id}/publish Yayınla
DELETE /seller/campaigns/{id}      Sil

-- Blog
GET    /seller/blog/posts          Blog yazıları
POST   /seller/blog/posts          Yeni yazı
PUT    /seller/blog/posts/{id}     Yazı güncelle
POST   /seller/blog/posts/{id}/publish Yayınla
DELETE /seller/blog/posts/{id}     Sil

-- CRM
GET    /seller/crm/customers       Müşteriler
GET    /seller/crm/segments        Segmentler
POST   /seller/crm/segments        Segment oluştur
POST   /seller/crm/whatsapp/send   WhatsApp gönder
POST   /seller/crm/sms/send        SMS gönder
POST   /seller/crm/email/campaign  E-posta kampanya
GET    /seller/crm/automations     Otomasyon listesi
POST   /seller/crm/automations     Otomasyon oluştur

-- Reklam
GET    /seller/ads/campaigns       Reklam kampanyaları
POST   /seller/ads/campaigns       Reklam oluştur
PUT    /seller/ads/campaigns/{id}  Reklam güncelle
GET    /seller/ads/reports         Reklam raporları

-- AI
POST   /seller/ai/product-description AI açıklama üret
POST   /seller/ai/seo               AI SEO önerisi
POST   /seller/ai/pricing           AI fiyat önerisi
POST   /seller/ai/campaign          AI kampanya önerisi
GET    /seller/ai/score             Optimizasyon puanı
GET    /seller/ai/insights          AI öneriler
```

## 3.6 Admin API

```
-- Dashboard
GET    /admin/dashboard            Ana panel verileri
GET    /admin/analytics/overview   Genel analiz
GET    /admin/live/orders          Canlı sipariş akışı (SSE)
GET    /admin/live/stats           Canlı istatistikler (SSE)

-- Kullanıcı Yönetimi
GET    /admin/users                Kullanıcılar
GET    /admin/users/{id}           Kullanıcı detayı
PUT    /admin/users/{id}           Güncelle
POST   /admin/users/{id}/ban       Yasakla
POST   /admin/users/{id}/impersonate Hesaba gir

-- Satıcı Yönetimi
GET    /admin/sellers              Satıcılar
GET    /admin/sellers/{id}         Satıcı detayı
PUT    /admin/sellers/{id}/approve Onayla
PUT    /admin/sellers/{id}/suspend Askıya al
POST   /admin/sellers/{id}/impersonate Hesaba gir

-- Ürün Onayı
GET    /admin/products/pending     Onay bekleyen
PUT    /admin/products/{id}/approve Onayla
PUT    /admin/products/{id}/reject  Reddet

-- Sipariş Yönetimi
GET    /admin/orders               Tüm siparişler
GET    /admin/orders/{id}          Sipariş detayı
PUT    /admin/orders/{id}          Sipariş güncelle

-- Finans
GET    /admin/finance/overview     Finansal özet
GET    /admin/finance/payouts      Para çekme talepleri
PUT    /admin/finance/payouts/{id}/approve Onayla
PUT    /admin/finance/payouts/{id}/reject  Reddet

-- Abonelik
GET    /admin/subscriptions        Abonelikler
POST   /admin/subscriptions/{id}/extend Uzat
POST   /admin/subscriptions/{id}/cancel İptal

-- AI Analitik
GET    /admin/ai/fraud-alerts      Fraud uyarıları
GET    /admin/ai/risk-sellers      Riskli satıcılar
GET    /admin/ai/insights          AI içgörüler

-- Sistem
GET    /admin/system/logs          Sistem logları
GET    /admin/system/health        Sistem sağlığı
POST   /admin/system/cache/clear   Cache temizle
GET    /admin/settings             Ayarlar
PUT    /admin/settings             Ayarları kaydet
```

## 3.7 B2B API

```
POST   /b2b/register               Firma kayıt
GET    /b2b/profile                Firma profili
GET    /b2b/products               B2B ürün listesi (özel fiyatlı)
GET    /b2b/products/{slug}        Ürün detayı (özel fiyat)
POST   /b2b/cart                   Sepete ekle
POST   /b2b/order                  Sipariş oluştur
POST   /b2b/order/bulk             Excel ile toplu sipariş
GET    /b2b/orders                 Siparişlerim
POST   /b2b/quote/request          Teklif iste
GET    /b2b/quotes                 Tekliflerim
GET    /b2b/current-account        Cari hesap
GET    /b2b/invoices               Faturalar
GET    /b2b/credit-info            Kredi bilgisi
```

## 3.8 Webhook & SSE

```
-- Server-Sent Events (SSE)
GET    /sse/orders/live            Canlı sipariş akışı
GET    /sse/notifications          Canlı bildirimler
GET    /sse/tracking/{id}          Canlı kargo takip

-- Webhooks (Gelen)
POST   /webhooks/iyzico            İyzico ödeme bildirimi
POST   /webhooks/paytr             PayTR ödeme bildirimi
POST   /webhooks/yurtici           Yurtiçi kargo güncelleme
POST   /webhooks/aras              Aras kargo güncelleme
POST   /webhooks/whatsapp          WhatsApp mesaj webhook
```

## 3.9 Arama & Öneri API

```
GET    /search                     Genel arama
GET    /search/suggestions         Anlık öneri (autocomplete)
GET    /search/popular             Popüler aramalar
POST   /search/ai                  AI destekli arama
GET    /recommendations/homepage   Ana sayfa önerileri
GET    /recommendations/product/{id} Ürüne göre öneri
GET    /recommendations/user       Kişisel öneri (auth gerekli)
GET    /recommendations/trending   Trend ürünler
```
