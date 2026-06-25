# Smart Price Tracker - Technical Architecture Blueprint

## Project Overview

Smart Price Tracker is a Chrome Extension that allows users to track product prices across multiple e-commerce websites.

Supported stores:

* Amazon
* Flipkart
* Croma
* Reliance Digital
* Vijay Sales
* Future stores

Users manually add product URLs.

The system:

1. Stores products in MongoDB
2. Tracks prices periodically
3. Compares prices across stores
4. Maintains price history
5. Sends Chrome notifications when prices drop
6. Displays the lowest available price

---

# Architecture

Chrome Extension
↓
Node.js API
↓
MongoDB

GitHub Actions Scheduler
↓
Price Tracker Service
↓
Store Extractors
↓
MongoDB
↓
Chrome Notifications

---

# Tech Stack

## Frontend

* React
* TypeScript
* Vite
* TailwindCSS
* Chrome Extension Manifest V3

## Backend

* Node.js
* Express
* TypeScript

## Database

* MongoDB Atlas
* Mongoose

## Scraping

* Playwright

## Scheduling

* GitHub Actions

---

# Folder Structure

smart-price-tracker/

## apps/extension

Chrome extension application.

Responsibilities:

* User interface
* Product management
* Chrome notifications
* Settings
* API communication

### public/manifest.json

Contains:

* Extension name
* Permissions
* Background service worker
* Notifications permission
* Storage permission
* Alarms permission

### src/main.tsx

React entry point.

Responsibilities:

* Bootstrap React application
* Render App component

### src/App.tsx

Root application component.

Responsibilities:

* Routing
* Global state providers
* Layout

---

### src/popup/Dashboard.tsx

Main dashboard.

Features:

* Display tracked products
* Display lowest prices
* Display price change indicators
* Display statistics

API calls:

GET /products

---

### src/popup/AddProduct.tsx

Product creation screen.

Features:

* Product name input
* URL input
* Store selection
* URL validation
* Submit button

API calls:

POST /products

---

### src/popup/ProductDetails.tsx

Product detail screen.

Features:

* Product information
* Price comparison table
* Price history chart
* Edit URLs
* Refresh prices

API calls:

GET /products/:id

---

### src/popup/Settings.tsx

Settings screen.

Features:

* Notification preferences
* Refresh interval
* Dark mode
* Export data
* Import data

---

### src/components/ProductCard.tsx

Reusable product card.

Displays:

* Product image
* Product name
* Lowest price
* Store name
* Last checked

---

### src/components/PriceComparisonTable.tsx

Displays store comparisons.

Columns:

* Store
* Current Price
* Lowest Indicator

---

### src/components/PriceHistoryChart.tsx

Displays historical prices.

Input:

PriceHistory[]

---

### src/services/productApi.ts

Handles all product APIs.

Functions:

getProducts()
getProduct()
createProduct()
updateProduct()
deleteProduct()

---

### src/services/notification.ts

Chrome notification service.

Functions:

showPriceDropNotification()
showLowestPriceNotification()

Uses:

chrome.notifications

---

### src/services/storage.ts

Chrome storage wrapper.

Functions:

saveSettings()
loadSettings()

Uses:

chrome.storage.local

---

### src/background/background.ts

Extension service worker.

Responsibilities:

* Alarm registration
* Notification click handling
* Background tasks

Uses:

chrome.alarms
chrome.notifications

---

# apps/api

Backend REST API.

---

## src/app.ts

Express application entry point.

Responsibilities:

* Middleware registration
* Route registration

---

## src/routes/products.routes.ts

Routes:

GET /products

GET /products/:id

POST /products

PUT /products/:id

DELETE /products/:id

---

## src/routes/prices.routes.ts

Routes:

GET /prices/history/:productId

POST /prices/refresh/:productId

---

## src/controllers/products.controller.ts

Responsibilities:

