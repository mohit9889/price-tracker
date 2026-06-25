import { priceRepository } from '../repositories/price.repository';
import { Store } from '@price-tracker/shared-types';

export class PriceService {
  async getPriceHistory(productId: string) {
    return priceRepository.getPriceHistory(productId);
  }

  async recordPrice(productId: string, store: Store, price: number) {
    return priceRepository.createPriceHistory({ productId, store, price, timestamp: new Date() });
  }

  calculateLowestPrice(prices: any[]) {
    if (!prices || prices.length === 0) return null;
    return prices.reduce((min, p) => p.price < min.price ? p : min, prices[0]);
  }
}

export const priceService = new PriceService();
