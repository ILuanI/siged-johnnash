import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const viteDevServerUrl = env.VITE_DEV_SERVER_URL;

    const server = viteDevServerUrl
        ? (() => {
              const url = new URL(viteDevServerUrl);

              return {
                  host: '0.0.0.0',
                  hmr: {
                      host: url.hostname,
                      protocol: url.protocol === 'https:' ? 'wss' : 'ws',
                      clientPort: Number(
                          url.port || (url.protocol === 'https:' ? '443' : '80'),
                      ),
                  },
                  origin: viteDevServerUrl,
              };
          })()
        : undefined;

    return {
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.tsx'],
                refresh: true,
                fonts: [
                    bunny('Instrument Sans', {
                        weights: [400, 500, 600],
                    }),
                ],
            }),
            inertia(),
            react({
                babel: {
                    plugins: ['babel-plugin-react-compiler'],
                },
            }),
            tailwindcss(),
            wayfinder({
                formVariants: true,
            }),
        ],
        server,
    };
});
