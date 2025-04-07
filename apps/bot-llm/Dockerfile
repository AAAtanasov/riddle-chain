FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY . .
# RUN pnpm dlx turbo prune --scope=web --docker

RUN pnpm install
RUN pnpm build

# COPY apps/bot-llm/src/ ./apps/bot-llm/src/
# WORKDIR /app/apps/bot-llm
# RUN npm install -g typescript
# RUN tsc
CMD ["node", "dist/main.js"]