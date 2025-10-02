# -----------------------------------------------------------------------------
    # This Dockerfile.bun is specifically configured for projects using Bun
    # -----------------------------------------------------------------------------
    
    FROM oven/bun:latest AS base
    WORKDIR /app
    
    # ---------- deps for app build ----------
    FROM base AS deps
    COPY package.json bun.lock* ./
    RUN bun install --no-save --frozen-lockfile
    
    # ---------- Next.js builder ----------
    FROM base AS builder
    WORKDIR /app
    COPY --from=deps /app/node_modules ./node_modules
    COPY . .
    ENV NEXT_TELEMETRY_DISABLED=1
    RUN bun run build
    
    # ---------- SLIM migrations runner (no devDeps, no full source) ----------
    FROM oven/bun:alpine AS migrations
    WORKDIR /app
    ENV NODE_ENV=production
        
    # Minimal deps just for the migrator
    RUN printf '%s\n' \
    '{ "name":"migrator","type":"module",' \
    '  "dependencies":{"drizzle-orm":"^0.44.5","pg":"^8.16.3"} }' \
    > package.json
    RUN bun install --frozen-lockfile
        
    COPY drizzle ./drizzle
    COPY scripts/migrate.ts ./scripts/migrate.ts
        
    CMD ["bun", "run", "scripts/migrate.ts"]
        
    
    # ---------- Production runner ----------
    FROM base AS runner
    WORKDIR /app
    ENV NEXT_TELEMETRY_DISABLED=1
    ENV NODE_ENV=production \
        PORT=3000 \
        HOSTNAME="0.0.0.0"
    
    RUN addgroup --system --gid 1001 nodejs && \
        adduser --system --uid 1001 nextjs
    
    COPY --from=builder /app/public ./public
    COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
    COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
    
    USER nextjs
    EXPOSE 3000
    CMD ["bun", "./server.js"]
    