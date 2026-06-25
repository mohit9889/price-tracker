import { Store } from '@price-tracker/shared-types';

export const API_BASE_URL = 'http://localhost:3001';

export const STORE_DISPLAY_NAMES: Record<Store, string> = {
  [Store.AMAZON]: 'Amazon',
  [Store.FLIPKART]: 'Flipkart',
  [Store.CROMA]: 'Croma',
  [Store.RELIANCE]: 'Reliance Digital',
  [Store.VIJAY_SALES]: 'Vijay Sales',
};

export const DEFAULT_REFRESH_INTERVAL_HOURS = 6;
