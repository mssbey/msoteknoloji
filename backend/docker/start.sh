#!/bin/sh
set -e

php artisan config:cache
php artisan migrate --force
php artisan storage:link || true

# SENTOS_IMPORT_ON_BOOT=true iken urunler Sentos'tan arka planda cekilir.
# Arka planda calisir ki sunucu hemen ayaga kalksin ve health check zaman asimina ugramasin.
if [ "${SENTOS_IMPORT_ON_BOOT:-false}" = "true" ]; then
    (php artisan sentos:import --ensure-store --approve --images --variants || echo "sentos:import basarisiz") &
fi

exec php artisan serve --host=0.0.0.0 --port="${PORT:-8000}"
