// astro.config.mjs
// @ts-check
import { defineConfig } from 'astro/config'

import react from '@astrojs/react'
import node  from '@astrojs/node'        // 👈 1 ‑ importa el adapter

// ‑‑ si prefieres la integración oficial de Tailwind, usa:
// import tailwind from '@astrojs/tailwind'
// integrations: [react(), tailwind()]

import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  output: 'server',                          // aseguras SSR
  adapter: node({ mode: 'standalone' }),     // empaqueta deps para Node
  integrations: [ react() ],
  vite: { plugins: [tailwindcss()] }
})
