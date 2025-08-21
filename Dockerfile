# ── Stage 1: build ───────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Instala deps y compila
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Stage 2: run ─────────────────────────────
FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Trabajamos dentro de dist porque ahí vive el package.json del adapter
WORKDIR /app/dist

# Copiamos el build completo (incluye package.json de dist)
COPY --from=builder /app/dist ./

# Instala solo prod deps del package.json de dist
RUN npm ci --omit=dev

EXPOSE 3000
CMD ["node", "server/entry.mjs"]

