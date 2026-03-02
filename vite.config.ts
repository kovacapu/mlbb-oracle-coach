import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['icons/*.svg', 'icons/*.png', 'assets/heroes/*.png'],
            manifest: {
                name: 'MLBB Oracle Coach',
                short_name: 'Oracle',
                description: 'Mobile Legends: Bang Bang yapay zeka maç koçu',
                theme_color: '#07070f',
                background_color: '#07070f',
                display: 'standalone',
                orientation: 'portrait',
                start_url: '/',
                scope: '/',
                lang: 'tr',
                icons: [
                    {
                        src: '/icons/icon.svg',
                        sizes: 'any',
                        type: 'image/svg+xml',
                    },
                    // PNG icons (generated via: npm run generate-icons)
                    {
                        src: '/icons/icon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: '/icons/icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: '/icons/icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                ],
                categories: ['games', 'sports', 'utilities'],
            },
            workbox: {
                // Cache JS/CSS/HTML/images
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webp}'],
                // Limit runtime cache size to avoid filling device storage
                runtimeCaching: [
                    {
                        // Supabase API calls — network first, fall back to cache
                        urlPattern: /^https:\/\/.*supabase\.co\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'supabase-api',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 5 * 60, // 5 minutes
                            },
                        },
                    },
                    {
                        // Hero/item images from remote URLs — cache-first
                        urlPattern: /\.(png|jpg|jpeg|webp|svg)$/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'image-cache',
                            expiration: {
                                maxEntries: 200,
                                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                            },
                        },
                    },
                ],
            },
            devOptions: {
                // Enable PWA in dev mode so you can test locally
                enabled: false,
            },
        }),
    ],
});
