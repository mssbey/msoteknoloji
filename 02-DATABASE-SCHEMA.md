# 02 — DATABASE ŞEMASI (Tüm Modüller)

## 2.1 Kullanıcı & Auth Tabloları

```sql
-- ──────────────────────────────────────────
-- KULLANICILAR
-- ──────────────────────────────────────────

CREATE TABLE users (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid            CHAR(36) UNIQUE NOT NULL,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    phone           VARCHAR(20) NULL,
    phone_verified_at TIMESTAMP NULL,
    password        VARCHAR(255) NOT NULL,
    avatar          VARCHAR(500) NULL,
    locale          VARCHAR(10) DEFAULT 'tr',
    currency        VARCHAR(10) DEFAULT 'TRY',
    timezone        VARCHAR(50) DEFAULT 'Europe/Istanbul',
    status          ENUM('active','suspended','banned') DEFAULT 'active',
    last_login_at   TIMESTAMP NULL,
    last_login_ip   VARCHAR(45) NULL,
    two_factor_secret VARCHAR(255) NULL,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    referral_code   VARCHAR(20) UNIQUE NULL,
    referred_by     BIGINT UNSIGNED NULL REFERENCES users(id),
    metadata        JSON NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_referral (referral_code),
    INDEX idx_status (status)
);

CREATE TABLE user_addresses (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL REFERENCES users(id),
    title           VARCHAR(100) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    phone           VARCHAR(20) NOT NULL,
    country         VARCHAR(100) DEFAULT 'Türkiye',
    city            VARCHAR(100) NOT NULL,
    district        VARCHAR(100) NOT NULL,
    neighborhood    VARCHAR(100) NULL,
    postal_code     VARCHAR(10) NULL,
    address_line    TEXT NOT NULL,
    is_default      BOOLEAN DEFAULT FALSE,
    address_type    ENUM('home','office','other') DEFAULT 'home',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
    id              VARCHAR(255) PRIMARY KEY,
    user_id         BIGINT UNSIGNED NULL REFERENCES users(id),
    ip_address      VARCHAR(45) NULL,
    user_agent      TEXT NULL,
    payload         LONGTEXT NOT NULL,
    last_activity   INT NOT NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_last_activity (last_activity)
);

-- ──────────────────────────────────────────
-- ROLLER & İZİNLER (Spatie)
-- ──────────────────────────────────────────

CREATE TABLE roles (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    guard_name      VARCHAR(255) NOT NULL DEFAULT 'web',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_name_guard (name, guard_name)
);

CREATE TABLE permissions (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    guard_name      VARCHAR(255) NOT NULL DEFAULT 'web',
    group           VARCHAR(100) NULL,
    description     VARCHAR(500) NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_name_guard (name, guard_name)
);

CREATE TABLE model_has_roles (
    role_id         BIGINT UNSIGNED NOT NULL REFERENCES roles(id),
    model_type      VARCHAR(255) NOT NULL,
    model_id        BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (role_id, model_id, model_type),
    INDEX idx_model (model_type, model_id)
);

CREATE TABLE role_has_permissions (
    permission_id   BIGINT UNSIGNED NOT NULL REFERENCES permissions(id),
    role_id         BIGINT UNSIGNED NOT NULL REFERENCES roles(id),
    PRIMARY KEY (permission_id, role_id)
);
```

## 2.2 Satıcı & Mağaza Tabloları

