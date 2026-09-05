# 18 — İŞ GEREKSİNİMLERİ & TEKNİK UYGULAMA HARİTASI

> Proje Sahibi: MSO Teknoloji  
> Tarih: Haziran 2026  
> Durum: Aktif Geliştirme

---

## SENARYO → TEKNİK UYGULAMA TABLOSU

| # | İş Gereksinimi | Teknik Uygulama | Öncelik | Sprint |
|---|---------------|-----------------|---------|--------|
| 1.1 | 5 onaylı mağaza (MSO, GYZGO, EN Yeniler...) | `stores` tablosu + `invite_only` flag | P0 | S1 |
| 1.2 | Abonelik bazlı ürün limiti, komisyonsuz | `subscriptions` + `packages` config | P0 | S1 |
| 1.3 | Mağaza logo/renk/vitrin özelleştirme | `store_settings` JSON + media upload | P1 | S2 |
| 2.1 | Sentos API entegrasyonu | `SentosIntegrationJob` queue | P1 | S3 |
| 2.2 | Kargo API otomasyonu (Yurtiçi, Aras, DHL) | `CargoService` abstract + adaptörler | P1 | S2 |
| 3.1 | WhatsApp float butonu (ürün linki otomatik) | Next.js `WhatsAppButton` komponenti | P0 | S1 |
| 3.2 | SMS + WhatsApp sipariş/kargo bildirimleri | `OrderPlaced`/`Shipped` event listeners | P0 | S2 |
| 4.1 | Pazar yeri yorum çekme botu | `ReviewScraperJob` (Puppeteer/Playwright) | P2 | S4 |
| 4.2 | Yorum yapana indirim teşviki | `review_rewards` + kupon otomasyonu | P1 | S3 |
| 5.1 | Pop-up: isim+tel → %15 kupon + KVKK | `LeadCapture` modal + KVKK consent | P0 | S1 |
| 5.2 | Kutu içi kupon (diğer pazar yerinden gelenler) | Basılabilir kupon PDF jeneratörü | P2 | S4 |
| 5.3 | Sepet terk kurtarma (WhatsApp) | `CartAbandoned` event + Automation | P1 | S2 |
| 6.1 | AI ürün başlık/açıklama önerisi | `ProductDescriptionAI` (mevcut) | P1 | S2 |
| 6.2 | Zorunlu görsel alt etiket | `ProductImage.alt_text` + form validation | P1 | S2 |
| 6.3 | SEO meta alanları her sayfada | `seo_title`, `seo_description` (mevcut) | P0 | S1 |
| 7.1 | LiteSpeed sunucu + OPcache | `deployment/litespeed.conf` | P2 | S5 |
| 7.2 | Dinamik mesafeli satış sözleşmesi PDF | `LegalDocumentService` + mPDF/DomPDF | P0 | S2 |
| 7.3 | KVKK pop-up onayı | `consents` tablosu + frontend checkbox | P0 | S1 |
| 7.4 | PayTR / İyzico ödeme entegrasyonu | `PaymentService` (mevcut altyapı) | P0 | S1 |
| 8.1 | Kolay iade modülü + otomatik kargo kodu | `returns` tablosu + `ReturnController` | P1 | S3 |
| 9.1 | Blog altyapısı + SEO odaklı içerik | `blog_posts`, `blog_categories` tabloları | P1 | S2 |
| 9.2 | İç linkleme motoru | `InternalLinkService` - AI destekli | P2 | S4 |
| 10.1 | airgunturk.com banner/backlink entegrasyonu | Forum `iframe` embed + UTM link | P1 | S3 |
| 10.2 | Forum balıkçılık bölümü açılması | Forum admin paneli üzerinden (manuel) | P2 | S4 |
| 11.1 | UTM takip sistemi | `utm_tracking` middleware + `analytics` tablo | P0 | S1 |
| 11.2 | Meta Ads pixel entegrasyonu | `MetaPixel` Next.js komponenti | P1 | S2 |
| 12.1 | 0212 bulut santral entegrasyonu | 3. parti VoIP API (Netgsm/Teknotel) | P2 | S4 |
| 12.2 | WhatsApp Business API toplu mesaj | `WhatsAppService` (mevcut) + kampanya UI | P1 | S2 |
| 12.3 | SMS API entegrasyonu (kurumsal başlık) | `SMSService` - Netgsm/İleti365 | P0 | S2 |

