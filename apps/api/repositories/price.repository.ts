import { PriceHistory, PriceHistoryDocument } from '../models/PriceHistory';
import { Store } from '@price-tracker/shared-types';

export class PriceRepository {
  async createPriceHistory(productId: string, store: Store, price: number, timestamp: string): Promise<PriceHistoryDocument> {
    const history = new PriceHistory({ productId, store, price, timestamp });
    return history.save();
  }

  async getLatestPrices(productId: string): Promise<PriceHistoryDocument[]> {
    return PriceHistory.aggregate([
      { $match: { productId } },
      { $sort: { timestamp: -1 } },
      { $group: { _id: '$store', latestPrice: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$latestPrice' } }
    ]);
  }

  async getPriceHistory(productId: string): Promise<PriceHistoryDocument[]> {
    return PriceHistory.find({ productId }).sort({ timestamp: 1 });
  }
}

export const priceRepository = new PriceRepository();
