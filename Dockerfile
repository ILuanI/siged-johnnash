# ==============================================================================
# Etapa 1: Builder Unificado en Debian (PHP 8.3 + Node.js 22 + Composer)
# Debian (glibc) garantiza compatibilidad con los binarios nativos de Tailwind v4,
# LightningCSS, Rollup y la generación de tipos de Wayfinder.
# ==============================================================================
FROM php:8.3-cli-bookworm AS builder

# Instalar CA-Certificates (requerido por laravel-vite-plugin/fonts para descargar Bunny Fonts), Node 22 y herramientas
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    unzip \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
 && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
 && apt-get install -y nodejs \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

# Instalar helper de extensiones PHP y extensiones requeridas por Laravel y Wayfinder
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/
RUN install-php-extensions pdo_mysql pdo_sqlite gd zip bcmath intl mbstring xml

# Copiar ejecutable de Composer
COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# 1. Copiar manifiestos e instalar dependencias PHP
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --prefer-dist

# 2. Copiar manifiestos e instalar dependencias Node
COPY package.json package-lock.json ./
RUN npm ci

# 3. Copiar todo el código fuente del proyecto
COPY . .

# 4. Asegurar directorios de almacenamiento y cache con permisos adecuados
RUN mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache storage/logs bootstrap/cache \
 && chmod -R 775 storage bootstrap/cache \
 && rm -f bootstrap/cache/*.php

# 5. Crear .env efímero de compilación aislado en memoria
RUN if [ -f .env.example ]; then cp .env.example .env; else touch .env; fi \
 && echo "" >> .env \
 && echo "APP_ENV=production" >> .env \
 && echo "SESSION_DRIVER=array" >> .env \
 && echo "CACHE_STORE=array" >> .env \
 && echo "QUEUE_CONNECTION=sync" >> .env \
 && echo "DB_CONNECTION=sqlite" >> .env \
 && echo "DB_DATABASE=:memory:" >> .env

# 6. Generar autoloader optimizado de composer y autodiscovery de paquetes de producción
RUN composer dump-autoload --optimize --no-dev

# 7. Generar APP_KEY válida requerida por Wayfinder/Laravel durante la compilación
RUN php artisan key:generate --force

# 8. Compilar assets estáticos frontend (Vite + Wayfinder + Bunny Fonts)
ENV NODE_ENV=production
RUN npm run build

# 9. Eliminar .env temporal para garantizar que en tiempo de ejecución se usen las vars inyectadas por Coolify
RUN rm -f /app/.env


# ==============================================================================
# Etapa 2: Imagen de Ejecución Producción (PHP 8.3 FPM + Nginx + Supervisord)
# ==============================================================================
FROM php:8.3-fpm-bookworm AS runner

# Instalar Nginx, Supervisor y ca-certificates en Debian
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    nginx \
    supervisor \
    curl \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

# Instalar extensiones PHP para el entorno de ejecución
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/
RUN install-php-extensions pdo_mysql gd zip bcmath opcache intl mbstring xml

# Configuración recomendada de Opcache para producción
RUN echo "opcache.enable=1" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini \
 && echo "opcache.enable_cli=1" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini \
 && echo "opcache.memory_consumption=128" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini \
 && echo "opcache.interned_strings_buffer=8" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini \
 && echo "opcache.max_accelerated_files=10000" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini \
 && echo "opcache.validate_timestamps=0" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini \
 && echo "opcache.save_comments=1" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini

WORKDIR /var/www/html

# Copiar aplicación completa compilada desde la etapa builder
COPY --from=builder /app /var/www/html

# Copiar configuraciones de Nginx, Supervisor y Script Entrypoint
COPY docker/nginx.conf /etc/nginx/sites-available/default
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

# Asignar permisos y hacer ejecutable el entrypoint
RUN chmod +x /usr/local/bin/entrypoint.sh \
 && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Puerto expuesto por Nginx
EXPOSE 80

# Definir Script de Entrada
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
