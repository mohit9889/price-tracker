import { PriceHistory } from '@price-tracker/shared-models';
import { Store } from '@price-tracker/shared-types';
import { logger } from '../utils/logger';

/**
 * Save a price history record for a product.
 * Returns `true` on success, `false` on failure so callers can track partial failures.
 */
export const savePriceHistory = async (
  productId: string,
  store: Store,
  price: number,
): Promise<boolean> => {
  try {
    const history = new PriceHistory({ productId, store, price, timestamp: new Date() });
    await history.save();
    logger.info(`Saved price history for product ${productId} at ${store}: ₹${price}`);
    return true;
  } catch (error) {
    logger.error(`Failed to save price history for ${productId} @ ${store}:`, error);
    return false;
  }
};
