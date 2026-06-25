import { Store } from '@price-tracker/shared-types';

// API_BASE_URL intentionally removed — each consumer (extension, frontend)
// must read the API host from its own environment config.
// Extension: use a build-time env var or chrome.storage.
// Frontend: use VITE_API_BASE_URL or NEXT_PUBLIC_API_BASE_URL.

export const STORE_DISPLAY_NAMES: Record<Store, string> = {
  [Store.AMAZON]: 'Amazon',
  [Store.FLIPKART]: 'Flipkart',
  [Store.CROMA]: 'Croma',
  [Store.RELIANCE]: 'Reliance Digital',
  [Store.VIJAY_SALES]: 'Vijay Sales',
  [Store.APPLE]: 'Apple',
};

export const DEFAULT_REFRESH_INTERVAL_HOURS = 6;