---

## 1. MAĞAZA YAPISI — DETAY

### İlk 5 Mağaza

```
MSO Teknoloji    → Ana mağaza (platform sahibi)
GYZGO            → 2. mağaza
EN Yeniler       → 3. mağaza
[4. Mağaza]      → Onaylı ortak
[5. Mağaza]      → Onaylı ortak
```

### Invite-Only Mekanizması

```php
// config/marketplace.php
'registration' => [
    'mode' => 'invite_only',  // 'open' | 'invite_only' | 'closed'
    'invite_expiry_hours' => 48,
],

// sellers tablosuna eklenecek:
// invite_token VARCHAR(64) NULL
// invited_by BIGINT NULL (admin user_id)
// invited_at TIMESTAMP NULL
```

---

## 3. WHATSAPP BUTONU — TEKNİK SPEC

```typescript
// Her ürün sayfasında otomatik mesaj:
const message = `Merhaba! ${productName} hakkında bilgi almak istiyorum.
Ürün linki: ${productUrl}
Stok ve teslimat hakkında bilgi alabilir miyim?`

const waUrl = `https://wa.me/905XXXXXXXXX?text=${encodeURIComponent(message)}`
```

---

## 4.1. YORUM ÇEKME BOTU — MİMARİ

```
Teknoloji: Puppeteer (Node.js) veya PHP Panther
Kaynak: Trendyol, Hepsiburada ürün sayfaları
Eşleştirme: Ürün SKU / Barkod bazlı
Frekans: Günde 1 kez (gece 02:00)
Rate Limiting: Her platform için 5 saniye bekleme
Saklama: scraped_reviews tablosu (is_imported flag)
Etik Not: Sadece kendi ürünlerimizin yorumları çekilir
```

```sql
CREATE TABLE scraped_reviews (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    platform ENUM('trendyol','hepsiburada','n11','amazon') NOT NULL,
    external_review_id VARCHAR(100) NULL,
    rating TINYINT NOT NULL,
    content TEXT NOT NULL,
    reviewer_name VARCHAR(100) NULL,
    review_date DATE NULL,
    is_imported BOOLEAN DEFAULT FALSE,
    imported_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product (product_id),
    UNIQUE KEY unique_platform_review (platform, external_review_id)
);
```

---

## 5.1. LEAD CAPTURE POP-UP — KVKK UYUMLU AKIŞ

```
1. Kullanıcı siteye ilk giriş yapar
2. 3 saniye bekle (UX için)
3. Pop-up açılır:
   - "Hoş geldiniz! %15 İndirim Kazanın"
   - Ad Soyad (zorunlu)
   - Telefon (zorunlu, Türkiye formatı)
   - KVKK onay checkbox (zorunlu)
   - Ticari ileti onay checkbox (isteğe bağlı)
4. Form gönderilince:
   - `leads` tablosuna kaydet
   - Benzersiz %15 kupon kodu oluştur
   - Kupon kodu ekranda göster
   - 30 gün cookie koy (tekrar göstermemek için)
   - WhatsApp üzerinden karşılama mesajı gönder (isteğe bağlı)
```

---

## 7.2. MESAFELİ SATIŞ SÖZLEŞMESİ — DİNAMİK ÜRETİM

```php
// Sipariş tamamlanınca otomatik:
// 1. Sözleşme verilerini doldur (sipariş no, ürünler, alıcı, satıcı)
// 2. Blade template'i → HTML → DomPDF ile PDF
// 3. S3'e yükle
// 4. Müşteriye mail ile gönder
// 5. Sipariş detayında "Sözleşmemi İndir" linki

// Gerekli yasal belgeler:
// - Mesafeli Satış Sözleşmesi (6502 sayılı Kanun)
// - Ön Bilgilendirme Formu
// - İptal ve İade Politikası
```

---

## 8.1. İADE MODÜLÜ — AKIŞ

```
Müşteri:
1. "Siparişlerim" → Sipariş detay → "İade Talebi"
2. Ürün seç → İade sebebi seç → Açıklama gir → Fotoğraf yükle
3. Sistem otomatik kargo kodu üretir (Yurtiçi/Aras anlaşmalı)
4. Müşteri e-posta + SMS ile kargo kodunu alır

