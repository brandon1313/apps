# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY --from=builder /app/dist ./dist
COPY scripts ./scripts
EXPOSE 3000
CMD ["sh", "-c", "node scripts/wait-for-db.js && npx typeorm -d dist/database/typeorm.config.js migration:run && node dist/main.js"]
