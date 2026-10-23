#!/bin/sh
set -e

php artisan config:cache
php artisan migrate --force
php artisan storage:link || true
php artisan products:export-images

# Acilista Sentos'a baglanma; kalici veritabanindaki son katalog kullanilir.
# Gunluk is 00.00 Europe/Istanbul saat diliminde routes/console.php'de tanimli.
php artisan schedule:work &

exec php artisan serve --host=0.0.0.0 --port="${PORT:-8000}"
