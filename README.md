# Smart Price Tracker

A complete system to track product prices across major Indian e-commerce stores (Amazon, Flipkart, Croma, Reliance Digital, Vijay Sales).

The project is built as a monorepo consisting of:
1. **Chrome Extension** (`apps/extension`): The user interface to add products, view dashboards, and receive notifications. (React/Vite/TailwindCSS)
2. **Backend API** (`apps/api`): REST API to manage products and fetch price histories. (Node.js/Express/MongoDB)
3. **Price Tracker Service** (`services/price-tracker`): A Playwright-based scraper that periodically fetches the latest prices and stores them in the database.

## Quick Start

See [Setup Guide](docs/setup.md) for detailed local development instructions.

## Documentation

- [Architecture](docs/architecture.md): High-level system design and data flow.
- [API Documentation](docs/api.md): Endpoints and data structures.
- [Setup Guide](docs/setup.md): How to run the project locally.

## Features

- **Multi-Store Tracking**: Track a single product across different e-commerce platforms.
- **Price History**: View historical price trends to make informed buying decisions.
- **Automated Scraping**: Runs periodically via GitHub Actions.
- **Notifications**: Alerts you when prices drop.
