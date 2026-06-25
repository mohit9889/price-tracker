import { Store } from './Store';

export interface PriceHistory {
  id: string;
  productId: string;
  store: Store;
  price: number;
  /** ISO 8601 string as received over the wire from the API (JSON serialisation of Date). */
  timestamp: string;
}
