# System Architecture

The Smart Price Tracker is composed of three main loosely-coupled components.

## High-Level Flow

1. **User Interaction**: Users interact with the Chrome Extension to add product URLs and view dashboards.
2. **Data Storage**: The Express API receives these requests and persists the products in MongoDB Atlas.
3. **Scheduled Scraping**: A GitHub Actions workflow triggers the Price Tracker Service every 6 hours.
4. **Data Extraction**: The scraper reads the tracked products from MongoDB, uses Playwright to visit the product pages, extracts the latest prices, and saves them back to MongoDB as `PriceHistory` records.
5. **Alerts**: If a price drop is detected, a notification is generated.

## Component Breakdown

### 1. Backend API (`apps/api`)
- **Stack**: Node.js, Express, Mongoose, Zod.
- **Role**: Serves as the central source of truth for the Chrome extension. Handles CRUD operations for products.

### 2. Price Tracker Service (`services/price-tracker`)
- **Stack**: Node.js, Playwright, Mongoose.
- **Role**: A standalone script that orchestrates browser automation.
- **Extractors**: Contains store-specific CSS selectors to scrape prices reliably without relying on official APIs.

### 3. Chrome Extension (`apps/extension`)
- **Stack**: React, Vite, TailwindCSS, Chrome Extensions API (Manifest V3).
- **Role**: Provides a seamless user experience for managing tracked items.

### 4. Shared Packages (`packages/`)
- `@price-tracker/shared-types`: TypeScript interfaces (`Product`, `PriceHistory`, `Store`) shared across all apps.
- `@price-tracker/shared-utils`: Common utilities like URL validation and currency formatting.
