FROM node:20-alpine AS assets
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY resources ./resources
COPY vite.config.js ./
RUN npm run build

FROM php:8.3-cli

RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq-dev libzip-dev libonig-dev libxml2-dev libicu-dev unzip git \
    && docker-php-ext-install pdo pdo_pgsql pgsql zip mbstring xml bcmath intl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .
RUN composer install --no-dev --optimize-autoloader --no-interaction
COPY --from=assets /app/public/build ./public/build

RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

EXPOSE 8000
CMD ["start.sh"]
