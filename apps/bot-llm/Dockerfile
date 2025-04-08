FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY . .
# RUN pnpm dlx turbo prune --scope=bot-llm --docker

RUN pnpm install

RUN pnpm --filter bot-llm build



RUN ls -la /app/apps/bot-llm/dist/

# COPY apps/bot-llm/src/ ./apps/bot-llm/src/
# WORKDIR /app/apps/bot-llm
# RUN npm install -g typescript
# RUN tsc
# CMD ["node", "dist/main.js"] - this works for localhost xD

WORKDIR /app/apps/bot-llm

CMD ["node", "dist/server.js"]