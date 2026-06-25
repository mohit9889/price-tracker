# Smart Price Tracker — Implementation Plan

Build a Chrome Extension + Node.js API + Scraper Service monorepo that tracks product prices across Indian e-commerce stores (Amazon, Flipkart, Croma, Reliance Digital, Vijay Sales), stores history in MongoDB Atlas, and notifies users of price drops.

> [!IMPORTANT]
> The entire project is currently **scaffolded but empty** — every file exists with 0 bytes. This plan covers implementing all code from scratch across 7 phases.

---

## User Review Required

> [!WARNING]
> **TailwindCSS version**: The blueprint specifies TailwindCSS. Should I use **TailwindCSS v4** (latest, CSS-first config) or **v3** (class-based `tailwind.config.js`)?

> [!IMPORTANT]
> **API deployment target**: The blueprint mentions GitHub Actions for the scraper, but where will the Express API be hosted? For now I'll build it to run locally (`npm run dev`) and leave deployment config as a follow-up. Confirm if you need Vercel/Railway/Render config included.

> [!IMPORTANT]
> **MongoDB database name**: I'll use `smart-price-tracker` as the DB name in the connection string. Let me know if you prefer something else.

## Open Questions

1. **Price history chart library**: The blueprint mentions `PriceHistoryChart.tsx`. Should I use **Chart.js** (via `react-chartjs-2`) or **Recharts**? I'll default to **Recharts** (lighter, React-native) unless you prefer otherwise.
2. **Extension popup dimensions**: Standard Chrome popup is 400×600px. Any specific size preference?
3. **API port**: I'll default to `3001`. OK?
4. **Authentication**: The blueprint has no auth layer. Should I add API key middleware or leave it open for MVP?

---

## Proposed Changes

Implementation is split into 7 phases, ordered by dependency (foundations first).

---

### Phase 1 — Monorepo Foundation & Shared Packages

Set up the monorepo tooling and shared code that all three apps depend on.

#### [MODIFY] [package.json](file:///Users/mohitrajput/Work/price-tracker/package.json)
- npm workspaces config pointing to `apps/*`, `services/*`, `packages/*`
- Root dev scripts (`dev:api`, `dev:extension`, `run:tracker`)

#### [MODIFY] [.gitignore](file:///Users/mohitrajput/Work/price-tracker/.gitignore)
- Standard Node/TypeScript ignores (`node_modules/`, `dist/`, `.env`, etc.)

#### [MODIFY] [.env](file:///Users/mohitrajput/Work/price-tracker/.env)
- Add `PORT`, `DB_NAME`, `NODE_ENV` alongside existing `DBURL`

---

#### [MODIFY] [Product.ts](file:///Users/mohitrajput/Work/price-tracker/packages/shared-types/Product.ts)
```ts
interface Product {
  id: string;
  name: string;
  image: string;
  urls: ProductUrl[];
  createdAt: string;
  updatedAt: string;
}
interface ProductUrl {
  store: Store;
  url: string;
}
```

#### [MODIFY] [PriceHistory.ts](file:///Users/mohitrajput/Work/price-tracker/packages/shared-types/PriceHistory.ts)
```ts
interface PriceHistory {
  id: string;
  productId: string;
  store: Store;
  price: number;
  timestamp: string;
}
```

#### [MODIFY] [Store.ts](file:///Users/mohitrajput/Work/price-tracker/packages/shared-types/Store.ts)
```ts
enum Store {
  AMAZON = 'AMAZON',
  FLIPKART = 'FLIPKART',
  CROMA = 'CROMA',
  RELIANCE = 'RELIANCE',
  VIJAY_SALES = 'VIJAY_SALES',
}
```

#### [MODIFY] [constants.ts](file:///Users/mohitrajput/Work/price-tracker/packages/shared-utils/constants.ts)
- API base URL, store display names, default refresh interval

#### [MODIFY] [currency.ts](file:///Users/mohitrajput/Work/price-tracker/packages/shared-utils/currency.ts)
- `formatPrice(amount: number): string` → INR formatting

