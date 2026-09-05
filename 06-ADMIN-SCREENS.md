# 06 — SUPER ADMIN PANEL EKRANLARI

## 6.1 Admin Dashboard — Ana Ekran

```
┌─────────────────────────────────────────────────────────────────────────┐
│  MSO ADMIN                            🔔 Bildirimler  👤 Super Admin   │
├──────────────┬──────────────────────────────────────────────────────────┤
│              │                                                          │
│ NAVİGASYON   │  GENEL BAKIŞ              Bugün  Bu Hafta  Bu Ay  ▼    │
│              │  ─────────────────────────────────────────────────────  │
│ 📊 Dashboard │                                                          │
│              │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│ 🏪 Pazaryeri │  │  TOPLAM  │ │  GÜNLÜK  │ │  AYLIK   │ │  AKTİF   │  │
│  ├ Mağazalar │  │  CİRO    │ │  SATIŞ   │ │  SATIŞ   │ │  SATICIS │  │
│  ├ Ürünler   │  │ 2.4M TL  │ │ 48.2K TL │ │ 892K TL  │ │   347    │  │
│  └ Kategoriler│  │ ↑ %12    │ │ ↑ %8     │ │ ↑ %23    │ │ ↑ 12 yeni│  │
│              │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│ 👥 Satıcılar │                                                          │
│  ├ Tüm Satıcı│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  ├ Onay Bekl.│  │ TOPLAM   │ │  BUGÜN   │ │ ONAY BKL │ │ FRAUD    │  │
│  └ Kara Liste│  │  SİPARİŞ │ │ SİPARİŞ  │ │  ÜRÜNLER │ │  UYARI   │  │
│              │  │  48,291  │ │   1,247  │ │    89    │ │    3     │  │
│ 📦 Siparişler│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│              │                                                          │
│ 💳 Finans    │  SATIŞ GRAFİĞİ (Son 30 Gün)                           │
│  ├ Ödemeler  │  ┌────────────────────────────────────────────────────┐ │
│  ├ Para Çekme│  │  ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃              │ │
│  └ Komisyon  │  └────────────────────────────────────────────────────┘ │
│              │                                                          │
│ 📢 Reklamlar │  TÜRKİYE CANLI SİPARİŞ HARİTASI                       │
│ 🤖 AI Merkez │  ┌────────────────────────────────────────────────────┐ │
│ 🔒 Güvenlik  │  │      [İnteraktif Türkiye Haritası]                 │ │
│ ⚙️ Ayarlar   │  │      İstanbul: 342  Ankara: 89  İzmir: 67 ...     │ │
│              │  │      Siparişler canlı nokta olarak düşüyor         │ │
└──────────────┴──────────────────────────────────────────────────────────┘
```

## 6.2 Satıcı Yönetimi Ekranı

```
SATICILARI YÖNETİM
──────────────────────────────────────────────────────────────────────────

Filtreler: [Tümü ▼] [Paket: Tümü ▼] [Durum: Tümü ▼] [Tarih ▼]  🔍 Ara

[+ Yeni Satıcı]  [📥 Excel Export]  [🔔 Toplu Bildirim]

┌──┬─────────────────┬────────────┬───────────┬─────────┬──────────┬──────────────┐
│☐ │ SATICI           │ PAKET      │ DURUM     │ SATIŞ   │ CİRO     │ İŞLEMLER     │
├──┼─────────────────┼────────────┼───────────┼─────────┼──────────┼──────────────┤
│☐ │ TechStore Pro   │ Enterprise │ ✅ Aktif  │ 1,247   │ 89,400 TL│ 👁 📝 🔑 •••  │
│☐ │ MobilZone       │ Professional│ ✅ Aktif  │ 892     │ 45,230 TL│ 👁 📝 🔑 •••  │
│☐ │ Elektronik Hub  │ Starter    │ ⏳ Bekliyor│ -       │ -        │ ✅ ❌ 👁      │
│☐ │ GadgetWorld     │ Professional│ ⚠️ Uyarı  │ 234     │ 12,890 TL│ 👁 📝 🚫 •••  │
└──┴─────────────────┴────────────┴───────────┴─────────┴──────────┴──────────────┘

Satıcı Detay Modalı:
┌────────────────────────────────────────────────────┐
│ TechStore Pro                          [X] Kapat   │
│ ─────────────────────────────────────────────────  │
│ Vergi No: 1234567890  Paket: Enterprise            │
│ Kayıt: 15 Ocak 2026   Onaylayan: Admin@mso         │
│                                                    │
│ 📊 İstatistikler                                   │
│ Ürün: 1,847 | Sipariş: 4,291 | Ciro: 892K TL     │
│ Ort. Puan: 4.7/5 | Şikayet: 2                     │
│                                                    │
│ 💰 Finansal                                        │
│ Bakiye: 12,400 TL | Bekleyen: 3,200 TL            │
│ Toplam Çekildi: 78,000 TL                         │
│                                                    │
│ 🤖 AI Risk Skoru: DÜŞÜK (12/100)                  │
│                                                    │
│ [Hesaba Gir] [Askıya Al] [Mesaj Gönder] [Rapor]   │
└────────────────────────────────────────────────────┘
```

