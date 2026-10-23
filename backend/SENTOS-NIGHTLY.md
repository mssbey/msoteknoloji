# Günlük Sentos kataloğu

`sentos:nightly` her gün **00.00 Europe/Istanbul** saatinde çalışır. Ürün, kategori, görsel adresi ve varyant bilgileri yerel veritabanına aktarılır. Ziyaretçinin sayfa açması Sentos aktarımı başlatmaz. Fiyat ve stok gün içindeki Sentos değişikliklerini bir sonraki geceye kadar yansıtmaz; sitede verilen siparişlerin yerel stok düşümü devam eder.

Aktarım transaction içinde yapılır. Ürün aktarım hatasında veya API hatasında önceki katalog korunur; hata `storage/logs/laravel.log` dosyasına kaydedilir. Aynı işin eşzamanlı çalışması kilitle engellenir. Elle yenilemek için: `php artisan sentos:nightly`.

`.env`: `SENTOS_ENABLED=true`, mevcut Sentos erişim bilgileri ve gerekirse `SENTOS_STORE_ID=1`. `mso-teknoloji` mağazası varsa o kullanılır; aksi halde ayarlanan mağaza kullanılır. Boş veritabanında MSO mağazası oluşturulur.

Docker başlangıcı `schedule:work` çalıştırır; açılışta ürün aktarımı yapmaz. Değişikliğin yayına alınması için Docker imajı yeniden dağıtılmalıdır. Diğer sunucularda Laravel scheduler her dakika çalıştırılmalıdır (`php artisan schedule:run`). Zamanlayıcı, uygulama ve kalıcı veritabanı gece erişilebilir olmalıdır. Uyuyan/kapanan bir hosting süreci zamanında çalışamaz.

Windows yerel kurulumunda `MSO-Sentos-Nightly` Görev Zamanlayıcı görevi kullanılabilir. Bilgisayar açık ve kullanıcı oturumu etkin olmalıdır. Kaçırılan çalışma, bilgisayar tekrar kullanılabilir olduğunda başlatılır.

Görseller (galeri, kapak, varyant ve açıklama içindeki resimler) gece aktarımında indirilir. WebP dönüşümü ve en fazla 1400 piksel boyutlandırma uygulanır; küçük dosya daha büyük hale gelirse aslı korunur. GIF animasyonları korunur. Görsel içerikleri kalıcı veritabanında tutulur; geçici Docker diskinin silinmesinden etkilenmez.

`/media/products/{hash}.{uzantı}` adresi yalnızca kaydedilmiş içerikleri sunar, kaynak sunucuya bağlanmaz. Aynı içerikler `public/media/products` altında statik dosya olarak da tutulur; PHP geliştirme sunucusundaki `server.php` bu istekleri Laravel'i başlatmadan sunar. Yanıtlar bir yıl tarayıcı önbelleği ve ETag desteği içerir. Kaynakta bulunamayan veya yanıt vermeyen görseller için varsa eski yerel sürüm, yoksa yerel yer tutucu kullanılır. Ulaşılamayan bir kaynak aynı aktarım içinde sürekli denenmez; sonraki gece yeniden denenir. Açıklamalardaki görseller lazy loading ile yüklenir.

İlk kurulumda migration sonrasında sırasıyla `php artisan products:cache-images`, `php artisan products:optimize-images`, `php artisan products:export-images` çalıştırın. Bu işlemler ziyaretçi isteğiyle tetiklenmez. Docker başlangıcı yalnızca veritabanındaki kayıtlardan statik dosyaları tekrar hazırlar; Sentos'a bağlanmaz. Gece aktarımı yeni görselleri zaten optimize ederek ve statik kopyalarını hazırlayarak kaydeder. Nginx/Apache kullanılıyorsa statik medya için aynı `Cache-Control` başlığı yapılandırılmalıdır. Windows PHP sertifika deposu eksikse `SENTOS_IMAGE_CA_BUNDLE` ayarına güvenilir CA dosyasının tam yolunu girin; SSL doğrulaması kapatılmaz. Yeni görsel kaynağı gerekiyorsa `SENTOS_IMAGE_HOSTS` listesine ekleyin.
