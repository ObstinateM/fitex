FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.13.2 --activate

# --- Dependencies ---
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/api/package.json apps/api/package.json
COPY apps/api/.npmrc apps/api/.npmrc
RUN pnpm install --frozen-lockfile

# --- Build ---
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY . .
RUN pnpm --filter @fitex/api build

# --- Production ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nestjs
RUN adduser --system --uid 1001 nestjs

COPY --from=build --chown=nestjs:nestjs /app/apps/api/dist ./dist
COPY --from=build --chown=nestjs:nestjs /app/apps/api/node_modules ./node_modules
COPY --from=build --chown=nestjs:nestjs /app/apps/api/package.json ./package.json

USER nestjs
EXPOSE 4000
CMD ["node", "dist/main"]
