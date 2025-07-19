# ── Stage 1: builder ─────────────────────────
FROM node:18-alpine AS builder
WORKDIR /app

# 1. instala todo (prod + dev)
COPY package*.json ./
RUN npm ci

# 2. build de Astro (genera dist/)
COPY . .
RUN npm run build

# ── Stage 2: runner ──────────────────────────
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# 3. instala solo prod deps (ahora sí server-destroy estará porque lo pusiste en dependencies)
COPY package*.json ./
RUN npm ci --production

# 4. trae el build completo
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# 5. arranca tu entrypoint de Astro SSR
CMD ["node", "dist/server/entry.mjs"]
