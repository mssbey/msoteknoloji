# 01 — SİSTEM MİMARİSİ

## 1.1 Genel Mimari Diyagram

```
                         ┌─────────────────────────────────────────┐
                         │          CloudFlare (CDN + WAF)          │
                         └─────────────────┬───────────────────────┘
                                           │
          ┌────────────────────────────────┼────────────────────────────────┐
          │                               │                                │
   ┌──────┴──────┐                ┌───────┴──────┐                ┌────────┴──────┐
   │  Next.js 15  │                │  Next.js 15  │                │  Next.js 15   │
   │  (Customer)  │                │  (Seller)    │                │  (Admin)      │
   │  Port 3000   │                │  Port 3001   │                │  Port 3002    │
   └──────┬──────┘                └───────┬──────┘                └────────┬──────┘
          │                               │                                │
          └────────────────────────────────┼────────────────────────────────┘
                                           │
                                  ┌────────┴────────┐
                                  │   Nginx Reverse  │
                                  │   Proxy + Load   │
                                  │   Balancer       │
                                  └────────┬─────────┘
                                           │
                         ┌─────────────────┼─────────────────┐
                         │                 │                 │
                  ┌──────┴──────┐  ┌───────┴──────┐  ┌──────┴──────┐
                  │  Laravel 12  │  │  Laravel 12   │  │  Laravel 12  │
                  │  App Node 1  │  │  App Node 2   │  │  App Node 3  │
                  └──────┬──────┘  └───────┬──────┘  └──────┬──────┘
                         │                 │                 │
          ┌──────────────┼─────────────────┼─────────────────┼──────────────┐
          │              │                 │                 │              │
   ┌──────┴───┐  ┌───────┴──┐     ┌───────┴──┐     ┌───────┴──┐  ┌────────┴──┐
   │  MySQL   │  │  Redis   │     │Meilisearch│     │   S3     │  │  Redis    │
   │  8.2     │  │  Cache   │     │  Search  │     │ Storage  │  │  Queue    │
   │ Primary  │  │          │     │          │     │          │  │ (Horizon) │
   └──────┬───┘  └──────────┘     └──────────┘     └──────────┘  └───────────┘
          │
   ┌──────┴───┐
   │  MySQL   │
   │  Replica │
   └──────────┘
```

## 1.2 Paket Sistemi & Abonelik Modeli

### Paket Tanımları

```php
// config/packages.php

return [
    'starter' => [
        'name' => 'Starter',
        'monthly_price' => 299,   // TL
        'yearly_price' => 2990,   // TL (%17 indirim)
        'product_limit' => 500,
        'features' => [
            'store_panel' => true,
            'order_panel' => true,
            'cargo_panel' => true,
            'finance_panel' => true,
            'coupon_panel' => true,
            'blog_panel' => true,
            'campaign_panel' => true,
            'variant_support' => true,
            'bulk_upload' => false,
            'excel_import' => false,
            'xml_import' => false,
            'sentos_integration' => false,
            'ai_description' => 5,  // aylık 5 AI kredi
            'analytics_level' => 'basic',
            'api_access' => false,
            'custom_domain' => false,
            'b2b_access' => false,
            'advertising' => false,
        ],
    ],
    
    'professional' => [
        'name' => 'Professional',
        'monthly_price' => 699,
        'yearly_price' => 6990,
        'product_limit' => 2000,
        'features' => [
            // starter'ın tümü +
            'bulk_upload' => true,
            'excel_import' => true,
            'xml_import' => true,
            'sentos_integration' => true,
            'ai_description' => 50,
            'analytics_level' => 'advanced',
            'api_access' => true,
            'custom_domain' => true,
            'b2b_access' => false,
            'advertising' => true,
            'whatsapp_crm' => 'basic',
            'affiliate' => true,
        ],
    ],
    
    'enterprise' => [
        'name' => 'Enterprise',
        'monthly_price' => 1999,
        'yearly_price' => 19990,
        'product_limit' => -1,   // sınırsız
        'features' => [
            // professional'ın tümü +
            'ai_description' => -1,  // sınırsız
            'analytics_level' => 'enterprise',
            'b2b_access' => true,
            'whatsapp_crm' => 'advanced',
            'dedicated_support' => true,
            'custom_integrations' => true,
            'sla' => '99.9%',
            'multi_warehouse' => true,
            'erp_integration' => true,
            'dynamic_pricing' => true,
            'ai_pricing' => true,
        ],
    ],
];
```

## 1.3 Rol & Permission Sistemi

### Roller Hiyerarşisi

```
SUPER ADMIN
  └── Platform sahibi, tüm erişim

ADMIN
  └── Platform yöneticisi (atamalı)
  
MODERATOR
  └── İçerik moderasyonu, forum yönetimi

SELLER (SATICI)
  ├── Store Owner (Mağaza Sahibi)
  ├── Store Manager (Mağaza Yöneticisi)
  ├── Store Staff (Mağaza Personeli)
  └── Store Analyst (Sadece rapor görür)

B2B FIRM (KURUMSAL ALICI)
  ├── Firm Admin
  └── Firm Buyer (Alıcı Personel)

SUPPLIER (TEDARİKÇİ)
  ├── Supplier Admin
  └── Supplier Staff

AFFILIATE (PARTNER)
  └── Komisyon bazlı link paylaşımcısı

CUSTOMER (MÜŞTERİ)
  └── Standart alışveriş kullanıcısı
```

### Permission Listesi (Tüm Modüller)