* Request validation
* Service invocation
* Response formatting

---

## src/controllers/prices.controller.ts

Responsibilities:

* Price history retrieval
* Price refresh trigger

---

## src/services/product.service.ts

Business logic.

Responsibilities:

* Create product
* Update product
* Product validation
* Product aggregation

---

## src/services/price.service.ts

Responsibilities:

* Current prices
* Lowest price calculation
* Highest price calculation
* Savings calculation

---

## src/services/notification.service.ts

Responsibilities:

* Build notification payloads
* Notification history

Future support:

Email
Push notifications

---

## src/repositories/product.repository.ts

MongoDB operations.

Functions:

create()
update()
find()
findById()
delete()

---

## src/repositories/price.repository.ts

MongoDB price operations.

Functions:

createPriceHistory()
getLatestPrices()
getPriceHistory()

---

## src/models/Product.ts

MongoDB schema.

Fields:

id
name
image
urls
createdAt
updatedAt

---

## src/models/PriceHistory.ts

MongoDB schema.

Fields:

productId
store
price
timestamp

---

# services/price-tracker

Scheduled scraper service.

Responsible for collecting prices.

---

## src/index.ts

Tracker entry point.

Flow:

Load products
↓
Scrape prices
↓
Compare prices
↓
Store results
↓
Generate notifications

---

## src/extractors

Contains website-specific extraction logic.

---

### amazon.extractor.ts

Responsibilities:

* Open Amazon product page
* Extract price
* Extract title
* Extract image

Returns:

{
productName,
price,
image,
store
}

---

### flipkart.extractor.ts

Same structure as Amazon extractor.

---

### croma.extractor.ts

Same structure as Amazon extractor.

---

### reliance.extractor.ts

Same structure as Amazon extractor.

---

### index.ts

Extractor registry.

Function:

getExtractor(store)

Returns correct extractor implementation.

---

## src/scrapers/browser.ts

Playwright browser management.

Responsibilities:

* Launch browser
* Close browser
* Reuse sessions

---

## src/scrapers/playwright.ts

Shared Playwright utilities.

Functions:

openPage()
waitForSelector()
extractText()

---

## src/services/priceCheck.service.ts

Main scraping orchestration.

Flow:

Load URLs
↓
Run extractor
↓
Return prices

---

## src/services/comparePrice.service.ts

Price comparison logic.

Functions:

findLowestPrice()
findHighestPrice()
calculateSavings()

---

## src/services/saveHistory.service.ts

Persists scraped prices.

Creates:

PriceHistory records

---

# packages/shared-types

Shared TypeScript types.

---

## Product.ts

interface Product

Fields:

id
name
image
urls

---

## PriceHistory.ts

interface PriceHistory

Fields:

productId
store
price
timestamp

---

## Store.ts

Enum

AMAZON
FLIPKART
CROMA
RELIANCE
VIJAY_SALES

---

# MongoDB Collections

## products

{
_id,
name,
image,
urls[],
createdAt,
updatedAt
}

---

## price_history

{
_id,
productId,
store,
price,
timestamp
}

---

# GitHub Actions

.github/workflows/price-check.yml

Runs every 6 hours.

Flow:

1. Install dependencies
2. Execute tracker
3. Update MongoDB
4. Generate notifications

Cron:

0 */6 * * *

---

# Notification Rules

Notify when:

1. Current price is lower than last recorded price

OR

2. Current price becomes lowest among all stores

OR

3. User target price reached

Notification payload:

Title:
Price Drop Alert

Message:
Product Name
Store
New Price
Savings Amount

Action:
Open Product Details

---

# MVP Success Criteria

User can:

* Add products
* Add multiple URLs
* Track prices
* Compare store prices
* View lowest price
* View history
* Receive Chrome notifications

System can:

* Scrape supported stores
* Store price history
* Calculate savings
* Run automatically every 6 hours
* Scale for future SaaS implementation
