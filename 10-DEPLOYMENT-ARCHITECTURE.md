# 10 — DEPLOYMENT & SUNUCU MİMARİSİ

## 10.1 Üretim Altyapısı (Production Infrastructure)

```
                    ┌─────────────────────────────────┐
                    │         CloudFlare               │
                    │  WAF + DDoS + CDN + DNS          │
                    │  Rate Limiting + Bot Koruma      │
                    └─────────────────┬───────────────┘
                                      │
                    ┌─────────────────┴───────────────┐
                    │    Load Balancer (HAProxy/       │
                    │    CloudFlare Load Balancing)    │
                    └──────────┬────────────┬─────────┘
                               │            │
                    ┌──────────┴──┐  ┌──────┴──────────┐
                    │  App Server │  │  App Server      │
                    │  (Primary)  │  │  (Secondary)     │
                    │  8 vCPU     │  │  8 vCPU          │
                    │  16GB RAM   │  │  16GB RAM        │
                    │  NVMe SSD   │  │  NVMe SSD        │
                    └──────────┬──┘  └──────┬───────────┘
                               │            │
          ┌────────────────────┼────────────┼─────────────────────┐
          │                    │            │                     │
   ┌──────┴──────┐   ┌─────────┴──┐  ┌─────┴───────┐   ┌────────┴──────┐
   │  MySQL 8.2  │   │  Redis 7.2 │  │ Meilisearch │   │  MinIO / S3   │
   │  Primary    │   │  Cache +   │  │  Search     │   │  Object Store │
   │  (16GB RAM) │   │  Queue     │  │  (8GB RAM)  │   │  (2TB+)       │
   │             │   │  (8GB RAM) │  │             │   │               │
   │  + Replica  │   │  Sentinel  │  │  + Replica  │   │               │
   └─────────────┘   └────────────┘  └─────────────┘   └───────────────┘
```

## 10.2 Sunucu Gereksinimleri

### Yıl 1 (500 satıcı, 50K kullanıcı)

```yaml
# sunucu_plani_yil1.yaml

app_servers:
  count: 2
  specs:
    vcpu: 8
    ram_gb: 16
    storage_gb: 200  # NVMe SSD
    bandwidth: 1Gbps
  provider: Hetzner CCX33 veya AWS c6i.2xlarge
  monthly_cost: ~2×120€ = 240€

database:
  mysql_primary:
    vcpu: 8
    ram_gb: 32      # Büyük buffer pool için
    storage_gb: 500 # SSD
    provider: Hetzner CCX43
    monthly_cost: ~220€
  
  mysql_replica:
    vcpu: 4
    ram_gb: 16
    storage_gb: 500
    monthly_cost: ~110€

redis:
  vcpu: 4
  ram_gb: 16      # Cache + Queue için
  monthly_cost: ~80€

search:
  meilisearch:
    vcpu: 4
    ram_gb: 8
    monthly_cost: ~60€

storage:
  provider: Hetzner Object Storage veya AWS S3
  initial: 2TB
  monthly_cost: ~25€

cdn:
  provider: CloudFlare Pro
  monthly_cost: $20

monitoring:
  provider: Grafana Cloud + UptimeRobot
  monthly_cost: ~30€

# TOPLAM YIL 1: ~800€/ay (~28,000 TL)
```

### Yıl 2-3 (10K satıcı, 2M kullanıcı)

```yaml
# sunucu_plani_yil3.yaml

app_servers:
  count: 6-10  # Auto-scaling
  specs:
    vcpu: 16
    ram_gb: 32

database:
  mysql_cluster:
    primary: 1× (32GB RAM, 1TB NVMe)
    replicas: 2× (read replicas)
    proxy: 1× ProxySQL
  
  redis_cluster:
    nodes: 3-6
    ram_per_node: 32GB

search:
  meilisearch_cluster:
    nodes: 3
    
queue_workers:
  dedicated_servers: 2
  
# Kubernetes (K8s) ile container orchestration
# Auto-scaling: HPA (Horizontal Pod Autoscaler)
# TOPLAM YIL 3: ~5,000€/ay (~175,000 TL)
```

