# Ø§Ø¬Ø±Ø§ÛŒ Production Ø¨Ø§ Docker

Ø§ÛŒÙ† Ø§Ø³ØªÙ‚Ø±Ø§Ø± Ø´Ø§Ù…Ù„ NginxØŒ Ø¨Ø±Ù†Ø§Ù…Ù‡ Node.jsØŒ MongoDB Ùˆ Redis Ø§Ø³Øª. Ø³Ø±ÙˆÛŒØ³â€ŒÙ‡Ø§ÛŒ Ø¯ÛŒØªØ§Ø¨ÛŒØ³ ÙÙ‚Ø· Ø¯Ø§Ø®Ù„ Ø´Ø¨Ú©Ù‡ Ø®ØµÙˆØµÛŒ Docker Ù‚Ø±Ø§Ø± Ø¯Ø§Ø±Ù†Ø¯ Ùˆ Ø§Ø² Ù…ÛŒØ²Ø¨Ø§Ù† Ù‚Ø§Ø¨Ù„ Ø¯Ø³ØªØ±Ø³ÛŒ Ù†ÛŒØ³ØªÙ†Ø¯.

## Ù¾ÛŒØ´â€ŒÙ†ÛŒØ§Ø²Ù‡Ø§

- Docker Engine Ùˆ Docker Compose v2
- Ø¯Ø§Ù…Ù†Ù‡ Ø¯Ø§Ø±Ø§ÛŒ HTTPS ÛŒØ§ reverse proxy/CDN Ø¨Ø±Ø§ÛŒ TLS
- Ù…Ù‚Ø§Ø¯ÛŒØ± ÙˆØ§Ù‚Ø¹ÛŒ Ø³Ø±ÙˆÛŒØ³ Ù¾ÛŒØ§Ù…Ú©ØŒ Arvan S3 Ùˆ Zibal Ø¯Ø± ÙØ§ÛŒÙ„ `../../production.env`

## ØªÙ†Ø¸ÛŒÙ… Ù…ØªØºÛŒØ±Ù‡Ø§

ÙØ§ÛŒÙ„ `.env.docker.example` Ø±Ø§ Ø¨Ø§ Ù†Ø§Ù… `.env` Ø¯Ø± Ù‡Ù…ÛŒÙ† Ù¾ÙˆØ´Ù‡ Ø§ÛŒØ¬Ø§Ø¯ Ùˆ ØªÙ…Ø§Ù… Ø±Ù…Ø²Ù‡Ø§ Ùˆ `APP_ORIGIN` Ø±Ø§ Ø§ØµÙ„Ø§Ø­ Ú©Ù†ÛŒØ¯. ÙØ§ÛŒÙ„ `../../production.env` Ù†ÛŒØ² Ø¨Ø§ÛŒØ¯ Ú©Ù„ÛŒØ¯Ù‡Ø§ÛŒ Ø®Ø§Ø±Ø¬ÛŒ Ù¾Ø±ÙˆÚ˜Ù‡ Ø±Ø§ Ø¯Ø§Ø´ØªÙ‡ Ø¨Ø§Ø´Ø¯Ø› Compose Ø¢Ø¯Ø±Ø³ MongoØŒ RedisØŒ callback Ù¾Ø±Ø¯Ø§Ø®Øª Ùˆ CORS Ø±Ø§ Ø®ÙˆØ¯Ø´ Ø¨Ø§ Ù…Ù‚Ø§Ø¯ÛŒØ± Ø§Ù…Ù† Ø´Ø¨Ú©Ù‡ Ø¯Ø§Ø®Ù„ÛŒ Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ† Ù…ÛŒâ€ŒÚ©Ù†Ø¯.

`APP_ORIGIN` Ø¨Ø§ÛŒØ¯ Ø¢Ø¯Ø±Ø³ Ø¹Ù…ÙˆÙ…ÛŒ HTTPS Ùˆ Ø¨Ø¯ÙˆÙ† `/` Ù¾Ø§ÛŒØ§Ù†ÛŒ Ø¨Ø§Ø´Ø¯ØŒ Ø¨Ø±Ø§ÛŒ Ù…Ø«Ø§Ù„:

