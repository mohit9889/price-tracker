import { getBrowserContext } from '../scrapers/browser';
import { getExtractor } from '../extractors';
import { ProductUrl } from '@price-tracker/shared-types';
import { logger } from '../utils/logger';

export const checkPricesForProduct = async (urls: ProductUrl[]) => {
  const context = await getBrowserContext();
  const results = [];

  for (const productUrl of urls) {
    try {
      logger.info(`Checking price for ${productUrl.store} at ${productUrl.url}`);
      const extractor = getExtractor(productUrl.store);
      const data = await extractor(context, productUrl.url);
      results.push(data);
    } catch (error) {
      logger.error(`Failed to check price for ${productUrl.store}:`, error);
    }
  }

  return results;
};
