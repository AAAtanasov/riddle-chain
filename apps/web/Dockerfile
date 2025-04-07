# Use Node.js LTS
FROM node:22-alpine AS base

# Setup pnpm (assuming you're using pnpm, adjust if using npm or yarn)
FROM base AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/ ./packages/

# Install dependencies (using turbo prune for production deps only)
RUN pnpm dlx turbo prune --scope=web --docker

# Build the app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm dlx turbo build --filter=web...

# Production image
FROM base AS runner
WORKDIR /app

# Copy built application
COPY --from=builder /app/apps/web/next.config.ts ./
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/package.json ./package.json
COPY --from=builder /app/apps/web/node_modules ./node_modules

# Set environment variables
ENV NODE_ENV production
ENV PORT 3000

# Expose port
EXPOSE 3000

# Run the application
CMD ["", "pnpm", "start"]