```sql
-- ──────────────────────────────────────────
-- SATICILAR
-- ──────────────────────────────────────────

CREATE TABLE sellers (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL REFERENCES users(id),
    uuid            CHAR(36) UNIQUE NOT NULL,
    company_name    VARCHAR(255) NOT NULL,
    tax_number      VARCHAR(20) UNIQUE NOT NULL,
    tax_office      VARCHAR(100) NOT NULL,
    company_type    ENUM('individual','limited','anonim','other') NOT NULL,
    phone           VARCHAR(20) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    status          ENUM('pending','approved','suspended','banned') DEFAULT 'pending',
    package         ENUM('starter','professional','enterprise') DEFAULT 'starter',
    package_expires_at TIMESTAMP NULL,
    approved_at     TIMESTAMP NULL,
    approved_by     BIGINT UNSIGNED NULL REFERENCES users(id),
    iban            VARCHAR(30) NULL,
    bank_name       VARCHAR(100) NULL,
    bank_account_name VARCHAR(255) NULL,
    commission_rate DECIMAL(5,2) DEFAULT 0,
    balance         DECIMAL(15,2) DEFAULT 0.00,
    pending_balance DECIMAL(15,2) DEFAULT 0.00,
    total_sales     DECIMAL(15,2) DEFAULT 0.00,
    notes           TEXT NULL,
    metadata        JSON NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_package (package)
);

CREATE TABLE stores (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    seller_id       BIGINT UNSIGNED NOT NULL REFERENCES sellers(id),
    uuid            CHAR(36) UNIQUE NOT NULL,
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    description     TEXT NULL,
    logo            VARCHAR(500) NULL,
    banner          VARCHAR(500) NULL,
    favicon         VARCHAR(500) NULL,
    custom_domain   VARCHAR(255) NULL,
    theme_color     VARCHAR(7) DEFAULT '#000000',
    secondary_color VARCHAR(7) DEFAULT '#ffffff',
    is_active       BOOLEAN DEFAULT TRUE,
    is_featured     BOOLEAN DEFAULT FALSE,
    seo_title       VARCHAR(255) NULL,
    seo_description TEXT NULL,
    seo_keywords    TEXT NULL,
    og_image        VARCHAR(500) NULL,
    rating          DECIMAL(3,2) DEFAULT 0.00,
    review_count    INT UNSIGNED DEFAULT 0,
    follower_count  INT UNSIGNED DEFAULT 0,
    total_products  INT UNSIGNED DEFAULT 0,
    meta            JSON NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_seller_id (seller_id),
    INDEX idx_slug (slug),
    INDEX idx_featured (is_featured)
);

CREATE TABLE store_settings (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    store_id        BIGINT UNSIGNED NOT NULL REFERENCES stores(id),
    setting_key     VARCHAR(100) NOT NULL,
    setting_value   TEXT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_store_setting (store_id, setting_key)
);

CREATE TABLE store_followers (
    user_id         BIGINT UNSIGNED NOT NULL REFERENCES users(id),
    store_id        BIGINT UNSIGNED NOT NULL REFERENCES stores(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, store_id)
);

CREATE TABLE seller_staff (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    seller_id       BIGINT UNSIGNED NOT NULL REFERENCES sellers(id),
    user_id         BIGINT UNSIGNED NOT NULL REFERENCES users(id),
    role            ENUM('manager','staff','analyst') NOT NULL,
    permissions     JSON NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    invited_at      TIMESTAMP NULL,
    joined_at       TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 2.3 Kategori & Ürün Tabloları

```sql
-- ──────────────────────────────────────────
-- KATEGORİLER
-- ──────────────────────────────────────────

CREATE TABLE categories (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    parent_id       BIGINT UNSIGNED NULL REFERENCES categories(id),
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    description     TEXT NULL,
    image           VARCHAR(500) NULL,
    icon            VARCHAR(100) NULL,
    sort_order      INT UNSIGNED DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    is_featured     BOOLEAN DEFAULT FALSE,
    level           TINYINT UNSIGNED DEFAULT 0,
    path            VARCHAR(1000) NULL,
    seo_title       VARCHAR(255) NULL,
    seo_description TEXT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 0,
    attributes      JSON NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_parent (parent_id),
    INDEX idx_slug (slug),
    INDEX idx_active (is_active)
);

-- ──────────────────────────────────────────
-- ÜRÜNLER
-- ──────────────────────────────────────────

