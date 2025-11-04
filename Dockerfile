# ==============================================================================
# ProxyForms Production Dockerfile
# Multi-stage build for optimized Next.js deployment
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Dependencies
# Install dependencies only when needed
# ------------------------------------------------------------------------------
FROM oven/bun:1 AS deps
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
COPY packages/proxyforms/package.json ./packages/proxyforms/

# Install dependencies
RUN bun install --frozen-lockfile

# ------------------------------------------------------------------------------
# Stage 2: Builder
# Rebuild the source code only when needed
# ------------------------------------------------------------------------------
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=deps /app/packages/proxyforms/node_modules ./packages/proxyforms/node_modules

# Copy source code
COPY . .

# Set build environment
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Skip env validation during build (values will be provided at runtime)
ENV SKIP_ENV_VALIDATION=true

# Build packages first (monorepo)
WORKDIR /app/packages/types
RUN bun run build

WORKDIR /app/packages/proxyforms
RUN bun run build

# Build Next.js application
WORKDIR /app/apps/web
RUN bun run build

# ------------------------------------------------------------------------------
# Stage 3: Runner
# Production image, copy all files and run next
# ------------------------------------------------------------------------------
FROM oven/bun:1-slim AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/apps/web/public ./apps/web/public

# Set the correct permission for prerender cache
RUN mkdir -p apps/web/.next
RUN chown nextjs:nodejs apps/web/.next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables for runtime
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["bun", "apps/web/server.js"]
