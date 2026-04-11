# Stage 1: Builder
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY prisma ./prisma/
COPY prisma.config.ts ./
# Prisma v7 build-time generate
RUN DATABASE_URL="postgresql://placeholder:5432" pnpm prisma generate
COPY . .
RUN pnpm build

# Stage 2: Production
FROM node:22-alpine
WORKDIR /app
RUN corepack enable
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml prisma.config.ts ./ 
COPY prisma ./prisma/
RUN pnpm install --prod --frozen-lockfile
# Re-link Prisma Client for production
RUN DATABASE_URL="postgresql://placeholder:5432" pnpm prisma generate
COPY --from=builder /app/dist ./dist

EXPOSE 5000

# Try dist/server.js first; if it fails, try dist/index.js
CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/server.js"]