Satıcı:
1. İade talebi bildirim alır
2. Onaylar → Kargo kodu etkinleşir
3. Ürün depoya gelince "Teslim Alındı" işaretler
4. Para iadesi (müşterinin ödeme yöntemiyle)

Tablolar:
- returns (id, order_item_id, reason, description, images, status, cargo_code)
- return_status_history
```

---

## 9. BLOG MİMARİSİ

```
Blog hedef kategoriler (SEO odaklı):
1. "Yapay Zeka Araçları" → AI konuları
2. "Web Teknolojileri" → Genel tech
3. "Akıllı Cihazlar" → Ürün kategorileriyle ilgili
4. "Satın Alma Rehberleri" → Conversion odaklı

İç linkleme stratejisi:
Blog yazısı → İlgili kategori sayfası → Ürün sayfası

Airgunturk.com backlink planı:
- Forum imzalarına site linki
- "Sponsorlu" bölüm açma
- Forum ana sayfasına banner (300×250 ve 728×90)
- UTM: utm_source=airgunturk&utm_medium=forum&utm_campaign=organic
```

---

## 10. FORUM ENTEGRASYON PLANI

```
airgunturk.com (mevcut forum) ↔ msoteknoloji.com.tr

Entegrasyon Yöntemleri:
1. Banner Reklam (Hızlı): Forum admin panelinden banner slot
   → 728×90 header banner
   → 300×250 sidebar banner
   → UTM parametreli linkler

2. Balıkçılık Bölümü: Yeni forum kategorisi aç
   → Moderatör ata
   → İlk 10-20 "seed" konusu açılır
   → Organik büyüme beklenir

3. Forum Profil Linkleri: Aktif moderatör hesaplarının
   imzalarına mağaza linkini ekle

4. Backlink Değeri:
   - 20 yıllık domain authority
   - Google'da "Hava Silahları" kategorisinde yüksek otorite
   - Bu otoritenin bir kısmı msoteknoloji.com.tr'ye aktarılır
   - Etkisi: 3-6 ay içinde Google sıralamalarında iyileşme

5. İçerik Köprüsü: Forum konularında doğal ürün önerileri
   Örnek: "En iyi havalı silah temizlik kitleri" konusunda
   mağazadaki temizlik ürünlerine link
```

---

## 11. UTM + ANALYTICS SİSTEMİ

```php
// Her dış link için UTM parametreleri:
// utm_source=airgunturk|instagram|facebook|trendyol-kutu
// utm_medium=forum|social|organic|print
// utm_campaign=banner|reels|story|kutu-kuponu
// utm_content=ana-sayfa|urun-detay|kategori
// utm_term=gaming-mouse|telefon-kilif

// Dönüşüm izleme:
// 1. Kullanıcı utm_source=airgunturk linki takip eder
// 2. Cookie'ye kaydedilir (30 gün)
// 3. Satın alırsa analytics tablosuna kaydedilir
// 4. Satıcı panelinde UTM raporu gösterilir
```

---

## 12. KURUMSAL İLETİŞİM STACK

```
0212 Numarası:       Netgsm / Bulut Santral
WhatsApp Business:   Meta Business API (resmi)
                     VEYA
                     3. parti panel (daha hızlı onay için)
SMS API:             Netgsm SMS API (msoteknoloji başlığıyla)
E-posta:             Google Workspace veya Yandex360
                     @msoteknoloji.com.tr