#### [MODIFY] [validation.ts](file:///Users/mohitrajput/Work/price-tracker/packages/shared-utils/validation.ts)
- `isValidProductUrl(url: string): boolean`
- `getStoreFromUrl(url: string): Store | null`

---

### Phase 2 — Backend API (`apps/api`)

Express REST API with Mongoose, following controller → service → repository pattern.

#### [MODIFY] [package.json](file:///Users/mohitrajput/Work/price-tracker/apps/api/package.json)
- Dependencies: `express`, `mongoose`, `cors`, `dotenv`, `zod`
- Dev deps: `typescript`, `tsx`, `@types/express`, `@types/cors`

#### [MODIFY] [tsconfig.json](file:///Users/mohitrajput/Work/price-tracker/apps/api/tsconfig.json)
- Target ES2022, module NodeNext, strict mode

#### [MODIFY] [env.ts](file:///Users/mohitrajput/Work/price-tracker/apps/api/config/env.ts)
- Load and validate env vars (`DBURL`, `PORT`, `DB_NAME`)

#### [MODIFY] [database.ts](file:///Users/mohitrajput/Work/price-tracker/apps/api/config/database.ts)
- Mongoose connection using `DBURL` from env
- Connection event logging

---

#### [MODIFY] [Product.ts](file:///Users/mohitrajput/Work/price-tracker/apps/api/models/Product.ts)
- Mongoose schema: `name`, `image`, `urls[]` (store + url), timestamps

#### [MODIFY] [ProductUrl.ts](file:///Users/mohitrajput/Work/price-tracker/apps/api/models/ProductUrl.ts)
- Sub-document schema for product URLs

#### [MODIFY] [PriceHistory.ts](file:///Users/mohitrajput/Work/price-tracker/apps/api/models/PriceHistory.ts)
- Mongoose schema: `productId` (ref), `store`, `price`, `timestamp`
- Index on `(productId, timestamp)`

---

#### [MODIFY] [product.repository.ts](file:///Users/mohitrajput/Work/price-tracker/apps/api/repositories/product.repository.ts)
- `create()`, `update()`, `find()`, `findById()`, `delete()`

#### [MODIFY] [price.repository.ts](file:///Users/mohitrajput/Work/price-tracker/apps/api/repositories/price.repository.ts)
- `createPriceHistory()`, `getLatestPrices()`, `getPriceHistory()`

---

#### [MODIFY] [product.service.ts](file:///Users/mohitrajput/Work/price-tracker/apps/api/services/product.service.ts)
- Business logic: create, update, validate, aggregate with latest prices

#### [MODIFY] [price.service.ts](file:///Users/mohitrajput/Work/price-tracker/apps/api/services/price.service.ts)
- Lowest/highest price calculations, savings

#### [MODIFY] [notification.service.ts](file:///Users/mohitrajput/Work/price-tracker/apps/api/services/notification.service.ts)
- Build notification payloads for price drops

---

#### [MODIFY] [products.controller.ts](file:///Users/mohitrajput/Work/price-tracker/apps/api/controllers/products.controller.ts)
- Request validation (Zod), call services, format responses

#### [MODIFY] [prices.controller.ts](file:///Users/mohitrajput/Work/price-tracker/apps/api/controllers/prices.controller.ts)
- History retrieval, price refresh trigger

---

#### [MODIFY] [products.routes.ts](file:///Users/mohitrajput/Work/price-tracker/apps/api/routes/products.routes.ts)
- `GET /products`, `GET /products/:id`, `POST /products`, `PUT /products/:id`, `DELETE /products/:id`

#### [MODIFY] [prices.routes.ts](file:///Users/mohitrajput/Work/price-tracker/apps/api/routes/prices.routes.ts)
- `GET /prices/history/:productId`, `POST /prices/refresh/:productId`

#### [MODIFY] [health.routes.ts](file:///Users/mohitrajput/Work/price-tracker/apps/api/routes/health.routes.ts)
- `GET /health` → `{ status: 'ok', timestamp }`

---

#### [MODIFY] [errorHandler.ts](file:///Users/mohitrajput/Work/price-tracker/apps/api/middleware/errorHandler.ts)
- Global error handler with structured JSON errors

