# ==============================================================================
# Etapa 1: Build de Assets Frontend (Node.js + Vite + Inertia React)
# ==============================================================================
FROM node:22-alpine AS node-builder

WORKDIR /app

# Copiar manifiestos de paquetes
COPY package.json package-lock.json ./

# Instalar dependencias frontend
RUN npm ci

# Copiar el resto del código fuente del proyecto
COPY . .

# Compilar assets para producción (genera public/build)
RUN npm run build


# ==============================================================================
# Etapa 2: Instalador de Dependencias PHP (Composer)
# ==============================================================================
FROM composer:2.8 AS composer-builder

WORKDIR /app

# Copiar archivos de dependencias PHP
COPY composer.json composer.lock ./

# Instalar dependencias sin paquetes dev y sin ejecutar scripts aún
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --ignore-platform-reqs

# Copiar código fuente
COPY . .

# Optimizar autoloader para producción
RUN composer dump-autoload --optimize --no-dev


# ==============================================================================
# Etapa 3: Imagen de Ejecución Producción (PHP 8.3 FPM + Nginx + Supervisord)
# ==============================================================================
FROM php:8.3-fpm-alpine AS runner

# Instalar paquetes requeridos del sistema
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    bash

# Instalar instalador de extensiones PHP oficial
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/

# Instalar extensiones PHP necesarias para Laravel, DomPDF y Maatwebsite Excel
RUN install-php-extensions pdo_mysql gd zip bcmath opcache intl mbstring xml

# Configuración recomendada de Opcache para producción
RUN echo "opcache.enable=1" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini \
 && echo "opcache.enable_cli=1" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini \
 && echo "opcache.memory_consumption=128" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini \
 && echo "opcache.interned_strings_buffer=8" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini \
 && echo "opcache.max_accelerated_files=10000" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini \
 && echo "opcache.validate_timestamps=0" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini \
 && echo "opcache.save_comments=1" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini

# Establecer directorio de trabajo
WORKDIR /var/www/html

# Copiar código del proyecto
COPY . /var/www/html

# Copiar carpeta vendor compilada desde la etapa composer-builder
COPY --from=composer-builder /app/vendor /var/www/html/vendor

# Copiar assets estáticos compilados desde la etapa node-builder
COPY --from=node-builder /app/public/build /var/www/html/public/build

# Copiar configuraciones de Nginx, Supervisor y Script Entrypoint
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

# Asignar permisos y hacer ejecutable el entrypoint
RUN chmod +x /usr/local/bin/entrypoint.sh \
 && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Puerto expuesto por Nginx
EXPOSE 80

# Definir Script de Entrada
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