WhatsApp Akışları:
1. Sipariş onayı → Otomatik WhatsApp
2. Kargo kodu → Otomatik WhatsApp
3. Teslim edildi → Otomatik WhatsApp
4. Yorum isteği (3 gün sonra) → Template mesaj
5. Toplu kampanya → Segment bazlı gönderim
```


---

## ✅ UYGULAMA KAYDI — Haziran 2026

Bu bölüm, yukarıdaki iş gereksinimlerinin kod tabanına nasıl yansıtıldığını dosya bazında belgelendirir. Tüm yollar `backend/` köküne görelidir.

### 1. Komisyonsuz Üyelik / Paketler
| Gereksinim | Dosya |
|---|---|
| Paket tanımları (Starter 299 TL / 500 ürün, Professional 699 TL / 2000, Enterprise 1999 TL / sınırsız) | `config/marketplace.php` |
| Abonelik modeli + `isActive` + `productLimit` | `app/Models/Subscription.php` |
| Satıcı self-service paket seçimi | `app/Http/Controllers/Seller/SubscriptionController.php` |
| Admin panel CRUD | `app/Filament/Resources/SubscriptionResource.php` |
| Davetli kayıt akışı (invite_token) | `database/migrations/2026_06_01_140001_add_invite_fields_to_sellers_table.php` |

### 2. Mağaza Özelleştirme
| Gereksinim | Dosya |
|---|---|
| Tema rengi, banner, logo, duyuru şeridi, vitrin blokları | `app/Models/Store.php` + `database/migrations/2026_06_01_140006_create_product_images_and_showcase.php` |
| Showcase yönetimi | `app/Models/StoreShowcaseSection.php` |
| Satıcı paneli endpoint'leri | `app/Http/Controllers/Seller/StoreCustomizationController.php` |
| Admin paneli | `app/Filament/Resources/StoreResource.php` |

### 3. Sentos Entegrasyonu (Stok / Ürün / Sipariş Senkronu)
| Gereksinim | Dosya |
|---|---|
| Konfigürasyon | `config/integrations.php` (sentos) |
| Satıcı başına entegrasyon kaydı | `app/Models/SentosIntegration.php` + `2026_06_01_140005_create_sentos_integration_and_cargo_fields.php` |
| HTTP istemcisi | `app/Services/Integrations/SentosClient.php` |
| Periyodik iş | `app/Jobs/SyncSentosProductsJob.php` |
| CLI komutu | `app/Console/Commands/SyncSentos.php` (sentos:sync) |
| Schedule (15 dk) | `routes/console.php` |
| Satıcı paneli endpoint | `app/Http/Controllers/Seller/SentosIntegrationController.php` |

### 4. Kargo Otomasyonu (Yurtiçi/Aras/MNG/PTT/DHL)
| Gereksinim | Dosya |
|---|---|
| Sağlayıcı yapılandırması | `config/cargo.php` |
| Strategy/Adapter | `app/Services/Cargo/CargoManager.php` + `app/Services/Cargo/Adapters/*Adapter.php` |
| OrderItem üzerine kargo alanları | `2026_06_01_140005_create_sentos_integration_and_cargo_fields.php` |
| Kargo etiketi tetikleyici | `app/Listeners/SendOrderShippedNotifications.php` |

### 5. Akıllı WhatsApp Butonu
| Gereksinim | Dosya |
|---|---|
| Şablon yönetimi | `config/marketplace.php` (whatsapp_button) |
| Link oluşturucu | `app/Http/Controllers/Api/WhatsAppRedirectController.php` |
| Mağaza WA numarası | `app/Models/Store.php` (whatsapp_number) |
| Route | `routes/api.php` (whatsapp/redirect) |

### 6. SMS + WhatsApp Bildirimleri (sipariş alındı/kargoda/teslim)
| Gereksinim | Dosya |
|---|---|
| Sağlayıcı arayüzleri | `app/Services/Notifications/Contracts/{SmsProvider,WhatsAppProvider}.php` |
| Netgsm SMS / Meta WhatsApp Cloud | `app/Services/Notifications/Providers/*.php` |
| Şablonlar (order_confirmed, order_shipped, order_delivered, cart_recovery, lead_welcome, review_request) | `config/notifications.php` |
| Log tablosu | `2026_06_01_140004_create_notification_logs_table.php` + `app/Models/NotificationLog.php` |
| Event-Listener pipeline | `app/Events/OrderPlaced.php`, `OrderShipped.php`, `OrderDelivered.php` + `app/Listeners/*Notifications.php` |
| KVKK opt-in alanları | `2026_06_01_140000_add_contact_fields_to_users_table.php` |

### 7. Pazar Yeri Yorum Scraping Bot'u
| Gereksinim | Dosya |
|---|---|
| Tablo + kaynak alanları (trendyol/hepsiburada/n11/amazon/pttavm) | `2026_06_01_140003_create_scraped_reviews_table.php` |
| Model | `app/Models/ScrapedReview.php` |
| Job | `app/Jobs/ScrapeMarketplaceReviewsJob.php` |
| CLI komutu | `app/Console/Commands/ScrapeMarketplaceReviews.php` (reviews:scrape) |
| Schedule (gece 02:00) | `routes/console.php` |

### 8. Yorum Yapana 25 TL Kupon
| Gereksinim | Dosya |
|---|---|
| Konfig | `config/marketplace.php` (coupons.review_reward) |
| Üretici metot | `app/Services/Coupons/CouponService::issueReviewRewardCoupon` |
| Tetik | `app/Jobs/SendReviewReminderJob.php` + sipariş teslim listener |

### 9. Lead Toplama Pop-up'ı + %15 Hoş Geldin Kuponu
| Gereksinim | Dosya |
|---|---|
| Lead modeli + KVKK / ticari ileti onayları | `app/Models/Lead.php` |
| API + KVKK validation | `app/Http/Controllers/Api/LeadController.php` |
| Kupon üretimi (WELCOME-XXXXXX, %15, ilk sipariş) | `app/Services/Coupons/CouponService::issueWelcomeCoupon` |
| Admin paneli | `app/Filament/Resources/LeadResource.php` |

### 10. Kutu İçi Kupon (Box Insert)
| Gereksinim | Dosya |
|---|---|
| Üretici | `app/Services/Coupons/CouponService::issueBoxInsertCoupon` |
| Kupon kaynak enum | `2026_06_01_140002_create_coupons_table.php` (source = box_insert) |
| Admin paneli | `app/Filament/Resources/CouponResource.php` |

### 11. Sepet Terk Etme Geri Kazanım
| Gereksinim | Dosya |
|---|---|
| Komut + işleyici | `app/Console/Commands/ProcessAbandonedCarts.php` + `routes/console.php` (hourly) |
| Event + Listener | `app/Events/CartAbandoned.php` + `app/Listeners/TriggerCartAbandonmentFlow.php` |
| Job (1 saat gecikmeli WA) | `app/Jobs/SendCartRecoveryMessageJob.php` |
| Kupon üretici (GERIDON-*) | `CouponService::issueCartRecoveryCoupon` |

### 12. Yapay Zeka Ürün İçeriği Optimizer'ı (Claude)
| Gereksinim | Dosya |
|---|---|
| Konfig | `config/integrations.php` (claude) |
| Servis | `app/Services/Ai/ProductOptimizerService.php` |
| Satıcı endpoint'i | `app/Http/Controllers/Seller/AiOptimizerController.php` (optimize + apply) |
| Ürün alanları | `ai_suggestions`, `ai_score`, `ai_generated_at` (mevcut migration) |

### 13. Zorunlu Resim Alt Etiketleri
| Gereksinim | Dosya |
|---|---|
| `product_images.alt_text` NOT NULL kolon | `2026_06_01_140006_create_product_images_and_showcase.php` |
| Model | `app/Models/ProductImage.php` |

### 14. Dinamik KVKK & Mesafeli Satış Sözleşmesi
| Gereksinim | Dosya |
|---|---|
| Şablon | `resources/views/legal/mesafeli-satis-sozlesmesi.blade.php` |
| PDF üretici (DomPDF) | `app/Services/Legal/LegalDocumentService.php` |
| Job + E-posta gönderimi | `app/Jobs/GenerateOrderContractJob.php` + `app/Notifications/SalesContractNotification.php` |
| Otomasyon (sipariş alındı) | `app/Listeners/SendOrderPlacedNotifications.php` |

### 15. PayTR + İyzico Ödeme Altyapısı
| Gereksinim | Dosya |
|---|---|
| Konfig | `config/payments.php` |
| Sözleşme | `app/Services/Payments/Contracts/PaymentGateway.php` |
| Manager + gateway'ler | `app/Services/Payments/PaymentManager.php` + `Gateways/{Iyzico,PayTr}Gateway.php` |

### 16. Kolay İade
| Gereksinim | Dosya |
|---|---|
| Model + tablo | `app/Models/ProductReturn.php` (returns tablosu) |
| Müşteri endpoint'leri | `app/Http/Controllers/Api/ReturnController.php` |
| Otomatik kargo etiketi | `Cargo\CargoManager::returnDriver()` |
| Admin paneli | `app/Filament/Resources/ProductReturnResource.php` |

### 17. Blog / SEO / Forum Entegrasyonu
| Gereksinim | Dosya |
|---|---|
| Blog modeli + tablosu (mevcut) | `app/Models/BlogPost.php` |
| Forum bağlantısı | `config/integrations.php` (forum.airgunturk_url) |
| UTM takibi | `app/Http/Middleware/TrackUtm.php` (mevcut + bootstrap'a kayıtlı) |

### 18. 0212 PBX + WhatsApp Business + SMS Konsolidasyonu
| Gereksinim | Dosya |
|---|---|
| Numara + dahili eşleme | `config/integrations.php` (pbx) |
| WA Business sağlayıcı | `app/Services/Notifications/Providers/MetaWhatsAppProvider.php` |
| Tüm bildirim akışı | `app/Services/Notifications/{SmsService,WhatsAppService}.php` |

---

### Servis Sağlayıcı Bağlamaları
`app/Providers/AppServiceProvider.php` — config-driven `match` ile şu binding'leri kurar:

- `SmsProvider` → `netgsm | iletimerkezi | log`
- `WhatsAppProvider` → `meta_cloud | wati | log`
- `CargoManager` (singleton, runtime `driver(?name)` çözücüsü)
- `PaymentManager` (singleton)

Ayrıca `boot()` içinde tüm domain event → listener eşlemeleri `Event::listen` ile bağlandı (`CartAbandoned`, `OrderPlaced`, `OrderShipped`, `OrderDelivered`).

### API Rotaları
`routes/api.php` rotaları:

**Public:** `GET /cart`, `POST /cart/add`, `DELETE /cart/items/{id}`, `POST /cart/clear`, `POST /coupons/validate`, `POST /whatsapp/redirect`, `POST /leads`.

**Auth (sanctum):** `GET/POST /returns`, `GET /returns/{id}`.

**Seller (sanctum + role:seller):** `GET/PUT /seller/store`, `PUT /seller/store/showcase`, `GET /seller/subscription`, `POST /seller/subscription`, `GET/PUT /seller/integrations/sentos`, `POST /seller/integrations/sentos/sync`, `POST /seller/products/{id}/optimize`, `POST /seller/products/{id}/optimize/apply`.

### Zamanlanmış Görevler (`routes/console.php`)
- `carts:process-abandoned` — saatlik
- `sentos:sync` — 15 dakikada bir
- `reviews:scrape --platform=trendyol` — günlük 02:00
- `reviews:scrape --platform=hepsiburada` — günlük 02:30

### Devreye Alma Adımları
1. Yeni migration'ları çalıştır: `php artisan migrate`
2. Autoload yenile: `composer dump-autoload`
3. `.env` içine ekle:
   - `MARKETPLACE_REGISTRATION_MODE=invite_only`
   - `SMS_DRIVER=netgsm` + `NETGSM_USER`, `NETGSM_PASSWORD`, `NETGSM_HEADER`
   - `WHATSAPP_DRIVER=meta_cloud` + `META_WHATSAPP_PHONE_ID`, `META_WHATSAPP_TOKEN`
   - `SENTOS_API_BASE`, `CLAUDE_API_KEY`, `IYZICO_API_KEY`, `PAYTR_MERCHANT_ID`
4. Queue worker'ı başlat: `php artisan queue:work --queue=default,notifications`
5. Scheduler için cron: `* * * * * cd /var/www && php artisan schedule:run`

### Henüz Yapılmamış (Frontend)
Bu sürüm yalnızca **backend** kapsamlıdır. Next.js tarafında implement edilmesi gereken bileşenler:

- Lead pop-up modal (3. saniyede / exit-intent)
- Mağaza tema editör paneli
- WhatsApp kayar buton (kategori/ürün şablonlu)
- Sepet kurtarma e-posta/WA tıklama landing'i
- Satıcı paneli (AI optimizer, Sentos entegrasyon, abonelik yönetimi)
- KVKK pop-up'ı (cookie consent)