#### [MODIFY] [logger.ts](file:///Users/mohitrajput/Work/price-tracker/apps/api/middleware/logger.ts)
- Request logging middleware (method, URL, status, duration)

#### [MODIFY] [app.ts](file:///Users/mohitrajput/Work/price-tracker/apps/api/app.ts)
- Express app: CORS, JSON body parser, routes, error handler, DB connect, listen

---

### Phase 3 — Chrome Extension (`apps/extension`)

React + Vite + TailwindCSS Chrome Extension with Manifest V3.

#### [MODIFY] [package.json](file:///Users/mohitrajput/Work/price-tracker/apps/extension/package.json)
- Dependencies: `react`, `react-dom`, `react-router-dom`, `recharts`, `tailwindcss`
- Dev deps: `vite`, `@vitejs/plugin-react`, `typescript`, `@crxjs/vite-plugin`

#### [MODIFY] [tsconfig.json](file:///Users/mohitrajput/Work/price-tracker/apps/extension/tsconfig.json)
- JSX react-jsx, strict mode, path aliases

#### [MODIFY] [vite.config.ts](file:///Users/mohitrajput/Work/price-tracker/apps/extension/vite.config.ts)
- React plugin, CRXJS plugin for Chrome Extension bundling, path aliases

#### [MODIFY] [manifest.json](file:///Users/mohitrajput/Work/price-tracker/apps/extension/public/manifest.json)
- Manifest V3: popup, background service worker, permissions (notifications, storage, alarms)

---

#### [MODIFY] [main.tsx](file:///Users/mohitrajput/Work/price-tracker/apps/extension/src/main.tsx)
- React DOM render with BrowserRouter

#### [MODIFY] [App.tsx](file:///Users/mohitrajput/Work/price-tracker/apps/extension/src/App.tsx)
- Routes: `/` → Dashboard, `/add` → AddProduct, `/product/:id` → ProductDetails, `/settings` → Settings
- Header layout wrapper

#### [NEW] `apps/extension/src/index.css`
- TailwindCSS directives, custom theme variables, global styles

---

#### Extension Types

#### [MODIFY] [Product.ts](file:///Users/mohitrajput/Work/price-tracker/apps/extension/src/types/Product.ts)
- Re-export or mirror shared types for extension use

#### [MODIFY] [Price.ts](file:///Users/mohitrajput/Work/price-tracker/apps/extension/src/types/Price.ts)
- Price-specific frontend types

#### [MODIFY] [Store.ts](file:///Users/mohitrajput/Work/price-tracker/apps/extension/src/types/Store.ts)
- Store enum + display name map

---

#### Extension Services

#### [MODIFY] [productApi.ts](file:///Users/mohitrajput/Work/price-tracker/apps/extension/src/services/productApi.ts)
- `getProducts()`, `getProduct(id)`, `createProduct()`, `updateProduct()`, `deleteProduct()`
- Fetch wrapper with base URL from settings

#### [MODIFY] [notification.ts](file:///Users/mohitrajput/Work/price-tracker/apps/extension/src/services/notification.ts)
- `showPriceDropNotification()`, `showLowestPriceNotification()` via `chrome.notifications`

#### [MODIFY] [storage.ts](file:///Users/mohitrajput/Work/price-tracker/apps/extension/src/services/storage.ts)
- `saveSettings()`, `loadSettings()` via `chrome.storage.local`

---

#### Extension Hooks

#### [MODIFY] [useProducts.ts](file:///Users/mohitrajput/Work/price-tracker/apps/extension/src/hooks/useProducts.ts)
- Fetch products, loading/error state, refetch

#### [MODIFY] [useSettings.ts](file:///Users/mohitrajput/Work/price-tracker/apps/extension/src/hooks/useSettings.ts)
- Load/save settings from chrome.storage

---

#### Extension Components

#### [MODIFY] [Header.tsx](file:///Users/mohitrajput/Work/price-tracker/apps/extension/src/components/Header.tsx)
- App title, navigation links, settings icon

#### [MODIFY] [ProductCard.tsx](file:///Users/mohitrajput/Work/price-tracker/apps/extension/src/components/ProductCard.tsx)
- Product image, name, lowest price, store badge, last checked