## 10.3 Docker & Container Yapısı

```yaml
# docker-compose.prod.yml

version: '3.8'

services:
  # ── Laravel Application ──
  app:
    build:
      context: .
      dockerfile: docker/php/Dockerfile
      target: production
    image: mso-commerce/app:latest
    environment:
      - APP_ENV=production
      - DB_HOST=mysql-primary
      - REDIS_HOST=redis
      - MEILISEARCH_HOST=http://meilisearch:7700
    volumes:
      - storage_data:/var/www/html/storage
    networks:
      - mso-network
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '2'
          memory: 2G
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3

  # ── Nginx ──
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/prod.conf:/etc/nginx/conf.d/default.conf
      - ssl_certs:/etc/nginx/ssl
      - ./public:/var/www/html/public:ro
    depends_on:
      - app
    networks:
      - mso-network

  # ── Queue Workers (Horizon) ──
  horizon:
    image: mso-commerce/app:latest
    command: php artisan horizon
    environment:
      - APP_ENV=production
    deploy:
      replicas: 1
    networks:
      - mso-network

  # ── Scheduler ──
  scheduler:
    image: mso-commerce/app:latest
    command: sh -c "while true; do php artisan schedule:run; sleep 60; done"
    networks:
      - mso-network

  # ── MySQL ──
  mysql-primary:
    image: mysql:8.2
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_DATABASE}
      MYSQL_USER: ${DB_USERNAME}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./docker/mysql/my.cnf:/etc/mysql/conf.d/custom.cnf
    networks:
      - mso-network
    command: >
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_unicode_ci
      --innodb-buffer-pool-size=8G
      --innodb-io-capacity=2000
      --max-connections=500

  # ── Redis ──
  redis:
    image: redis:7.2-alpine
    command: >
      redis-server
      --maxmemory 4gb
      --maxmemory-policy allkeys-lru
      --save 3600 1
      --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - mso-network

  # ── Meilisearch ──
  meilisearch:
    image: getmeili/meilisearch:v1.6
    environment:
      MEILI_MASTER_KEY: ${MEILISEARCH_KEY}
      MEILI_ENV: production
    volumes:
      - meilisearch_data:/meili_data
    networks:
      - mso-network

volumes:
  mysql_data:
  redis_data:
  meilisearch_data:
  storage_data:
  ssl_certs:

networks:
  mso-network:
    driver: bridge
```

## 10.4 Nginx Konfigürasyonu

```nginx
# docker/nginx/prod.conf

upstream php-fpm {
    least_conn;
    server app:9000;
    keepalive 16;
}

# HTTP → HTTPS Yönlendirme
server {
    listen 80;
    server_name msocommerce.com api.msocommerce.com;
    return 301 https://$host$request_uri;
}

# Ana Uygulama
server {
    listen 443 ssl http2;
    server_name api.msocommerce.com;
    root /var/www/html/public;
    
    # SSL
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()";
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=60r/m;
    limit_req zone=api burst=20 nodelay;
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript;
    
    # PHP FPM
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass php-fpm;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 120;
        fastcgi_buffer_size 16k;
        fastcgi_buffers 4 16k;
    }
    
    # Static dosyalar - cache
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff2|svg|webp|avif)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Upload limiti
    client_max_body_size 100M;
}
```

## 10.5 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml

