import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { logger } from './utils/logger';
import { checkPricesForProduct } from './services/priceCheck.service';
import { savePriceHistory } from './services/saveHistory.service';
import { closeBrowser } from './scrapers/browser';

dotenv.config({ path: '../../.env' });

const productSchema = new mongoose.Schema({
  name: String,
  urls: [{ store: String, url: String }]
});
const ProductModel = mongoose.models.Product || mongoose.model('Product', productSchema);

const runTracker = async () => {
  logger.info('Starting price tracker service...');
  const dbUrl = process.env.DBURL as string;
  const dbName = process.env.DB_NAME || 'smart-price-tracker';

  if (!dbUrl) {
    logger.error('DBURL is not defined in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(dbUrl, { dbName });
    logger.info('Connected to MongoDB');

    const products = await ProductModel.find({});
    logger.info(`Found ${products.length} products to track.`);

    for (const product of products) {
      if (!product.urls || product.urls.length === 0) continue;

      const results = await checkPricesForProduct(product.urls as any);
      
      for (const result of results) {
        if (result && result.price > 0) {
          await savePriceHistory(product._id.toString(), result.store, result.price);
        }
      }
    }

  } catch (error) {
    logger.error('Error in tracker execution:', error);
  } finally {
    await closeBrowser();
    await mongoose.disconnect();
    logger.info('Tracker service completed. Disconnected from MongoDB.');
  }
};

runTracker();
