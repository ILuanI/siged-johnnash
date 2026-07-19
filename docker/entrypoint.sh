#!/bin/sh
set -e

# Asegurar permisos correctos en storage y bootstrap/cache
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Crear enlace simbólico de almacenamiento público si no existe
php artisan storage:link --force || true

# Limpiar y reconstruir cachés de Laravel con las variables de entorno inyectadas por Coolify
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Ejecutar migraciones automáticas si la variable RUN_MIGRATIONS=true
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "Esperando a que la base de datos esté lista para migraciones..."
    i=0
    while [ $i -lt 30 ]; do
        if php artisan migrate --force; then
            echo "Migraciones completadas exitosamente."
            break
        fi
        echo "Reintentando migraciones en 2 segundos... ($i/30)"
        sleep 2
        i=$((i+1))
    done
fi

# Iniciar supervisord
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
