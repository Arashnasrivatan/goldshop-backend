# syntax=docker/dockerfile:1.7
FROM node:22-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,id=goldshop-backend-npm,target=/root/.npm \
    npm ci --no-audit --no-fund --prefer-offline \
      --fetch-retries=2 --fetch-retry-mintimeout=2000 \
      --fetch-retry-maxtimeout=10000 --fetch-timeout=60000

FROM dependencies AS build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-bookworm-slim AS production
ENV NODE_ENV=production PORT=4000
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates tini && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY --from=dependencies /app/node_modules ./node_modules
RUN npm prune --omit=dev --no-audit --no-fund
COPY --from=build --chown=node:node /app/dist ./dist
RUN mkdir -p /app/logs && chown -R node:node /app
USER node
EXPOSE 4000
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "dist/server.js"]