name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.2
        env:
          MYSQL_ROOT_PASSWORD: secret
          MYSQL_DATABASE: mso_test
        options: --health-cmd="mysqladmin ping" --health-interval=10s
      redis:
        image: redis:7.2-alpine
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
          extensions: pdo_mysql, redis, gd, zip
          coverage: xdebug
      
      - name: Install Composer Dependencies
        run: composer install --no-ansi --no-interaction --prefer-dist
      
      - name: Run Tests
        run: php artisan test --parallel --coverage --min=80
      
      - name: Laravel Pint (Code Style)
        run: ./vendor/bin/pint --test

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker Image
        run: docker build -t mso-commerce/app:${{ github.sha }} --target production .
      
      - name: Push to Registry
        run: |
          echo ${{ secrets.REGISTRY_TOKEN }} | docker login registry.mso.com -u mso --password-stdin
          docker push registry.mso.com/mso-commerce/app:${{ github.sha }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PROD_HOST }}
          username: deploy
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /srv/mso-commerce
            docker pull registry.mso.com/mso-commerce/app:${{ github.sha }}
            
            # Zero-downtime deployment
            docker service update \
              --image registry.mso.com/mso-commerce/app:${{ github.sha }} \
              --update-order start-first \
              --update-failure-action rollback \
              mso_app
            
            # Migrate
            docker exec $(docker ps -q -f name=mso_app) php artisan migrate --force
            
            # Cache clear
            docker exec $(docker ps -q -f name=mso_app) php artisan optimize
            docker exec $(docker ps -q -f name=mso_app) php artisan view:cache
            docker exec $(docker ps -q -f name=mso_app) php artisan route:cache
```

## 10.6 MySQL Optimizasyon Konfigürasyonu

```ini
# docker/mysql/my.cnf

[mysqld]
# ── Karakter Seti ──
character-set-server = utf8mb4
collation-server     = utf8mb4_unicode_ci

# ── InnoDB Ayarları ──
innodb_buffer_pool_size     = 8G    # RAM'in %70'i
innodb_buffer_pool_instances = 8
innodb_log_file_size         = 512M
innodb_flush_log_at_trx_commit = 2  # Performance vs ACID trade-off
innodb_flush_method          = O_DIRECT
innodb_io_capacity           = 2000
innodb_io_capacity_max       = 4000
innodb_read_io_threads       = 8
innodb_write_io_threads      = 8

# ── Bağlantı ──
max_connections       = 500
thread_cache_size     = 64
wait_timeout          = 600
interactive_timeout   = 600

# ── Query Cache ──
query_cache_type = 0  # MySQL 8'de kaldırıldı, Redis kullan

# ── Slow Query Log ──
slow_query_log       = 1
slow_query_log_file  = /var/lib/mysql/slow.log
long_query_time      = 1

# ── Binary Log (Replication için) ──
log_bin              = mysql-bin
binlog_format        = ROW
expire_logs_days     = 7
max_binlog_size      = 256M
```

## 10.7 Redis Konfigürasyonu (Cache + Queue + Session)

```php
// config/database.php - Redis

'redis' => [
    'client' => 'phpredis',
    
    'default' => [
        'url' => env('REDIS_URL'),
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', 6379),
        'database' => 0,
    ],
    
    'cache' => [
        'host' => env('REDIS_HOST'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', 6379),
        'database' => 1,  // Cache için ayrı DB
    ],
    
    'queue' => [
        'host' => env('REDIS_HOST'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', 6379),
        'database' => 2,  // Queue için ayrı DB
    ],
    
    'session' => [
        'host' => env('REDIS_HOST'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', 6379),
        'database' => 3,  // Session için ayrı DB
    ],
],
```

## 10.8 Monitoring & Alerting

```yaml
# Grafana + Prometheus Stack

monitoring:
  metrics:
    - provider: Prometheus
    - exporters:
        - nginx-exporter
        - mysqld-exporter
        - redis-exporter
        - php-fpm-exporter
        - node-exporter
  
  dashboards:
    - Grafana (görselleştirme)
    - Panels:
        - API yanıt süreleri (p50, p95, p99)
        - Error rate
        - Queue depth (Horizon)
        - Database connections
        - Cache hit rate
        - Search latency
  
  alerting:
    - PagerDuty / Slack entegrasyonu
    - Eşikler:
        - API error rate > %1 → Uyarı
        - API error rate > %5 → Kritik
        - p99 response > 2s → Uyarı
        - DB connections > 400 → Uyarı
        - Queue depth > 1000 → Uyarı
        - Disk > %80 → Uyarı
  
  uptime:
    - UptimeRobot veya Better Uptime
    - Interval: 1 dakika
    - Locations: İstanbul, Frankfurt, Amsterdam
```
