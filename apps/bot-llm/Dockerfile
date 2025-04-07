# Use Node.js LTS
FROM node:20-alpine AS base

# Setup pnpm (assuming you're using pnpm, adjust if using npm or yarn)
FROM base AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY apps/bot-llm/package.json ./apps/bot-llm/package.json
COPY packages/ ./packages/

# Install dependencies (using turbo prune for production deps only)
RUN pnpm dlx turbo prune --scope=bot-llm --docker

# Build the app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm dlx turbo build --filter=bot-llm...

# Production image
FROM base AS runner
WORKDIR /app

# Copy built application
COPY --from=builder /app/apps/bot-llm/dist ./dist
COPY --from=builder /app/apps/bot-llm/package.json ./package.json
COPY --from=builder /app/apps/bot-llm/node_modules ./node_modules

# Set environment variables
ENV NODE_ENV production

# Run the application
CMD ["dist", "node", "main.js"]