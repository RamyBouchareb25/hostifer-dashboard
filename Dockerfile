# ── Stage 1: Install dependencies ────────────────────────────────────
FROM oven/bun:1 AS deps

WORKDIR /app

COPY package.json bun.lock* ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN bun install --frozen-lockfile

# ── Stage 2: Build the application ──────────────────────────────────
FROM oven/bun:1 AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN bunx prisma generate

# Build Next.js (standalone output)
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# ── Stage 3: Production image ───────────────────────────────────────
FROM node:25-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for K8s security best practices
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy Prisma artifacts needed at runtime
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/lib/generated ./lib/generated

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# DATABASE_URL is provided at runtime via K8s env/secret pointing to the StatefulSet PG service
# e.g. postgresql://user:pass@postgres-svc.default.svc.cluster.local:5432/hostifer

CMD ["node", "server.js"]
