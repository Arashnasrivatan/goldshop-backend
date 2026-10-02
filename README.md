# GoldShop API 🪙

The backend for GoldShop, built with **Node.js, TypeScript, and Express**. It manages authentication, catalog data, carts, shipping methods, coupons, checkout and payment verification, orders, administration, and live market prices.

> **Scope:** This document covers the API and its backend services only.

## ✨ At a Glance

| Area | What the backend provides |
| --- | --- |
| Identity | Phone-based OTP registration, password login and reset, JWT access tokens, refresh-token cookies, and role-based access |
| Commerce | Products, nested categories, carts, shipping, coupons, checkout quotes, payments, and orders |
| Operations | User and ban management, store settings, dashboard statistics, scheduled jobs, and API documentation |
| Integrations | MongoDB, Redis, S3-compatible object storage, SMS, Zibal payments, and Socket.IO |

**Current price-feed status:** The scheduled price job uses simulated values. `src/common/jobs/price.job.ts` contains a TODO to replace its mock fetch with a real market-price provider. Do not treat the generated prices as a live external feed.

## 🧰 Requirements

- Node.js **22** and npm (the backend Docker image uses Node 22)
- MongoDB and Redis instances reachable from the API process
- Credentials for the configured SMS provider, S3-compatible storage, and Zibal payment gateway for the flows that use them

The application checks required environment variables at startup and connects to MongoDB and Redis before listening for requests.

## 🚀 Local Setup

Run these commands from the repository root:

```bash
npm ci
cp example.env development.env
```

Edit `development.env` with real values for all required variables. In particular, set `MONGO_URI` and `REDIS_URI` to running services. Then start the API:

```bash
npm run dev
```

The default address is `http://localhost:4000`. Check the service and browse its OpenAPI documentation:

```text
GET http://localhost:4000/api/status
    http://localhost:4000/api/docs/
    http://localhost:4000/api/docs/openapi.json
```

On Windows, create `development.env` using your shell's file-copy command rather than `cp`. Keep actual environment files and credentials out of version control.

## ⚙️ Configuration

`src/configs/env.config.ts` defines the effective defaults and required keys. `example.env` is a starting template. The following names are intentionally preserved as implemented, including `SMS_PATERN`.

| Group | Required variables | Optional variables / defaults |
| --- | --- | --- |
| Database | `MONGO_URI` | - |
| Redis | - | `REDIS_URI=redis://localhost:6379` |
| Authentication | `ACCESS_TOKEN_SECRET_KEY`, `REFRESH_TOKEN_SECRET_KEY` | `ACCESS_TOKEN_EXPIRES_IN_SECONDS=5000`, `REFRESH_TOKEN_EXPIRES_IN_SECONDS=60000`, `RESET_TOKEN_COOLDOWN=5`, `RESET_PASSWORD_LINK` |
| SMS | `SMS_BASE_URL`, `SMS_API_KEY`, `SMS_PATERN`, `SMS_PATERN_FORGOT`, `SMS_PATERN_NEW_ORDER`, `SMS_PATERN_BUYER_NEW_ORDER` | - |
| Object storage | `ARVAN_ACCESS_KEY`, `ARVAN_SECRET_KEY`, `ARVAN_BUCKET_NAME`, `ARVAN_ENDPOINT`, `ARVAN_PUBLIC_URL` | - |
| Payments | `ZIBAL_MERCHANT`, `ZIBAL_BASE_URL`, `ZIBAL_PAYMENT_BASE_URL`, `ZIBAL_CALLBACK_URL` | - |
| HTTP | - | `PORT=4000`, `DOMAIN=http://localhost:4000`, `CORS=*`, `NODE_ENV=development`, `SESSION_SECRET` |
| Market | - | `MAX_FAILURES=5`, `MARKET_START_TIME=10:30`, `MARKET_END_TIME=22:00`, `MARKET_ALWAYS_OPEN=false` |
| Categories | - | `CATEGORY_MAX_DEPTH=2` |

**Important:** Replace placeholder secrets and the development session secret in production. Set `CORS` to the permitted origin, configure externally reachable callback/reset links, and use `NODE_ENV=production`. Market hours are evaluated in the `Asia/Tehran` time zone. When the market is closed or prices are unavailable, price-dependent operations can return `503`.

## 🗺️ API Map

All application endpoints use the `/api` prefix. Swagger UI describes request bodies, authorization, responses, and the currently documented operations.

| Module | Base path | Purpose |
| --- | --- | --- |
| Auth | `/api/auth` | OTP registration, login, profile, token refresh, logout, password recovery |
| Users | `/api/users` | Own profile and addresses; administrative user and role management |
| Bans | `/api/bans` | Administrative ban records and unbanning |
| Categories | `/api/categories` | Category tree, lookup, and administration |
| Prices | `/api/prices` | Latest price availability and price history |
| Products | `/api/products` | Catalog search, product administration, and images |
| Shipping methods | `/api/shipping-methods` | Pickup/delivery options and administration |
| Carts | `/api/carts` | Authenticated cart and item quantities |
| Orders | `/api/orders` | Customer orders and administrative order management |
| Checkouts | `/api/checkouts` | Quote preview, payment creation, and verification |
| Dashboard | `/api/dashboard` | Administrative sales and operational statistics |
| Coupons | `/api/coupons` | Coupon management and redemption rules |
| Store settings | `/api/store-settings` | Order-registration availability |

