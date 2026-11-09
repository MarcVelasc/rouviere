/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.VITE_BASE || '/';

  return {
    base,
    build: {
      rollupOptions: {
        // Dos páginas: el ingreso (index.html) y la app de Rouviere (app/index.html).
        input: {
          ingreso: fileURLToPath(new URL('./index.html', import.meta.url)),
          app: fileURLToPath(new URL('./app/index.html', import.meta.url)),
        },
      },
    },
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.png', 'apple-touch-icon.png'],
        manifest: {
          name: 'Rouviere · Anatomía',
          short_name: 'Rouviere',
          description: 'Estudia anatomía con el atlas 3D, práctica y tu progreso.',
          lang: 'es',
          start_url: base,
          scope: base,
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#04202e',
          theme_color: '#04202e',
          icons: [
            { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
            {
              src: 'icon-maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          // Al instalar se guardan las dos páginas, su código, estilos, imágenes y three.js.
          // Los modelos 3D (~97 MB) no: se guardan la primera vez que se abren.
          globPatterns: ['**/*.{js,css,html,png,webp,jpg,svg,woff2,json}'],
          globIgnores: ['app/**/*.glb', 'app/**/*.bin'],
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
          // La app es otra página: no debe reemplazarse por el ingreso.
          navigateFallbackDenylist: [/\/app\//],
          runtimeCaching: [
            {
              urlPattern: ({ url }) => /\/app\/.*\.(glb|bin)$/.test(url.pathname),
              handler: 'CacheFirst',
              options: {
                cacheName: 'modelos-3d',
                expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 90 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // Fuentes y librerías que la app original pide a internet (lector de PDF, OCR).
              urlPattern: ({ url }) =>
                ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net'].includes(
                  url.hostname,
                ),
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'externos',
                expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 60 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      css: false,
    },
  };
});
