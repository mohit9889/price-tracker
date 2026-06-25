import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { logger } from './utils/logger';
import { checkPricesForProduct } from './services/priceCheck.service';
import { savePriceHistory } from './services/saveHistory.service';
import { closeBrowser } from './scrapers/browser';
import { Product } from '@price-tracker/shared-models';

dotenv.config({ path: '../../.env' });

/**
 * Process products in batches to avoid opening too many browser pages
 * simultaneously. Concurrency of 3 means at most 3 products are scraped
 * in parallel at any given time.
 */
const CONCURRENCY = 3;

async function processInBatches<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    await Promise.all(batch.map(fn));
  }
}

const runTracker = async () => {
  logger.info('Starting price tracker service...');
  const dbUrl = process.env.DBURL;
  const dbName = process.env.DB_NAME || 'smart-price-tracker';

  if (!dbUrl) {
    logger.error('DBURL is not defined in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(dbUrl, { dbName });
    logger.info('Connected to MongoDB');

    const products = await Product.find({});
    logger.info(`Found ${products.length} products to track.`);

    let successCount = 0;
    let failCount = 0;

    await processInBatches(products, CONCURRENCY, async (product) => {
      if (!product.urls || product.urls.length === 0) return;

      const results = await checkPricesForProduct(product.urls);

      for (const result of results) {
        if (result && result.price > 0) {
          const saved = await savePriceHistory(product._id.toString(), result.store, result.price);
          if (saved) successCount++;
          else failCount++;
        }
      }
    });

    logger.info(`Tracker run complete. Saved: ${successCount}, Failed: ${failCount}.`);

  } catch (error) {
    logger.error('Fatal error in tracker execution:', error);
  } finally {
    await closeBrowser();
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB.');
  }
};

runTracker();