## 6.3 Finansal Yönetim Ekranı

```
FİNANS YÖNETİMİ
──────────────────────────────────────────────────────────────────────────

TAB: [Para Çekme Talepleri] [İşlemler] [Abonelikler] [Raporlar]

PARA ÇEKİM TALEPLERİ
┌──────────────────┬──────────┬──────────┬──────────┬────────────────────┐
│ SATICI            │ TUTAR    │ BANKA    │ DURUM    │ İŞLEMLER           │
├──────────────────┼──────────┼──────────┼──────────┼────────────────────┤
│ TechStore Pro    │ 5,000 TL │ Garanti  │ ⏳ Bekl. │ [Onayla] [Reddet]  │
│ MobilZone        │ 2,400 TL │ İş Bank. │ ⏳ Bekl. │ [Onayla] [Reddet]  │
│ GadgetWorld      │ 1,200 TL │ Yapı Kr. │ ✅ Onaylı│ [İşlem No Gir]     │
└──────────────────┴──────────┴──────────┴──────────┴────────────────────┘

ÖZET KARTLAR:
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ TOPLAM GELİR │ │ KOMİSYON     │ │ ÇEKIM BEKL.  │ │ ABONELİK     │
│ 2,847,000 TL │ │ 142,350 TL   │ │ 48,200 TL    │ │ 234,600 TL   │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

## 6.4 AI Analiz Merkezi Ekranı

```
AI ANALİZ MERKEZİ
──────────────────────────────────────────────────────────────────────────

TAB: [🚨 Fraud Uyarıları] [⚠️ Riskli Satıcılar] [🔍 Şüpheli Kullanıcılar] [📊 AI İçgörüler]

FRAUD UYARILARI
┌───────────────────────────────────────────────────────────────────┐
│ 🔴 YÜKSEK RİSK — Sipariş #MSO260601XZ89                          │
│ Aynı IP'den 5 dakikada 8 sipariş — Olası sahte sipariş           │
│ Kullanıcı: user@test.com | IP: 192.168.1.100 | VPN: EVET        │
│ [İncele] [Onayla] [İptal Et] [Kullanıcıyı Durdur]               │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│ 🟡 ORTA RİSK — Satıcı: QuickSell                                  │
│ Son 48 saatte %340 artış — Olağandışı satış artışı               │
│ Ürünler inceleniyor: 12 ürün kopyalanmış içerik içeriyor         │
│ [Satıcıyı İncele] [Ürünleri Askıya Al] [Uyarı Gönder]           │
└───────────────────────────────────────────────────────────────────┘

AI İÇGÖRÜLER (Bugün)
• Elektronik kategorisinde %23 talep artışı — Kampanya öneriyor
• 3 satıcı fiyatları piyasa ortalamasının %40 üzerinde
• Terk edilen sepet oranı bu hafta %2.3 artış gösterdi
• En çok aranan 5 ürün stokta yok — Tedarikçi önerisi hazır

CANLI SİSTEM SAĞLIĞI
┌──────────┬────────┬──────────┬────────┬──────────┬────────────┐
│ API       │ ✅ %99.8│ Redis    │ ✅ OK │ MySQL    │ ✅ 24ms    │
│ Queue     │ ✅ 1,247│ Search   │ ✅ OK │ Storage  │ ✅ 2.4TB   │
│ CDN       │ ✅ 100% │ Mail     │ ✅ OK │ SSL      │ ✅ 89 gün  │
└──────────┴────────┴──────────┴────────┴──────────┴────────────┘
```

## 6.5 Reklam Yönetimi Ekranı

```
REKLAM YÖNETİMİ
──────────────────────────────────────────────────────────────────────────

ÖZET BUGÜN:
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ GÖSTERİM   │ │ TIKLAMA    │ │ CTR        │ │ DÖNÜŞÜM    │ │ TOPLAM     │
│ 2,847,291  │ │ 142,364    │ │ %5.0       │ │ 4,271      │ │ GELİR      │
│ ↑ %12      │ │ ↑ %8       │ │ ↑ %0.3pp  │ │ ↑ %18      │ │ 28,400 TL  │
└────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘

