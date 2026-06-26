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

/**
 * Parse the optional --productId=<id> CLI argument.
 * When present, only that product is scraped (used by the API refresh endpoint).
 * When absent, all products are scraped (used by the GitHub Actions scheduler).
 */
function parseProductIdArg(): string | null {
  const arg = process.argv.find((a) => a.startsWith('--productId='));
  return arg ? arg.split('=')[1] : null;
}

const runTracker = async () => {
  const singleProductId = parseProductIdArg();

  if (singleProductId) {
    logger.info(`Starting price tracker for single product: ${singleProductId}`);
  } else {
    logger.info('Starting price tracker service (all products)...');
  }

  const dbUrl = process.env.DBURL;
  const dbName = process.env.DB_NAME || 'smart-price-tracker';

  if (!dbUrl) {
    logger.error('DBURL is not defined in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(dbUrl, { dbName });
    logger.info('Connected to MongoDB');

    // Fetch one product or all products depending on the CLI flag
    const products = singleProductId
      ? await Product.find({ _id: singleProductId })
      : await Product.find({});

    if (products.length === 0) {
      logger.warn(singleProductId
        ? `No product found with id: ${singleProductId}`
        : 'No products to track.');
      return;
    }

    logger.info(`Found ${products.length} product(s) to track.`);

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
    process.exit(1);
  } finally {
    await closeBrowser();
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB.');
  }
};

runTracker();