```php
// Spatie Laravel Permission ile

$permissions = [
    // ──── MARKETPLACE ────
    'marketplace.view',
    'marketplace.manage',
    
    // ──── SATICI ────
    'sellers.view',
    'sellers.create',
    'sellers.edit',
    'sellers.delete',
    'sellers.approve',
    'sellers.suspend',
    'sellers.ban',
    'sellers.impersonate',    // Admin satıcı hesabına gir
    
    // ──── MAĞAZA ────
    'store.view',
    'store.edit',
    'store.settings',
    'store.design',
    
    // ──── ÜRÜN ────
    'products.view',
    'products.create',
    'products.edit',
    'products.delete',
    'products.approve',
    'products.bulk_upload',
    'products.excel_import',
    'products.xml_import',
    'products.ai_generate',
    
    // ──── SİPARİŞ ────
    'orders.view',
    'orders.process',
    'orders.cancel',
    'orders.refund',
    'orders.export',
    
    // ──── KARGO ────
    'cargo.view',
    'cargo.create_shipment',
    'cargo.track',
    'cargo.return_manage',
    
    // ──── FİNANS ────
    'finance.view',
    'finance.withdraw_request',
    'finance.view_transactions',
    'finance.export_reports',
    'finance.manage_payouts',    // sadece admin
    
    // ──── KUPON ────
    'coupons.view',
    'coupons.create',
    'coupons.edit',
    'coupons.delete',
    
    // ──── KAMPANYA ────
    'campaigns.view',
    'campaigns.create',
    'campaigns.edit',
    'campaigns.publish',
    'campaigns.delete',
    
    // ──── BLOG ────
    'blog.view',
    'blog.create',
    'blog.edit',
    'blog.publish',
    'blog.delete',
    
    // ──── CRM ────
    'crm.view',
    'crm.leads.manage',
    'crm.segments.manage',
    'crm.whatsapp.send',
    'crm.sms.send',
    'crm.email.send',
    'crm.automation.manage',
    
    // ──── REKLAM ────
    'ads.view',
    'ads.create',
    'ads.edit',
    'ads.delete',
    'ads.budget_manage',
    
    // ──── B2B ────
    'b2b.view',
    'b2b.firms.approve',
    'b2b.pricing.manage',
    'b2b.orders.manage',
    'b2b.credit.manage',
    
    // ──── TEDARİKÇİ ────
    'supplier.view',
    'supplier.products.manage',
    'supplier.orders.view',
    'supplier.bulk_update',
    
    // ──── AFFİLİATE ────
    'affiliate.view',
    'affiliate.links.create',
    'affiliate.commissions.view',
    'affiliate.payouts.request',
    'affiliate.manage',          // admin
    
    // ──── ANALİTİK ────
    'analytics.basic',
    'analytics.advanced',
    'analytics.enterprise',
    'analytics.export',
    
    // ──── FORUM ────
    'forum.view',
    'forum.post',
    'forum.moderate',
    'forum.categories.manage',
    
    // ──── ADMIN PANELİ ────
    'admin.access',
    'admin.settings',
    'admin.users.manage',
    'admin.roles.manage',
    'admin.subscriptions.manage',
    'admin.system.logs',
    'admin.ai.dashboard',
    'admin.fraud.manage',
];
```

## 1.4 Çok Kiracılı (Multi-Tenant) Mimari

```php
// Her satıcı = bir "tenant" (kiracı)
// Veritabanı stratejisi: Shared Database + Row-Level Isolation
// (seller_id foreign key ile)

// Middleware: EnsureSellerContext
class EnsureSellerContext
{
    public function handle(Request $request, Closure $next)
    {
        $seller = $request->user()->seller;
        
        if (!$seller || !$seller->isActive()) {
            return response()->json(['error' => 'Mağaza erişimi yok'], 403);
        }
        
        // Global scope ile tüm sorgulara seller_id filtresi
        app()->instance('current_seller', $seller);
        
        return $next($request);
    }
}

// Global Scope örneği
class SellerScope implements Scope
{
    public function apply(Builder $builder, Model $model)
    {
        if (app()->has('current_seller')) {
            $builder->where('seller_id', app('current_seller')->id);
        }
    }
}
```

## 1.5 Servis Katmanları

```
REQUEST → Controller → Service → Repository → Model → Database
                    ↓
              Event/Job Dispatch
                    ↓
             Queue Worker (Redis)
                    ↓
           Notification/Webhook
```

### Temel Servis Listesi

```
App/Services/
├── Marketplace/
│   ├── ProductService.php
│   ├── OrderService.php
│   ├── CartService.php
│   └── CheckoutService.php
├── Seller/
│   ├── SellerOnboardingService.php
│   ├── SubscriptionService.php
│   └── SellerAnalyticsService.php
├── AI/
│   ├── ProductDescriptionAI.php
│   ├── SEOAssistantAI.php
│   ├── PricingAI.php
│   ├── CampaignAI.php
│   ├── FraudDetectionAI.php
│   └── CustomerSupportAI.php
├── CRM/
│   ├── WhatsAppService.php
│   ├── SMSService.php
│   ├── EmailMarketingService.php
│   └── AutomationService.php
├── B2B/
│   ├── B2BPricingService.php
│   ├── CreditService.php
│   └── ERPIntegrationService.php
├── Logistics/
│   ├── CargoService.php
│   └── TrackingService.php
├── Finance/
│   ├── PaymentService.php
│   ├── PayoutService.php
│   └── InvoiceService.php
├── Analytics/
│   ├── SalesAnalyticsService.php
│   ├── CohortService.php
│   └── RFMService.php
└── Search/
    └── MeilisearchService.php
```
