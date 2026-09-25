# syntax=docker/dockerfile:1.7
FROM node:22-bookworm-slim AS build
WORKDIR /frontend
COPY public/goldshop-frontend/package.json public/goldshop-frontend/package-lock.json ./
RUN --mount=type=cache,id=goldshop-frontend-npm,target=/root/.npm \
    npm ci --no-audit --no-fund --prefer-offline \
      --fetch-retries=2 --fetch-retry-mintimeout=2000 \
      --fetch-retry-maxtimeout=10000 --fetch-timeout=60000
COPY public/goldshop-frontend/public/panel/package.json public/goldshop-frontend/public/panel/package-lock.json ./public/panel/
RUN --mount=type=cache,id=goldshop-panel-npm,target=/root/.npm \
    npm --prefix ./public/panel ci --no-audit --no-fund --prefer-offline \
      --fetch-retries=2 --fetch-retry-mintimeout=2000 \
      --fetch-retry-maxtimeout=10000 --fetch-timeout=60000
COPY public/goldshop-frontend/src ./src
COPY public/goldshop-frontend/scripts ./scripts
COPY public/goldshop-frontend/public ./public
RUN npm run build

FROM nginx:1.28-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /frontend/public /usr/share/nginx/html
RUN rm -rf /usr/share/nginx/html/panel && mkdir -p /usr/share/nginx/html/panel
COPY --from=build /frontend/public/panel/build /usr/share/nginx/html/panel
EXPOSE 80
