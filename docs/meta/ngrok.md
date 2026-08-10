## Modo local:

APP_URL=http://<dominio-local-herd>
SESSION_DOMAIN=
SANCTUM_STATEFUL_DOMAINS=
> VITE_DEV_SERVER_URL no se define

## Modo ngrok solo para probar la app:

APP_URL=https://<ngrok-de-laravel>
SESSION_DOMAIN=<ngrok-de-laravel>
SANCTUM_STATEFUL_DOMAINS=<ngrok-de-laravel>

luego npm run build

