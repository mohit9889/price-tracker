import { Store } from './Store';

export interface PriceHistory {
  id: string;
  productId: string;
  store: Store;
  price: number;
  timestamp: string;
}
