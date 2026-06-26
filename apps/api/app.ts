import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { env } from './config/env';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './middleware/logger';
import { apiRateLimiter } from './middleware/rateLimiter';
import healthRoutes from './routes/health.routes';
import productsRoutes from './routes/products.routes';
import pricesRoutes from './routes/prices.routes';

const app = express();

// Trust proxies for Render load balancer (required for express-rate-limit)
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(apiRateLimiter);
app.use(express.json());
app.use(logger);

// Swagger Documentation
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/health', healthRoutes);
app.use('/products', productsRoutes);
app.use('/prices', pricesRoutes);

// Error Handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  await connectDB();
  
  app.listen(env.PORT, () => {
    console.log(`🚀 API Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });
};

startServer();