#### [MODIFY] [PriceTable.tsx](file:///Users/mohitrajput/Work/price-tracker/apps/extension/src/components/PriceTable.tsx)
- Store comparison table (store, current price, lowest indicator)

#### [MODIFY] [Loader.tsx](file:///Users/mohitrajput/Work/price-tracker/apps/extension/src/components/Loader.tsx)
- Spinner/skeleton loading component

#### [NEW] `apps/extension/src/components/PriceHistoryChart.tsx`
- Recharts line chart for price history over time

---

#### Extension Pages

#### [MODIFY] [Dashboard.tsx](file:///Users/mohitrajput/Work/price-tracker/apps/extension/src/popup/Dashboard.tsx)
- Product list via `useProducts`, ProductCard grid, stats summary, add button

#### [MODIFY] [AddProduct.tsx](file:///Users/mohitrajput/Work/price-tracker/apps/extension/src/popup/AddProduct.tsx)
- Form: product name, URLs with store auto-detection, validation, submit

#### [MODIFY] [ProductDetails.tsx](file:///Users/mohitrajput/Work/price-tracker/apps/extension/src/popup/ProductDetails.tsx)
- Product info, PriceTable, PriceHistoryChart, edit/refresh actions

#### [MODIFY] [Settings.tsx](file:///Users/mohitrajput/Work/price-tracker/apps/extension/src/popup/Settings.tsx)
- Notification toggle, refresh interval, dark mode toggle, export/import

---

#### [MODIFY] [background.ts](file:///Users/mohitrajput/Work/price-tracker/apps/extension/src/background/background.ts)
- Chrome alarm registration, notification click handlers

---

#### Extension Utilities

#### [MODIFY] [currency.ts](file:///Users/mohitrajput/Work/price-tracker/apps/extension/src/utils/currency.ts)
- INR formatting helper

#### [MODIFY] [date.ts](file:///Users/mohitrajput/Work/price-tracker/apps/extension/src/utils/date.ts)
- Relative time formatting ("2 hours ago")

---

### Phase 4 — Price Tracker Service (`services/price-tracker`)

Standalone Node.js service that scrapes prices using Playwright.

#### [MODIFY] [package.json](file:///Users/mohitrajput/Work/price-tracker/services/price-tracker/package.json)
- Dependencies: `playwright`, `mongoose`, `dotenv`
- Dev deps: `typescript`, `tsx`

#### [MODIFY] [tsconfig.json](file:///Users/mohitrajput/Work/price-tracker/services/price-tracker/tsconfig.json)
- Target ES2022, module NodeNext

---

#### Scrapers

#### [MODIFY] [browser.ts](file:///Users/mohitrajput/Work/price-tracker/services/price-tracker/scrapers/browser.ts)
- Launch/close Playwright Chromium, reuse browser instance

#### [MODIFY] [playwright.ts](file:///Users/mohitrajput/Work/price-tracker/services/price-tracker/scrapers/playwright.ts)
- `openPage()`, `waitForSelector()`, `extractText()` utilities

---

#### Extractors

#### [MODIFY] [amazon.extractor.ts](file:///Users/mohitrajput/Work/price-tracker/services/price-tracker/extractors/amazon.extractor.ts)
- CSS selectors for Amazon India price, title, image

#### [MODIFY] [flipkart.extractor.ts](file:///Users/mohitrajput/Work/price-tracker/services/price-tracker/extractors/flipkart.extractor.ts)
- CSS selectors for Flipkart price, title, image

#### [MODIFY] [croma.extractor.ts](file:///Users/mohitrajput/Work/price-tracker/services/price-tracker/extractors/croma.extractor.ts)
- CSS selectors for Croma price, title, image

#### [MODIFY] [reliance.extractor.ts](file:///Users/mohitrajput/Work/price-tracker/services/price-tracker/extractors/reliance.extractor.ts)
- CSS selectors for Reliance Digital price, title, image

#### [NEW] `services/price-tracker/extractors/vijaysales.extractor.ts`
- CSS selectors for Vijay Sales (listed in supported stores but missing from scaffold)

