// astro.config.mjs
// @ts-check
import { defineConfig } from 'astro/config'

import react from '@astrojs/react'
import node  from '@astrojs/node'
import VitePWA from '@vite-pwa/astro'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  output: 'server',                          // aseguras SSR
  adapter: node({ mode: 'standalone' }),     // empaqueta deps para Node
  integrations: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg', 
        'favicon.ico', 
        'robots.txt', 
        'apple-touch-icon.png'
      ],
      manifest: {
        name: 'Salterio',
        short_name: 'Salterio',
        description: 'Lista de Cantos Cristianos',
        theme_color: '#ffffff',
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
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\/music/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'music-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 semana
              },
            },
          },
        ],
      },
    }),
  ],
  vite: { plugins: [tailwindcss()] }
})
