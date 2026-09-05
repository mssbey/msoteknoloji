# 16 — ÖLÇEKLENEBİLİRLİK & MİKROSERVİS GEÇİŞ PLANI

## 16.1 Mevcut Monolith → Mikroservis Yol Haritası

```
YIL 1: Monolith (Laravel Modüler)
    └── Tüm özellikler tek uygulama içinde
    └── Redis Queue ile async işler
    └── Kolay deployment, düşük operasyonel karmaşıklık

YIL 2: Strangler Fig Pattern (Kademeli Ayrıştırma)
    └── Yüksek yük altında olan servisler önce ayrışır
    └── API Gateway ekle
    └── Service Discovery

YIL 3: Tam Mikroservis (Seçici)
    └── Her servis bağımsız deploy edilebilir
    └── Kubernetes orchestration
    └── Event-driven architecture
```

## 16.2 Servis Sınırları (Domain Boundaries)

```
DOMAIN SERVISLERI (Gelecek Mikroservis Planı):

┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY                                │
│                  (Nginx / Kong / AWS API GW)                    │
└──────────┬────────┬────────┬────────┬────────┬─────────────────┘
           │        │        │        │        │
    ┌──────┴─┐  ┌───┴──┐  ┌─┴────┐  ┌┴─────┐  ┌─┴────────┐
    │ Auth   │  │Catalog│  │Order │  │Search│  │Notif.    │
    │Service │  │Service│  │Service│  │Service│  │Service   │
    │        │  │       │  │       │  │(Meili)│  │(WA/SMS)  │
    └────────┘  └───────┘  └──────┘  └───────┘  └──────────┘
           │        │        │
    ┌──────┴─┐  ┌───┴──┐  ┌─┴────┐
    │Finance │  │ CRM  │  │  AI  │
    │Service │  │Service│  │Service│
    └────────┘  └───────┘  └──────┘

Her servis:
- Kendi veritabanına sahip (veya kendi schema'sı)
- REST API veya gRPC ile iletişim
- Message queue ile async event'ler
```

## 16.3 Horizontal Scaling Stratejisi

```
YATAY ÖLÇEKLENDİRME:

STATELESS APP SERVERS (Load Balanced):
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ App 1   │ │ App 2   │ │ App 3   │ │ App N   │  ← Auto-scale
└─────────┘ └─────────┘ └─────────┘ └─────────┘
     ↓ Session Redis'te saklanır (stateless)
     ↓ Dosyalar S3'te saklanır
     ↓ Cache Redis Cluster'da

DATABASE READ SCALING:
┌──────────────┐    ┌────────────┐   ┌────────────┐
│ MySQL Primary│→→→ │ Replica 1  │   │ Replica 2  │
│ (Write)      │    │ (Read)     │   │ (Read)     │
└──────────────┘    └────────────┘   └────────────┘
     ↑
  ProxySQL (Connection pooling + Read/Write split)

REDIS CLUSTER (High Availability):
Primary-1 ↔ Replica-1
Primary-2 ↔ Replica-2  (3+ primary, Redis Sentinel)
Primary-3 ↔ Replica-3

SEARCH SCALING:
Meilisearch Multi-node cluster (v1.6+)
├── Node 1 (primary)
├── Node 2 (replica)
└── Node 3 (replica)
```

## 16.4 Kubernetes Deployment (Yıl 2+)

```yaml
# k8s/deployment-app.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: mso-app
  namespace: mso-production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mso-app
  template:
    metadata:
      labels:
        app: mso-app
    spec:
      containers:
      - name: mso-app
        image: registry.mso.com/mso-commerce/app:latest
        resources:
          requests:
            cpu: "500m"
            memory: "512Mi"
          limits:
            cpu: "2"
            memory: "2Gi"
        env:
        - name: APP_ENV
          value: production
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: mso-db-secret
              key: host
        livenessProbe:
          httpGet:
            path: /health
            port: 9000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 9000
          initialDelaySeconds: 5
          periodSeconds: 5

---
# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: mso-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: mso-app
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## 16.5 Caching Stratejisi

```php
// Çok Katmanlı Cache Mimarisi

KATMAN 1: HTTP Cache (CloudFlare)
→ Statik sayfalarda 1 saat TTL
→ Ürün sayfaları 5 dakika TTL (stale-while-revalidate)

KATMAN 2: Redis Application Cache
→ config/cache.php

Cache::remember('products:featured', 3600, fn() => Product::featured()->limit(20)->get());
Cache::remember('categories:tree', 86400, fn() => Category::tree()->get());
Cache::remember("product:{$slug}", 1800, fn() => Product::with(['images','variants'])->where('slug', $slug)->first());

// Cache TAG'leri ile toplu geçersizleştirme
Cache::tags(['products', "seller:{$sellerId}"])->flush();

KATMAN 3: OPcache (PHP Level)
→ opcache.enable=1
→ opcache.memory_consumption=256
→ opcache.validate_timestamps=0 (production)

Cache Geçersizleştirme:
- Ürün güncellenince: Cache::tags(["product:{$id}"])->flush()
- Model Observer ile otomatik
```

## 16.6 Database Sharding Planı (Yıl 3+)

```
SHARDING STRATEJİSİ:

Başlangıç: Tek MySQL + Replica'lar
    ↓
Yıl 2: Functional Sharding (Servis bazlı ayrım)
    ├── mso_marketplace (ürün, sipariş)
    ├── mso_users (kullanıcı, auth)
    ├── mso_analytics (sadece okuma)
    └── mso_crm (crm, campaign)
    ↓
Yıl 3: Horizontal Sharding (Gerekirse)
    ├── orders_shard_1 (seller_id % 4 = 0)
    ├── orders_shard_2 (seller_id % 4 = 1)
    ├── orders_shard_3 (seller_id % 4 = 2)
    └── orders_shard_4 (seller_id % 4 = 3)

NOT: Çoğu platform 10M sipariş/ay'a kadar tek MySQL primary ile
     çalışabilir. Sharding erken optimizasyon tuzağından kaçın.
```

## 16.7 Event-Driven Architecture

```php
// Temel Event Akışı (Laravel Events + Redis)

// Event Fırlatma
event(new OrderPlaced($order));
event(new CartAbandoned($cart, $user));
event(new ProductViewed($product, $user));
event(new PaymentCompleted($payment));

// Event Listeners (asenkron, queue'da çalışır)
class OrderPlaced
{
    public function broadcastOn(): array
    {
        return [new Channel('orders')]; // SSE için
    }
}

class HandleOrderPlaced
{
    public function handle(OrderPlaced $event): void
    {
        // 1. Stok azalt
        $this->stockService->decrementForOrder($event->order);
        
        // 2. Satıcı bakiyesini güncelle
        $this->financeService->recordEarning($event->order);
        
        // 3. Müşteriye bildirim
        $event->order->user->notify(new OrderConfirmationNotification($event->order));
        
        // 4. Satıcıya bildirim
        $event->order->seller->user->notify(new NewOrderNotification($event->order));
        
        // 5. Analytics kaydı
        $this->analyticsService->recordOrderEvent($event->order);
        
        // 6. Loyalty puan
        $this->loyaltyService->awardPoints($event->order->user, 'purchase', [
            'order_total' => $event->order->total,
            'reference_type' => Order::class,
            'reference_id' => $event->order->id,
        ]);
        
        // 7. Affiliate komisyon kontrolü
        $this->affiliateService->trackConversion($event->order);
        
        // 8. Search index güncelle (satış sayısı)
        UpdateSearchIndexJob::dispatch($event->order->items->pluck('product_id'))->onQueue('search');
    }
}
```
