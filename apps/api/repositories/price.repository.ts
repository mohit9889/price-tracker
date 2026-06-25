import { PriceHistory, PriceHistoryDocument } from '../models/PriceHistory';
import { Store } from '@price-tracker/shared-types';

export class PriceRepository {
  /** Record a new price entry for a product/store pair. */
  async createPriceHistory(data: { productId: string; store: Store; price: number; timestamp: Date }): Promise<PriceHistoryDocument> {
    const history = new PriceHistory(data);
    return history.save();
  }

  /** Get the latest price per store for a single product. */
  async getLatestPrices(productId: string): Promise<PriceHistoryDocument[]> {
    return PriceHistory.aggregate([
      { $match: { productId } },
      { $sort: { timestamp: -1 } },
      { $group: { _id: '$store', latestPrice: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$latestPrice' } }
    ]);
  }

  /**
   * Batch-fetch the latest price per store for multiple products in a single
   * aggregation query, eliminating the N+1 pattern in getProducts().
   * Returns a map of productId → latest price entries.
   */
  async getLatestPricesBatch(productIds: string[]): Promise<Record<string, PriceHistoryDocument[]>> {
    const results: Array<PriceHistoryDocument & { productId: string }> = await PriceHistory.aggregate([
      { $match: { productId: { $in: productIds } } },
      { $sort: { timestamp: -1 } },
      { $group: { _id: { productId: '$productId', store: '$store' }, latestPrice: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$latestPrice' } }
    ]);

    // Group results by productId in application code
    return results.reduce<Record<string, PriceHistoryDocument[]>>((acc, entry) => {
      if (!acc[entry.productId]) acc[entry.productId] = [];
      acc[entry.productId].push(entry);
      return acc;
    }, {});
  }

  /** Get the full price history for a product, oldest first. */
  async getPriceHistory(productId: string): Promise<PriceHistoryDocument[]> {
    return PriceHistory.find({ productId }).sort({ timestamp: 1 });
  }
}

export const priceRepository = new PriceRepository();
