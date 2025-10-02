# -----------------------------------------------------------------------------
    # This Dockerfile.bun is specifically configured for projects using Bun
    # -----------------------------------------------------------------------------
    
    # Use Bun's official image
    FROM oven/bun:latest AS base
    
    WORKDIR /app
    
    # Install dependencies with bun
    FROM base AS deps
    COPY package.json bun.lock* ./
    RUN bun install --no-save --frozen-lockfile
    
    # Rebuild the source code only when needed
    FROM base AS builder
    WORKDIR /app
    COPY --from=deps /app/node_modules ./node_modules
    COPY . .
    
    ENV NEXT_TELEMETRY_DISABLED=1
    
    RUN bun run build
    

    FROM base AS migrations
    WORKDIR /app
    COPY package.json bun.lock* ./
    RUN bun install --no-save --frozen-lockfile
    # copy the full source (so drizzle.config.ts, /drizzle, /scripts etc. exist)
    COPY . .
    # default command is just a placeholder; compose will override it
    CMD ["sh", "-lc", "bunx drizzle-kit generate --config=drizzle.config.ts && bun run scripts/migrate.ts"]


    # Production image, copy all the files and run next
    FROM base AS runner
    WORKDIR /app
    
    ENV NEXT_TELEMETRY_DISABLED=1
    
    ENV NODE_ENV=production \
        PORT=3000 \
        HOSTNAME="0.0.0.0"
    
    RUN addgroup --system --gid 1001 nodejs && \
        adduser --system --uid 1001 nextjs
    
    COPY --from=builder /app/public ./public
    
    # Automatically leverage output traces to reduce image size
    # https://nextjs.org/docs/advanced-features/output-file-tracing
    COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
    COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
    
    USER nextjs
    
    EXPOSE 3000
    
    CMD ["bun", "./server.js"]