The health check is `GET /api/status`; interactive documentation is served at `/api/docs/`. The route declarations in `src/modules/` are the source of truth for endpoint behavior.

### Response Envelope

Most successful controller responses use this shape:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed",
  "data": {}
}
```

Errors handled by the global error middleware use `success: false`, `statusCode`, `message`, and `errors`. In production, `errors` is normally `null`; development may expose validation details or stack information. Authentication failures generated directly by Passport may instead be plain-text `Unauthorized`.

## 🔐 Authentication and Access

1. Register a phone number with `POST /api/auth/send`, then verify the OTP with `POST /api/auth/verify`.
2. Log in with `POST /api/auth/login`. The response contains an access token and sets an HttpOnly `refresh_token` cookie.
3. Send the access token on protected routes as `Authorization: Bearer <access-token>`.
4. Use `GET /api/auth/refresh` with the refresh cookie to obtain another access token. `POST /api/auth/logout` clears the cookie and invalidates the stored refresh token.

Passwords are validated against the backend's ASCII-character policy. Certain operations require the `ADMIN` or `SUPER_ADMIN` role; see the route declarations and Swagger operations for exact permissions. Never commit access tokens, refresh cookies, or provider credentials.

## 🛍️ Checkout and Payments

The normal API sequence is:

1. Add available products to the authenticated cart under `/api/carts`.
2. Choose an active shipping method from `/api/shipping-methods`. `SHIPPING` requires one of the user's addresses; `PICKUP` does not accept an address.
3. Call `POST /api/checkouts/preview` to calculate the current subtotal, shipping, optional coupon discount, and total without creating a payment.
4. Call `POST /api/checkouts` to create a pending checkout and receive its payment URL and `trackId`. This route respects the order-registration setting.
5. After payment, `GET /api/checkouts/verify?trackId=...` verifies with the provider on the backend and creates a paid order. This endpoint requires the checkout owner's authentication and **has side effects**; it is not a read-only status lookup.

Checkout recalculates prices from current market data, checks stock again, and rejects totals above **400,000,000 Toman**. The payment amount stored with the checkout is in **RIAL**. Order details retain product, shipping, address, and coupon snapshots. A successful verification decrements stock and clears the cart.

## 📈 Prices and Background Jobs

- Socket.IO publishes price updates on namespace `/prices`, event `livePricesUpdate`. Messages include `isAvailable`; available updates contain `data`, and unavailable updates may include a `message`.
- The price job runs **every minute** and currently generates simulated values.
- A checkout-expiration job runs **every five minutes**.
- A price-cleanup job runs **every six hours**. Price documents also have a MongoDB TTL index.

`GET /api/prices/latest` can return `503` when market-price display is not allowed or no usable record exists. Price history is available separately at `GET /api/prices/history`.

## 🧱 Project Layout

```text
src/
  app.ts             Express middleware and route mounting
  server.ts          MongoDB/Redis startup, HTTP, Socket.IO, jobs, shutdown
  configs/           Environment and infrastructure configuration
  common/            Shared middleware, errors, services, jobs, utilities
  modules/           Domain routes, controllers, services, repositories, models
  docs/              OpenAPI JSON files and Swagger UI registration
docker/
  backend.Dockerfile Production backend image
```

Each domain module owns its route, validation, controller, service, repository, DTO, and model files as needed. Keep new API behavior in the relevant module and update the matching JSON files under `src/docs/` when contracts change.

## 📦 Build and Deployment

For a non-containerized production process:

```bash
npm ci
npm run build
npm start
```

`npm run build` compiles TypeScript into `dist/`; `npm start` loads `production.env` and runs `dist/server.js`. Supply reachable MongoDB and Redis services before starting.

To build the backend image directly:

```bash
docker build -f docker/backend.Dockerfile -t goldshop-api .
docker run --rm -p 4000:4000 --env-file production.env goldshop-api
```

When running in a container, `MONGO_URI` and `REDIS_URI` must point to hosts reachable **from that container**; `localhost` refers to the container itself. The image uses a non-root user and expects its runtime environment to provide credentials. Place TLS and access controls in front of production endpoints as appropriate; Swagger UI is mounted by the application in every environment.

## 🧪 Useful Commands

```bash
npm run dev          # Watch-mode development server
npm run build        # Compile TypeScript
npm start            # Run compiled server with production.env
npm run lint         # Run the configured ESLint command
npx tsc --noEmit     # Type-check without changing dist/
```

There is currently no `npm test` script in `package.json`. Before deploying, at minimum run a type-check and exercise the affected API operations against an isolated environment.

## 🩺 Troubleshooting

| Symptom | First checks |
| --- | --- |
| Startup fails with a missing variable | Compare the named key with `src/configs/env.config.ts` and populate the active env file. |
| Server does not start listening | Check MongoDB connectivity, then Redis connectivity; both are required during startup. |
| Login or registration fails | Check phone/password validation, Redis, ban status, SMS credentials, and the returned API error. |
| Latest price returns `503` | Check Tehran market hours, `MARKET_ALWAYS_OPEN`, the price job, and the most recent price record. |
| Checkout creation fails | Check store settings, cart and stock, shipping/address compatibility, current prices, coupon rules, and payment credentials. |
| Upload fails | Check the S3-compatible storage settings, file size, and accepted image MIME types. |

Never expose real `.env` files or provider secrets in issues, logs, or documentation.
