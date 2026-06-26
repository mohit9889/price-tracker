# Smart Price Tracker - Implementation TODOs

Based on the `docs/application.md` blueprint and the current project structure, here is a list of what needs to be implemented.

## 1. Extension UI (`apps/extension/src`)

The extension frontend currently has empty placeholder files. These need to be built using React, Vite, and TailwindCSS as specified in the tech stack.

*   **`src/App.tsx` & `src/main.tsx`**: Implement routing and global state providers.
*   **`src/popup/Dashboard.tsx`**: Build the main dashboard to list tracked products, highlight lowest prices, and show price change indicators. Needs to call `GET /products`.
*   **`src/popup/AddProduct.tsx`**: Build a form with product name, URL input, and store selection. Needs to handle URL validation and call `POST /products`.
*   **`src/popup/ProductDetails.tsx`**: Build the detailed view with a price comparison table, price history chart, and options to edit URLs or manually refresh prices. Needs to call `GET /products/:id`.
*   **`src/popup/Settings.tsx`**: Implement settings for notification preferences, refresh interval, dark mode, and data import/export.
*   **`src/components/*`**: Implement the reusable components (`Header`, `Loader`, `PriceTable`, `ProductCard`).
*   **`src/services/*`**: Implement the API client (`productApi.ts`), notification wrapper (`notification.ts`), and storage wrapper (`storage.ts`).

## 2. Extension Background Services (`apps/extension/src/background`)

The background service worker needs to handle the core extension logic.

*   **`background.ts`**: Implement alarm registration (using `chrome.alarms`), notification click handling, and any required background polling/tasks.

## 3. Chrome Extension Manifest (`apps/extension/public/manifest.json`)

*   Ensure the manifest is correctly configured for Manifest V3 with required permissions (`notifications`, `storage`, `alarms`) and defines the background service worker correctly.

## 4. API Enhancements (`apps/api`)

The API is mostly functional (tested previously), but some features are missing.

*   **`POST /prices/refresh/:productId`**: The endpoint currently returns a `501 Not Implemented`. This needs to be wired up to trigger the scraper service synchronously for a specific product.
*   **Notification Integration**: The blueprint mentions exposing a WebSocket or SSE endpoint from the API so the extension can receive real-time price drop alerts (referenced in `chromeNotification.ts`).

## 5. Price Tracker Service (`services/price-tracker`)

The scraping service is implemented, but needs a few updates based on the blueprint.

*   **GitHub Actions Scheduler**: Create `.github/workflows/price-check.yml` to run the tracker every 6 hours (`0 */6 * * *`).
*   **Notification Logic**: The current `logPriceDrop` only logs to the console. It needs to be updated to actually trigger notifications based on the rules in the blueprint (lower than last recorded, lowest among all stores, or target price reached).

## 6. Testing

*   **Unit & Integration Tests**: Complete the implementation of the backend test suite (as planned in the previous step) and add tests for the React extension components and scraper logic.
