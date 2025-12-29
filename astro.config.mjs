// astro.config.mjs
import { defineConfig } from 'astro/config'

import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react'
import node from '@astrojs/node'
import VitePWA from '@vite-pwa/astro'


export default defineConfig({
  site: 'https://salterio.site',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
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
        runtimeCaching: [
          {
            urlPattern: /\/music/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'music-html-cache',
            }
          },
          // Cache Supabase calls if needed, though we prefer Dexie sync
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
