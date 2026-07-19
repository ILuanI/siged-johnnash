#!/bin/sh
set -e

# Asegurar permisos correctos en storage y bootstrap/cache
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Crear enlace simbólico de almacenamiento público si no existe
php artisan storage:link --force || true

# Limpiar y reconstruir cachés de Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Ejecutar migraciones automáticas si la variable RUN_MIGRATIONS=true
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "Ejecutando migraciones de base de datos..."
    php artisan migrate --force
fi

# Iniciar supervisord
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
