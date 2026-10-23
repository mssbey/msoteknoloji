# Havale / EFT ayarları

Gerçek banka bilgilerini `backend/.env` dosyasında tanımlayın:

```dotenv
BANK_TRANSFER_BANK_NAME="Banka adı"
BANK_TRANSFER_ACCOUNT_NAME="Hesap sahibi"
BANK_TRANSFER_IBAN="TR..."
BANK_TRANSFER_IS_TEST=false
```

Ardından `php artisan config:clear` çalıştırın. Şu an varsayılan bilgiler deneme içindir; sipariş detayında para gönderilmemesi gerektiği belirtilir.

Havale siparişi `pending` ödeme durumuyla kaydedilir. Havale açıklaması sipariş numarasıdır. Sipariş oluşturmak ödemenin alındığı anlamına gelmez; banka hareketi kontrol edildikten sonra yönetim panelinden ödeme onaylanmalıdır.