CREATE TABLE products (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    seller_id       BIGINT UNSIGNED NOT NULL REFERENCES sellers(id),
    store_id        BIGINT UNSIGNED NOT NULL REFERENCES stores(id),
    category_id     BIGINT UNSIGNED NOT NULL REFERENCES categories(id),
    uuid            CHAR(36) UNIQUE NOT NULL,
    name            VARCHAR(500) NOT NULL,
    slug            VARCHAR(500) NOT NULL,
    sku             VARCHAR(100) NOT NULL,
    barcode         VARCHAR(100) NULL,
    brand_id        BIGINT UNSIGNED NULL REFERENCES brands(id),
    description     LONGTEXT NULL,
    short_description TEXT NULL,
    
    -- Fiyatlandırma
    price           DECIMAL(12,2) NOT NULL,
    sale_price      DECIMAL(12,2) NULL,
    cost_price      DECIMAL(12,2) NULL,
    currency        VARCHAR(10) DEFAULT 'TRY',
    tax_rate        DECIMAL(5,2) DEFAULT 18,
    tax_included    BOOLEAN DEFAULT TRUE,
    
    -- Stok
    stock           INT DEFAULT 0,
    min_stock_alert INT DEFAULT 5,
    track_stock     BOOLEAN DEFAULT TRUE,
    allow_backorder BOOLEAN DEFAULT FALSE,
    
    -- Kargo
    weight          DECIMAL(8,3) NULL,
    width           DECIMAL(8,2) NULL,
    height          DECIMAL(8,2) NULL,
    depth           DECIMAL(8,2) NULL,
    shipping_class  VARCHAR(100) NULL,
    free_shipping   BOOLEAN DEFAULT FALSE,
    
    -- Durum
    status          ENUM('draft','pending','approved','rejected','archived') DEFAULT 'draft',
    is_active       BOOLEAN DEFAULT TRUE,
    is_featured     BOOLEAN DEFAULT FALSE,
    is_digital      BOOLEAN DEFAULT FALSE,
    is_bundle       BOOLEAN DEFAULT FALSE,
    
    -- SEO (AI üretebilir)
    seo_title       VARCHAR(255) NULL,
    seo_description TEXT NULL,
    seo_keywords    TEXT NULL,
    og_image        VARCHAR(500) NULL,
    
    -- İstatistik
    view_count      INT UNSIGNED DEFAULT 0,
    sale_count      INT UNSIGNED DEFAULT 0,
    rating          DECIMAL(3,2) DEFAULT 0.00,
    review_count    INT UNSIGNED DEFAULT 0,
    wishlist_count  INT UNSIGNED DEFAULT 0,
    
    -- AI
    ai_score        TINYINT UNSIGNED DEFAULT 0,
    ai_suggestions  JSON NULL,
    ai_generated_at TIMESTAMP NULL,
    
    -- Yayın
    published_at    TIMESTAMP NULL,
    approved_at     TIMESTAMP NULL,
    approved_by     BIGINT UNSIGNED NULL,
    rejection_reason TEXT NULL,
    
    metadata        JSON NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL,
    
    UNIQUE KEY unique_seller_sku (seller_id, sku),
    INDEX idx_seller (seller_id),
    INDEX idx_store (store_id),
    INDEX idx_category (category_id),
    INDEX idx_status (status),
    INDEX idx_price (price),
    INDEX idx_rating (rating),
    FULLTEXT idx_search (name, description, seo_keywords)
);

