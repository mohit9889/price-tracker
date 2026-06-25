import mongoose from 'mongoose';
import { Store } from '@price-tracker/shared-types';
import { logger } from '../utils/logger';

const priceHistorySchema = new mongoose.Schema({
  productId: { type: String, required: true },
  store: { type: String, enum: Object.values(Store), required: true },
  price: { type: Number, required: true },
  timestamp: { type: String, required: true },
});

const PriceHistoryModel = mongoose.models.PriceHistory || mongoose.model('PriceHistory', priceHistorySchema);

export const savePriceHistory = async (productId: string, store: Store, price: number) => {
  try {
    const timestamp = new Date().toISOString();
    const history = new PriceHistoryModel({ productId, store, price, timestamp });
    await history.save();
    logger.info(`Saved price history for product ${productId} at ${store}: ${price}`);
  } catch (error) {
    logger.error(`Failed to save price history for ${productId}:`, error);
  }
};