AKTİF REKLAMLAR:
┌──────────────────┬─────────────┬────────┬────────┬────────┬──────────┐
│ KAMPANYA         │ TİP         │ BÜTÇE  │ HARCAMA│ ROAS   │ DURUM    │
├──────────────────┼─────────────┼────────┼────────┼────────┼──────────┤
│ TechStore Yazlık │ Spr. Ürün   │500/gün │ 423 TL │ 6.7x   │ 🟢 Aktif │
│ MobilZone iPhone │ Spr. Ürün   │300/gün │ 301 TL │ 4.2x   │ 🟢 Aktif │
│ GadgetWorld Anasf│ Spr. Mağaza │200/gün │ 145 TL │ 3.8x   │ 🟢 Aktif │
└──────────────────┴─────────────┴────────┴────────┴────────┴──────────┘

🤖 AI OPTİMİZASYON ÖNERİLERİ:
• TechStore kampanyasında CPC'yi %15 artırın → ROAS %0.8 artabilir
• iPhone kampanyasında gece 22-06 arası bütçeyi kapatın → %12 tasarruf
```

## 6.6 Abonelik Yönetimi Ekranı

```
ABONELİK YÖNETİMİ
──────────────────────────────────────────────────────────────────────────

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ STARTER  │ │ PROFESION│ │ENTERPRISE│ │  TOPLAM  │
│  124     │ │  89      │ │  47      │ │  260     │
│ aktif    │ │  aktif   │ │  aktif   │ │  satıcı  │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

AYLIK GELİR:
Starter:     124 × 299 TL = 37,076 TL
Professional: 89 × 699 TL = 62,211 TL
Enterprise:   47 × 1999 TL = 93,953 TL
──────────────────────────────────────
TOPLAM MRR:                 193,240 TL

YAKINDA DOLANLAR (7 gün):
┌───────────────┬────────────┬─────────────┬─────────────────────┐
│ SATICI        │ PAKET      │ BİTİŞ TARİH │ İŞLEM               │
├───────────────┼────────────┼─────────────┼─────────────────────┤
│ TechMart      │ Enterprise │ 5 Haz 2026  │ [Hatırlat][Uzat]    │
│ DigitalShop   │ Pro        │ 6 Haz 2026  │ [Hatırlat][Uzat]    │
└───────────────┴────────────┴─────────────┴─────────────────────┘
```

## 6.7 Blog & İçerik Yönetimi

```
BLOG YÖNETİMİ
──────────────────────────────────────────────────────────────────────────
[+ Yeni Yazı]  [Kategoriler]  [Etiketler]  [Medya Kütüphanesi]

Filtreler: [Tüm Yazarlar ▼] [Durum ▼] [Kategori ▼] [Tarih ▼]

┌──────────────────────────────┬──────────┬────────┬────────┬──────────┐
│ BAŞLIK                       │ YAZAR    │ KATEGORİ│ DURUM │ İŞLEM    │
├──────────────────────────────┼──────────┼────────┼────────┼──────────┤
│ 2026'nın En İyi Telefonları  │ AI Assist│ Teknoloji│✅Yayın│ 📝 🗑️  │
│ Yaz Kampanyası Rehberi       │ Admin    │ Kampanya│⏳Taslak│ 📝 🗑️  │
└──────────────────────────────┴──────────┴────────┴────────┴──────────┘
```

## 6.8 Forum Moderasyon Ekranı

```
FORUM MODERASYON
──────────────────────────────────────────────────────────────────────────
TAB: [Bekleyen Onay (12)] [Şikayet Edilenler (5)] [Aktif Konular] [Üyeler]

ŞİKAYET EDİLENLER:
┌──────────────────────────────────────────────────────────────────┐
│ 🚩 Konu: "iPhone 15 Pro Kötü Çıktı" — 3 şikayet               │
│ Yazar: user123 | Kategori: Elektronik | 2 saat önce            │
│ Şikayet nedeni: Yanıltıcı içerik, spam                          │
│ [Onayla] [Kaldır] [Kullanıcıyı Uyar] [Konuyu Kilitle]          │
└──────────────────────────────────────────────────────────────────┘

KATEGORİ YÖNETİMİ (Sürükle-Bırak):
├── 📱 Teknoloji (1,247 konu)
│   ├── Akıllı Telefonlar
│   ├── Bilgisayarlar
│   └── Aksesuarlar
├── 🛒 Alışveriş Tavsiyeleri (892 konu)
└── 💬 Genel (2,341 konu)
```
