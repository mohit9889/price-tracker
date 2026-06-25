# API Documentation

The REST API is built with Express and is available at `http://localhost:3001` locally.

> Interactive Swagger documentation is available at `http://localhost:3001/api-docs` when running the server.

## Endpoints

### Health
- `GET /health`: Returns system health and uptime.

### Products
- `GET /products`: Returns all tracked products along with their latest prices.
- `GET /products/:id`: Returns a specific product by ID.
- `POST /products`: Add a new product to track.
  - Body: `{ name: string, image: string, urls: [{ store: Store, url: string }] }`
- `PUT /products/:id`: Update an existing product.
- `DELETE /products/:id`: Remove a product and stop tracking it.

### Prices
- `GET /prices/history/:productId`: Get the full price history over time for a given product.
- `POST /prices/refresh/:productId`: Manually trigger a price refresh (integrates with the scraper).
