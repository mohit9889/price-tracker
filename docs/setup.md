# Local Development Setup

Follow these steps to get the project running locally.

## Prerequisites

- Node.js (v20+)
- MongoDB Atlas cluster (or local MongoDB)
- Playwright browsers

## 1. Environment Variables

Create a `.env` file in the root directory:

```env
DBURL=mongodb+srv://<user>:<password>@cluster0.mongodb.net/?appName=Cluster0
PORT=3001
DB_NAME=smart-price-tracker
NODE_ENV=development
```

## 2. Installation

Install all workspace dependencies from the root directory:

```bash
npm install
```

Install Playwright browsers for the scraper:

```bash
cd services/price-tracker
npx playwright install chromium
```

## 3. Database Seeding

To quickly populate your database with a sample product:

```bash
npm run db:seed
```

## 4. Running the API

Start the Express backend:

```bash
npm run dev:api
```
The API will be available at `http://localhost:3001`. You can view the Swagger docs at `http://localhost:3001/api-docs`.

## 5. Running the Scraper

To manually run a price check cycle:

```bash
npm run run:tracker
```

## 6. Running the Chrome Extension

To start the Vite dev server for the extension:

```bash
npm run dev:extension
```
Then load the `apps/extension/dist` folder into Chrome via `chrome://extensions/` -> "Load unpacked".