CREATE TABLE product_images (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id      BIGINT UNSIGNED NOT NULL REFERENCES products(id),
    url             VARCHAR(1000) NOT NULL,
    thumb_url       VARCHAR(1000) NULL,
    alt_text        VARCHAR(255) NULL,
    sort_order      INT UNSIGNED DEFAULT 0,
    is_primary      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_videos (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id      BIGINT UNSIGNED NOT NULL REFERENCES products(id),
    url             VARCHAR(1000) NOT NULL,
    thumbnail       VARCHAR(1000) NULL,
    title           VARCHAR(255) NULL,
    duration        INT UNSIGNED NULL,
    provider        ENUM('upload','youtube','vimeo') DEFAULT 'upload',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────────
-- VARYANTLAR
-- ──────────────────────────────────────────

CREATE TABLE attribute_groups (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    display_name    VARCHAR(100) NOT NULL,
    type            ENUM('select','color','button','radio') DEFAULT 'select',
    sort_order      INT UNSIGNED DEFAULT 0
);

CREATE TABLE attributes (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    group_id        BIGINT UNSIGNED NOT NULL REFERENCES attribute_groups(id),
    value           VARCHAR(255) NOT NULL,
    color_hex       VARCHAR(7) NULL,
    image           VARCHAR(500) NULL,
    sort_order      INT UNSIGNED DEFAULT 0
);

CREATE TABLE product_variants (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id      BIGINT UNSIGNED NOT NULL REFERENCES products(id),
    sku             VARCHAR(100) NOT NULL,
    barcode         VARCHAR(100) NULL,
    price           DECIMAL(12,2) NOT NULL,
    sale_price      DECIMAL(12,2) NULL,
    cost_price      DECIMAL(12,2) NULL,
    stock           INT DEFAULT 0,
    weight          DECIMAL(8,3) NULL,
    image           VARCHAR(500) NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    sort_order      INT UNSIGNED DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_product (product_id),
    UNIQUE KEY unique_product_sku (product_id, sku)
);

CREATE TABLE product_variant_attributes (
    variant_id      BIGINT UNSIGNED NOT NULL REFERENCES product_variants(id),
    attribute_id    BIGINT UNSIGNED NOT NULL REFERENCES attributes(id),
    PRIMARY KEY (variant_id, attribute_id)
);

CREATE TABLE product_attributes (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id      BIGINT UNSIGNED NOT NULL REFERENCES products(id),
    name            VARCHAR(255) NOT NULL,
    value           VARCHAR(500) NOT NULL,
    unit            VARCHAR(50) NULL,
    sort_order      INT UNSIGNED DEFAULT 0
);

-- ──────────────────────────────────────────
-- MARKALAR
-- ──────────────────────────────────────────

CREATE TABLE brands (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    logo            VARCHAR(500) NULL,
    description     TEXT NULL,
    website         VARCHAR(500) NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    is_featured     BOOLEAN DEFAULT FALSE,
    product_count   INT UNSIGNED DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 2.4 Sipariş & Ödeme Tabloları

```sql
-- ──────────────────────────────────────────
-- SİPARİŞLER
-- ──────────────────────────────────────────

CREATE TABLE orders (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid            CHAR(36) UNIQUE NOT NULL,
    order_number    VARCHAR(30) UNIQUE NOT NULL,
    user_id         BIGINT UNSIGNED NOT NULL REFERENCES users(id),
    
    -- Adres
    billing_address JSON NOT NULL,
    shipping_address JSON NOT NULL,
    
    -- Fiyat
    subtotal        DECIMAL(12,2) NOT NULL,
    shipping_cost   DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    tax_amount      DECIMAL(12,2) DEFAULT 0,
    total           DECIMAL(12,2) NOT NULL,
    currency        VARCHAR(10) DEFAULT 'TRY',
    
    -- Durum
    status          ENUM('pending','confirmed','processing','shipped','delivered','cancelled','refunded','partial_refund') DEFAULT 'pending',
    payment_status  ENUM('pending','paid','failed','refunded','partial_refund') DEFAULT 'pending',
    
    -- Kupon
    coupon_code     VARCHAR(50) NULL,
    coupon_discount DECIMAL(12,2) DEFAULT 0,
    
    -- Ödeme
    payment_method  VARCHAR(100) NULL,
    payment_gateway VARCHAR(100) NULL,
    payment_ref     VARCHAR(255) NULL,
    paid_at         TIMESTAMP NULL,
    
    -- Not
    customer_note   TEXT NULL,
    admin_note      TEXT NULL,
    
    -- IP & Cihaz
    ip_address      VARCHAR(45) NULL,
    user_agent      TEXT NULL,
    device_type     ENUM('desktop','mobile','tablet') NULL,
    
    -- UTM
    utm_source      VARCHAR(100) NULL,
    utm_medium      VARCHAR(100) NULL,
    utm_campaign    VARCHAR(100) NULL,
    
    -- B2B
    is_b2b          BOOLEAN DEFAULT FALSE,
    b2b_firm_id     BIGINT UNSIGNED NULL REFERENCES b2b_firms(id),
    po_number       VARCHAR(100) NULL,
    
    metadata        JSON NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_order_number (order_number),
    INDEX idx_created (created_at)
);

CREATE TABLE order_items (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id        BIGINT UNSIGNED NOT NULL REFERENCES orders(id),
    seller_id       BIGINT UNSIGNED NOT NULL REFERENCES sellers(id),
    store_id        BIGINT UNSIGNED NOT NULL REFERENCES stores(id),
    product_id      BIGINT UNSIGNED NOT NULL REFERENCES products(id),
    variant_id      BIGINT UNSIGNED NULL REFERENCES product_variants(id),
    
    name            VARCHAR(500) NOT NULL,
    sku             VARCHAR(100) NOT NULL,
    image           VARCHAR(500) NULL,
    quantity        INT UNSIGNED NOT NULL,
    unit_price      DECIMAL(12,2) NOT NULL,
    sale_price      DECIMAL(12,2) NULL,
    total_price     DECIMAL(12,2) NOT NULL,
    tax_rate        DECIMAL(5,2) DEFAULT 18,
    tax_amount      DECIMAL(12,2) DEFAULT 0,
    discount        DECIMAL(12,2) DEFAULT 0,
    
    status          ENUM('pending','processing','shipped','delivered','cancelled','refunded') DEFAULT 'pending',
    
    commission_rate DECIMAL(5,2) DEFAULT 0,
    commission_amount DECIMAL(12,2) DEFAULT 0,
    seller_earning  DECIMAL(12,2) DEFAULT 0,
    
    variant_options JSON NULL,
    metadata        JSON NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_order (order_id),
    INDEX idx_seller (seller_id),
    INDEX idx_product (product_id)
);

CREATE TABLE order_status_history (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id        BIGINT UNSIGNED NOT NULL REFERENCES orders(id),
    status          VARCHAR(50) NOT NULL,
    note            TEXT NULL,
    created_by      BIGINT UNSIGNED NULL REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order (order_id)
);

-- ──────────────────────────────────────────
-- KARGO
-- ──────────────────────────────────────────

CREATE TABLE shipments (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id        BIGINT UNSIGNED NOT NULL REFERENCES orders(id),
    order_item_ids  JSON NULL,
    seller_id       BIGINT UNSIGNED NOT NULL REFERENCES sellers(id),
    cargo_company   ENUM('yurtici','aras','mng','ptt','ups','fedex','other') NOT NULL,
    tracking_number VARCHAR(100) NOT NULL,
    tracking_url    VARCHAR(500) NULL,
    status          ENUM('preparing','handed_over','in_transit','out_for_delivery','delivered','failed','returned') DEFAULT 'preparing',
    shipped_at      TIMESTAMP NULL,
    estimated_at    TIMESTAMP NULL,
    delivered_at    TIMESTAMP NULL,
    receiver_name   VARCHAR(255) NULL,
    notes           TEXT NULL,
    last_tracked_at TIMESTAMP NULL,
    tracking_events JSON NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order (order_id),
    INDEX idx_tracking (tracking_number)
);

-- ──────────────────────────────────────────
-- ÖDEMELER
-- ──────────────────────────────────────────

CREATE TABLE payments (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id        BIGINT UNSIGNED NOT NULL REFERENCES orders(id),
    user_id         BIGINT UNSIGNED NOT NULL REFERENCES users(id),
    gateway         ENUM('iyzico','paytr','stripe','wire','eft','b2b_credit') NOT NULL,
    amount          DECIMAL(12,2) NOT NULL,
    currency        VARCHAR(10) DEFAULT 'TRY',
    status          ENUM('pending','success','failed','refunded') DEFAULT 'pending',
    gateway_ref     VARCHAR(255) NULL,
    gateway_response JSON NULL,
    paid_at         TIMESTAMP NULL,
    refunded_at     TIMESTAMP NULL,
    refund_amount   DECIMAL(12,2) DEFAULT 0,
    ip_address      VARCHAR(45) NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order (order_id),
    INDEX idx_gateway_ref (gateway_ref)
);

CREATE TABLE seller_payouts (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    seller_id       BIGINT UNSIGNED NOT NULL REFERENCES sellers(id),
    amount          DECIMAL(12,2) NOT NULL,
    status          ENUM('pending','approved','processing','completed','rejected') DEFAULT 'pending',
    iban            VARCHAR(30) NOT NULL,
    bank_name       VARCHAR(100) NOT NULL,
    transfer_ref    VARCHAR(255) NULL,
    requested_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at    TIMESTAMP NULL,
    processed_by    BIGINT UNSIGNED NULL REFERENCES users(id),
    note            TEXT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE seller_transactions (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    seller_id       BIGINT UNSIGNED NOT NULL REFERENCES sellers(id),
    type            ENUM('earning','payout','commission','refund','adjustment','subscription') NOT NULL,
    amount          DECIMAL(12,2) NOT NULL,
    balance_after   DECIMAL(12,2) NOT NULL,
    description     VARCHAR(500) NULL,
    reference_type  VARCHAR(100) NULL,
    reference_id    BIGINT UNSIGNED NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_seller (seller_id),
    INDEX idx_type (type)
);
```

## 2.5 CRM & Marketing Tabloları

```sql
CREATE TABLE customer_segments (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    seller_id       BIGINT UNSIGNED NULL REFERENCES sellers(id),
    name            VARCHAR(255) NOT NULL,
    description     TEXT NULL,
    rules           JSON NOT NULL,
    is_dynamic      BOOLEAN DEFAULT TRUE,
    customer_count  INT UNSIGNED DEFAULT 0,
    last_synced_at  TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE automation_workflows (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    seller_id       BIGINT UNSIGNED NULL REFERENCES sellers(id),
    name            VARCHAR(255) NOT NULL,
    trigger_event   ENUM('cart_abandoned','product_viewed','purchase_completed','no_purchase_x_days','birthday','signup','wishlist_price_drop') NOT NULL,
    trigger_delay   INT UNSIGNED DEFAULT 0,
    trigger_unit    ENUM('minutes','hours','days') DEFAULT 'hours',
    is_active       BOOLEAN DEFAULT TRUE,
    steps           JSON NOT NULL,
    stats           JSON NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE automation_logs (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    workflow_id     BIGINT UNSIGNED NOT NULL REFERENCES automation_workflows(id),
    user_id         BIGINT UNSIGNED NOT NULL REFERENCES users(id),
    step_index      TINYINT UNSIGNED NOT NULL,
    channel         ENUM('whatsapp','sms','email','push') NOT NULL,
    status          ENUM('pending','sent','delivered','opened','clicked','failed') DEFAULT 'pending',
    sent_at         TIMESTAMP NULL,
    metadata        JSON NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_workflow (workflow_id),
    INDEX idx_user (user_id)
);

CREATE TABLE whatsapp_messages (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    seller_id       BIGINT UNSIGNED NULL REFERENCES sellers(id),
    user_id         BIGINT UNSIGNED NULL REFERENCES users(id),
    phone           VARCHAR(20) NOT NULL,
    direction       ENUM('inbound','outbound') NOT NULL,
    message_type    ENUM('text','template','image','document') DEFAULT 'text',
    content         TEXT NOT NULL,
    template_name   VARCHAR(100) NULL,
    template_vars   JSON NULL,
    status          ENUM('queued','sent','delivered','read','failed') DEFAULT 'queued',
    wa_message_id   VARCHAR(255) NULL,
    sent_at         TIMESTAMP NULL,
    delivered_at    TIMESTAMP NULL,
    read_at         TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_user (user_id)
);

CREATE TABLE email_campaigns (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    seller_id       BIGINT UNSIGNED NULL REFERENCES sellers(id),
    name            VARCHAR(255) NOT NULL,
    subject         VARCHAR(500) NOT NULL,
    from_name       VARCHAR(255) NOT NULL,
    from_email      VARCHAR(255) NOT NULL,
    template_id     BIGINT UNSIGNED NULL,
    content         LONGTEXT NULL,
    segment_ids     JSON NULL,
    status          ENUM('draft','scheduled','sending','sent','paused') DEFAULT 'draft',
    scheduled_at    TIMESTAMP NULL,
    sent_at         TIMESTAMP NULL,
    recipient_count INT UNSIGNED DEFAULT 0,
    open_count      INT UNSIGNED DEFAULT 0,
    click_count     INT UNSIGNED DEFAULT 0,
    bounce_count    INT UNSIGNED DEFAULT 0,
    unsubscribe_count INT UNSIGNED DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 2.6 B2B Tabloları

```sql
CREATE TABLE b2b_firms (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL REFERENCES users(id),
    company_name    VARCHAR(255) NOT NULL,
    tax_number      VARCHAR(20) UNIQUE NOT NULL,
    tax_office      VARCHAR(100) NOT NULL,
    company_type    ENUM('limited','anonim','shahis','cooperative','other') NOT NULL,
    sector          VARCHAR(100) NULL,
    employee_count  VARCHAR(20) NULL,
    annual_revenue  VARCHAR(20) NULL,
    phone           VARCHAR(20) NOT NULL,
    fax             VARCHAR(20) NULL,
    email           VARCHAR(255) NOT NULL,
    website         VARCHAR(500) NULL,
    address         TEXT NOT NULL,
    city            VARCHAR(100) NOT NULL,
    district        VARCHAR(100) NOT NULL,
    status          ENUM('pending','approved','suspended','rejected') DEFAULT 'pending',
    approved_at     TIMESTAMP NULL,
    approved_by     BIGINT UNSIGNED NULL REFERENCES users(id),
    
    -- Finansal
    credit_limit    DECIMAL(15,2) DEFAULT 0,
    current_balance DECIMAL(15,2) DEFAULT 0,
    risk_limit      DECIMAL(15,2) DEFAULT 0,
    payment_terms   INT UNSIGNED DEFAULT 0,      -- gün cinsinden vade
    discount_rate   DECIMAL(5,2) DEFAULT 0,
    pricing_tier    VARCHAR(50) NULL,
    
    -- Bayi
    is_dealer       BOOLEAN DEFAULT FALSE,
    dealer_level    TINYINT UNSIGNED DEFAULT 0,
    
    iban            VARCHAR(30) NULL,
    notes           TEXT NULL,
    metadata        JSON NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE b2b_price_lists (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    seller_id       BIGINT UNSIGNED NOT NULL REFERENCES sellers(id),
    firm_id         BIGINT UNSIGNED NULL REFERENCES b2b_firms(id),
    name            VARCHAR(255) NOT NULL,
    type            ENUM('firm_specific','tier','dealer') DEFAULT 'firm_specific',
    discount_type   ENUM('percentage','fixed','custom') DEFAULT 'percentage',
    discount_value  DECIMAL(8,2) DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    valid_from      DATE NULL,
    valid_until     DATE NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE b2b_price_list_items (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    price_list_id   BIGINT UNSIGNED NOT NULL REFERENCES b2b_price_lists(id),
    product_id      BIGINT UNSIGNED NOT NULL REFERENCES products(id),
    variant_id      BIGINT UNSIGNED NULL REFERENCES product_variants(id),
    custom_price    DECIMAL(12,2) NOT NULL,
    min_qty         INT UNSIGNED DEFAULT 1,
    INDEX idx_price_list (price_list_id),
    INDEX idx_product (product_id)
);

CREATE TABLE b2b_quote_requests (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    firm_id         BIGINT UNSIGNED NOT NULL REFERENCES b2b_firms(id),
    seller_id       BIGINT UNSIGNED NOT NULL REFERENCES sellers(id),
    quote_number    VARCHAR(30) UNIQUE NOT NULL,
    status          ENUM('draft','submitted','reviewed','quoted','accepted','rejected','expired') DEFAULT 'draft',
    items           JSON NOT NULL,
    notes           TEXT NULL,
    quoted_total    DECIMAL(12,2) NULL,
    valid_until     TIMESTAMP NULL,
    responded_at    TIMESTAMP NULL,
    responded_by    BIGINT UNSIGNED NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE b2b_current_accounts (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    firm_id         BIGINT UNSIGNED NOT NULL REFERENCES b2b_firms(id),
    seller_id       BIGINT UNSIGNED NOT NULL REFERENCES sellers(id),
    type            ENUM('debit','credit') NOT NULL,
    amount          DECIMAL(12,2) NOT NULL,
    balance_after   DECIMAL(12,2) NOT NULL,
    description     VARCHAR(500) NULL,
    reference_type  VARCHAR(100) NULL,
    reference_id    BIGINT UNSIGNED NULL,
    due_date        DATE NULL,
    paid_at         TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_firm (firm_id),
    INDEX idx_seller (seller_id)
);
```

## 2.7 Loyalty & Affiliate Tabloları

```sql
CREATE TABLE loyalty_points (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL REFERENCES users(id),
    points          INT NOT NULL,
    balance_after   INT NOT NULL,
    type            ENUM('earn','spend','expire','adjust','bonus') NOT NULL,
    reason          ENUM('purchase','review','referral','signup','daily_login','social_share','badge','campaign','admin') NOT NULL,
    reference_type  VARCHAR(100) NULL,
    reference_id    BIGINT UNSIGNED NULL,
    expires_at      TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_expires (expires_at)
);

CREATE TABLE loyalty_badges (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(100) UNIQUE NOT NULL,
    description     TEXT NULL,
    icon            VARCHAR(500) NULL,
    tier            ENUM('bronze','silver','gold','platinum','vip') NOT NULL,
    requirement_type ENUM('order_count','order_total','review_count','referral_count','points') NOT NULL,
    requirement_value INT UNSIGNED NOT NULL,
    bonus_points    INT UNSIGNED DEFAULT 0,
    benefits        JSON NULL,
    is_active       BOOLEAN DEFAULT TRUE
);

CREATE TABLE user_badges (
    user_id         BIGINT UNSIGNED NOT NULL REFERENCES users(id),
    badge_id        BIGINT UNSIGNED NOT NULL REFERENCES loyalty_badges(id),
    earned_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE user_loyalty_summary (
    user_id         BIGINT UNSIGNED PRIMARY KEY REFERENCES users(id),
    total_points    INT UNSIGNED DEFAULT 0,
    available_points INT UNSIGNED DEFAULT 0,
    tier            ENUM('bronze','silver','gold','platinum','vip') DEFAULT 'bronze',
    tier_updated_at TIMESTAMP NULL,
    lifetime_earned INT UNSIGNED DEFAULT 0,
    lifetime_spent  INT UNSIGNED DEFAULT 0,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────────
-- AFFİLİATE
-- ──────────────────────────────────────────

CREATE TABLE affiliate_partners (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL REFERENCES users(id),
    type            ENUM('influencer','blogger','comparison_site','other') DEFAULT 'other',
    status          ENUM('pending','approved','suspended') DEFAULT 'pending',
    commission_rate DECIMAL(5,2) DEFAULT 5.00,
    min_payout      DECIMAL(10,2) DEFAULT 100.00,
    payment_method  ENUM('bank','papara','paypal') DEFAULT 'bank',
    payment_details JSON NULL,
    total_earned    DECIMAL(12,2) DEFAULT 0,
    total_paid      DECIMAL(12,2) DEFAULT 0,
    pending_payout  DECIMAL(12,2) DEFAULT 0,
    referral_count  INT UNSIGNED DEFAULT 0,
    conversion_count INT UNSIGNED DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE affiliate_links (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    partner_id      BIGINT UNSIGNED NOT NULL REFERENCES affiliate_partners(id),
    code            VARCHAR(20) UNIQUE NOT NULL,
    target_type     ENUM('product','store','category','homepage') DEFAULT 'homepage',
    target_id       BIGINT UNSIGNED NULL,
    custom_url      VARCHAR(500) NULL,
    click_count     INT UNSIGNED DEFAULT 0,
    conversion_count INT UNSIGNED DEFAULT 0,
    qr_code         VARCHAR(500) NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    expires_at      TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE affiliate_conversions (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    link_id         BIGINT UNSIGNED NOT NULL REFERENCES affiliate_links(id),
    partner_id      BIGINT UNSIGNED NOT NULL REFERENCES affiliate_partners(id),
    order_id        BIGINT UNSIGNED NOT NULL REFERENCES orders(id),
    order_total     DECIMAL(12,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    commission_amount DECIMAL(12,2) NOT NULL,
    status          ENUM('pending','approved','paid','rejected') DEFAULT 'pending',
    payout_id       BIGINT UNSIGNED NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 2.8 Reklam & Abonelik Tabloları

```sql
CREATE TABLE ad_campaigns (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    seller_id       BIGINT UNSIGNED NOT NULL REFERENCES sellers(id),
    name            VARCHAR(255) NOT NULL,
    type            ENUM('sponsored_product','sponsored_category','sponsored_store') NOT NULL,
    target_id       BIGINT UNSIGNED NULL,
    budget_type     ENUM('daily','monthly','total') NOT NULL,
    budget_amount   DECIMAL(10,2) NOT NULL,
    cpc_bid         DECIMAL(8,4) DEFAULT 0.50,
    status          ENUM('draft','active','paused','completed','rejected') DEFAULT 'draft',
    start_date      DATE NOT NULL,
    end_date        DATE NULL,
    impressions     BIGINT UNSIGNED DEFAULT 0,
    clicks          BIGINT UNSIGNED DEFAULT 0,
    conversions     INT UNSIGNED DEFAULT 0,
    revenue         DECIMAL(12,2) DEFAULT 0,
    cost            DECIMAL(12,2) DEFAULT 0,
    roas            DECIMAL(8,4) DEFAULT 0,
    ai_optimized    BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE subscriptions (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    seller_id       BIGINT UNSIGNED NOT NULL REFERENCES sellers(id),
    package         ENUM('starter','professional','enterprise') NOT NULL,
    billing_cycle   ENUM('monthly','yearly') DEFAULT 'monthly',
    price           DECIMAL(10,2) NOT NULL,
    status          ENUM('active','cancelled','expired','trial','past_due') DEFAULT 'active',
    trial_ends_at   TIMESTAMP NULL,
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    cancelled_at    TIMESTAMP NULL,
    payment_method  VARCHAR(100) NULL,
    gateway_sub_id  VARCHAR(255) NULL,
    auto_renew      BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_seller (seller_id),
    INDEX idx_status (status)
);
```

## 2.9 Yorum, Soru & Forum Tabloları

```sql
CREATE TABLE reviews (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id      BIGINT UNSIGNED NOT NULL REFERENCES products(id),
    user_id         BIGINT UNSIGNED NOT NULL REFERENCES users(id),
    order_item_id   BIGINT UNSIGNED NULL REFERENCES order_items(id),
    rating          TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title           VARCHAR(255) NULL,
    content         TEXT NULL,
    pros            TEXT NULL,
    cons            TEXT NULL,
    images          JSON NULL,
    is_verified     BOOLEAN DEFAULT FALSE,
    is_approved     BOOLEAN DEFAULT FALSE,
    helpful_count   INT UNSIGNED DEFAULT 0,
    reported_count  INT UNSIGNED DEFAULT 0,
    seller_reply    TEXT NULL,
    seller_replied_at TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_product (product_id),
    INDEX idx_user (user_id)
);

CREATE TABLE product_questions (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id      BIGINT UNSIGNED NOT NULL REFERENCES products(id),
    user_id         BIGINT UNSIGNED NOT NULL REFERENCES users(id),
    question        TEXT NOT NULL,
    is_anonymous    BOOLEAN DEFAULT FALSE,
    helpful_count   INT UNSIGNED DEFAULT 0,
    answer_count    INT UNSIGNED DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_answers (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    question_id     BIGINT UNSIGNED NOT NULL REFERENCES product_questions(id),
    user_id         BIGINT UNSIGNED NOT NULL REFERENCES users(id),
    answer          TEXT NOT NULL,
    is_seller       BOOLEAN DEFAULT FALSE,
    is_verified     BOOLEAN DEFAULT FALSE,
    helpful_count   INT UNSIGNED DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE forum_categories (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    parent_id       BIGINT UNSIGNED NULL REFERENCES forum_categories(id),
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    description     TEXT NULL,
    icon            VARCHAR(100) NULL,
    color           VARCHAR(7) NULL,
    sort_order      INT UNSIGNED DEFAULT 0,
    topic_count     INT UNSIGNED DEFAULT 0,
    post_count      INT UNSIGNED DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE
);

CREATE TABLE forum_topics (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id     BIGINT UNSIGNED NOT NULL REFERENCES forum_categories(id),
    user_id         BIGINT UNSIGNED NOT NULL REFERENCES users(id),
    title           VARCHAR(500) NOT NULL,
    slug            VARCHAR(500) UNIQUE NOT NULL,
    content         LONGTEXT NOT NULL,
    tags            JSON NULL,
    view_count      INT UNSIGNED DEFAULT 0,
    reply_count     INT UNSIGNED DEFAULT 0,
    vote_count      INT DEFAULT 0,
    is_pinned       BOOLEAN DEFAULT FALSE,
    is_locked       BOOLEAN DEFAULT FALSE,
    is_solved       BOOLEAN DEFAULT FALSE,
    last_reply_at   TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FULLTEXT idx_search (title, content)
);
```