#### [MODIFY] [index.ts](file:///Users/mohitrajput/Work/price-tracker/services/price-tracker/extractors/index.ts)
- `getExtractor(store: Store)` registry — returns correct extractor

---

#### Tracker Services

#### [MODIFY] [priceCheck.service.ts](file:///Users/mohitrajput/Work/price-tracker/services/price-tracker/services/priceCheck.service.ts)
- Orchestrate: load URLs → run extractor → return prices

#### [MODIFY] [comparePrice.service.ts](file:///Users/mohitrajput/Work/price-tracker/services/price-tracker/services/comparePrice.service.ts)
- `findLowestPrice()`, `findHighestPrice()`, `calculateSavings()`

#### [MODIFY] [saveHistory.service.ts](file:///Users/mohitrajput/Work/price-tracker/services/price-tracker/services/saveHistory.service.ts)
- Persist scraped prices as PriceHistory records

---

#### [MODIFY] [chromeNotification.ts](file:///Users/mohitrajput/Work/price-tracker/services/price-tracker/notifications/chromeNotification.ts)
- Build notification payloads for price drops

#### [MODIFY] [logger.ts](file:///Users/mohitrajput/Work/price-tracker/services/price-tracker/utils/logger.ts)
- Console logger with timestamps and levels

#### [MODIFY] [helpers.ts](file:///Users/mohitrajput/Work/price-tracker/services/price-tracker/utils/helpers.ts)
- Price parsing, URL normalization utilities

#### [MODIFY] [index.ts](file:///Users/mohitrajput/Work/price-tracker/services/price-tracker/index.ts)
- Entry point: connect DB → load products → scrape → compare → save → notify

---

### Phase 5 — GitHub Actions & Scripts

#### [MODIFY] [price-check.yml](file:///Users/mohitrajput/Work/price-tracker/.github/workflows/price-check.yml)
- Cron `0 */6 * * *`, install deps, install Playwright browsers, run tracker

#### [MODIFY] [deploy-api.yml](file:///Users/mohitrajput/Work/price-tracker/.github/workflows/deploy-api.yml)
- Placeholder for API deployment (configurable later)

#### [MODIFY] [test.yml](file:///Users/mohitrajput/Work/price-tracker/.github/workflows/test.yml)
- Run linting and tests on PR

---

#### [MODIFY] [seed.ts](file:///Users/mohitrajput/Work/price-tracker/scripts/seed.ts)
- Seed MongoDB with sample products and price history

#### [MODIFY] [migrate.ts](file:///Users/mohitrajput/Work/price-tracker/scripts/migrate.ts)
- Create indexes, run data migrations

#### [MODIFY] [cleanup.ts](file:///Users/mohitrajput/Work/price-tracker/scripts/cleanup.ts)
- Remove old price history records

---

### Phase 6 — Documentation

#### [MODIFY] [README.md](file:///Users/mohitrajput/Work/price-tracker/README.md)
- Project overview, setup instructions, development guide

#### [MODIFY] [architecture.md](file:///Users/mohitrajput/Work/price-tracker/docs/architecture.md)
- System architecture diagram, data flow, tech decisions

#### [MODIFY] [api.md](file:///Users/mohitrajput/Work/price-tracker/docs/api.md)
- API endpoint documentation with request/response examples

#### [MODIFY] [setup.md](file:///Users/mohitrajput/Work/price-tracker/docs/setup.md)
- Step-by-step local development setup

---

### Phase 7 — Integration & Polish

- Wire extension to API (ensure CORS, base URL config)
- End-to-end test: add product → scrape → view prices → receive notification
- Chrome extension build & load in browser for manual verification

---

## Verification Plan

### Automated Tests
```bash
# API — verify server starts and routes respond
cd apps/api && npm run dev
# curl health check
curl http://localhost:3001/health

# Extension — verify Vite builds without errors
cd apps/extension && npm run build

# Tracker — verify it runs against MongoDB
cd services/price-tracker && npm run start
```

### Manual Verification
- Load the built extension in Chrome via `chrome://extensions` → Load unpacked
- Add a sample product and verify it appears in the dashboard
- Trigger a price refresh and verify price history populates
- Verify Chrome notification fires on a price drop