```env
APP_ORIGIN=https://shop.example.com
```

callback Ø«Ø¨Øªâ€ŒØ´Ø¯Ù‡ Ø¯Ø± Ù¾Ù†Ù„ Zibal Ø¨Ø§ÛŒØ¯ Ø¨Ø§ `${APP_ORIGIN}/api/checkouts/verify` ÛŒÚ©Ø³Ø§Ù† Ø¨Ø§Ø´Ø¯.

## Ø§Ø¬Ø±Ø§

Ø§Ø² Ù¾ÙˆØ´Ù‡ `public/goldshop-frontend`:

```bash
docker compose --env-file production.env -f docker-compose.production.yml build
docker compose --env-file production.env -f docker-compose.production.yml up -d
docker compose --env-file production.env -f docker-compose.production.yml ps
```

Ø³Ø§ÛŒØª Ø¨Ù‡â€ŒØµÙˆØ±Øª Ù¾ÛŒØ´â€ŒÙØ±Ø¶ Ø±ÙˆÛŒ `127.0.0.1:8080` Ø¯Ø± Ø¯Ø³ØªØ±Ø³ Ø§Ø³Øª. reverse proxy Ù…ÛŒØ²Ø¨Ø§Ù† Ø¨Ø§ÛŒØ¯ ØªØ±Ø§ÙÛŒÚ© HTTPS Ø¯Ø§Ù…Ù†Ù‡ Ø±Ø§ Ø¨Ù‡ Ø§ÛŒÙ† Ø¢Ø¯Ø±Ø³ Ø§Ø±Ø³Ø§Ù„ Ú©Ù†Ø¯. Ø¨Ø±Ø§ÛŒ Ø§Ù†ØªØ´Ø§Ø± Ù…Ø³ØªÙ‚ÛŒÙ… Ù¾ÙˆØ±ØªØŒ `HTTP_BIND=0.0.0.0` ØªÙ†Ø¸ÛŒÙ… Ø´ÙˆØ¯Ø› Ø¯Ø± Ø§ÛŒÙ† Ø­Ø§Ù„Øª TLS Ø¨Ø§ÛŒØ¯ Ø¬Ø¯Ø§Ú¯Ø§Ù†Ù‡ ÙØ±Ø§Ù‡Ù… Ø´ÙˆØ¯.

## Ø¹Ù…Ù„ÛŒØ§Øª Ù†Ú¯Ù‡Ø¯Ø§Ø±ÛŒ

```bash
docker compose --env-file production.env -f docker-compose.production.yml logs -f app web
docker compose --env-file production.env -f docker-compose.production.yml pull
docker compose --env-file production.env -f docker-compose.production.yml up -d --build
docker compose --env-file production.env -f docker-compose.production.yml down
```

Ø¯Ø³ØªÙˆØ± `down` Ø¯Ø§Ø¯Ù‡â€ŒÙ‡Ø§ Ø±Ø§ Ø­Ø°Ù Ù†Ù…ÛŒâ€ŒÚ©Ù†Ø¯. Ø¨Ø±Ø§ÛŒ Ø¬Ù„ÙˆÚ¯ÛŒØ±ÛŒ Ø§Ø² Ø­Ø°Ù ØªØµØ§Ø¯ÙÛŒ Ø§Ø·Ù„Ø§Ø¹Ø§ØªØŒ Ø§Ø² Ø§Ø¬Ø±Ø§ÛŒ `down -v` Ø¯Ø± production Ø®ÙˆØ¯Ø¯Ø§Ø±ÛŒ Ú©Ù†ÛŒØ¯. Ø§Ø² volumeÙ‡Ø§ÛŒ `mongo_data` Ùˆ `redis_data` Ø¨Ù‡â€ŒØµÙˆØ±Øª Ø¯ÙˆØ±Ù‡â€ŒØ§ÛŒ Ù†Ø³Ø®Ù‡ Ù¾Ø´ØªÛŒØ¨Ø§Ù† Ø¨Ú¯ÛŒØ±ÛŒØ¯.

