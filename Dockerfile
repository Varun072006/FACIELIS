# ==========================================
# FACIELIS Production Multi-Stage Dockerfile
# ==========================================
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

# Dependencies stage
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Builder stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client & Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npx prisma generate
RUN npm run build

# Runner stage
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=5000
ENV WEB_PORT=3847

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 facielis

COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.ts ./next.config.ts

RUN chown -R facielis:nodejs /app
USER facielis

EXPOSE 5000
EXPOSE 3847

CMD ["npm", "run", "start"]
