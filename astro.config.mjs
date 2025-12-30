// astro.config.mjs
import { defineConfig } from 'astro/config'
import { loadEnv } from 'vite'

const { SUPABASE_URL, SUPABASE_ANON_KEY } = loadEnv(process.env.NODE_ENV, process.cwd(), "");

import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react'
import node from '@astrojs/node'
import VitePWA from '@vite-pwa/astro'


export default defineConfig({
  site: 'https://salterio.site',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  vite: {
    define: {
      'import.meta.env.PUBLIC_SUPABASE_URL': JSON.stringify(SUPABASE_URL),
      'import.meta.env.PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(SUPABASE_ANON_KEY),
    }
  },
  integrations: [
    tailwind(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 4000000, // 4MB to be safe
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // NO usamos navigateFallback - es para SPAs, no para SSR
        // El manejo offline se hace via try/catch en las páginas Astro
        runtimeCaching: [
          {
            urlPattern: /\/api\/songs\.json/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'songs-api-cache',
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 60 * 60 * 24 // 24 horas
              },
              networkTimeoutSeconds: 3 // Si tarda más de 3s, usa cache
            }
          },
          {
            urlPattern: /\/music-offline/,
            handler: 'CacheFirst', // Siempre del cache primero
            options: {
              cacheName: 'offline-page-cache',
            }
          },
          {
            urlPattern: /\/music/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'music-html-cache',
            }
          },
        ]
      },
      manifest: {
        name: 'Salterio',
        short_name: 'Salterio',
        description: 'Lista de Cantos Cristianos Offline',
        theme_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      }
    })
  ],

})
