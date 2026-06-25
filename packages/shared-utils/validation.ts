import { Store } from '@price-tracker/shared-types';

export function getStoreFromUrl(url: string): Store | null {
  let hostname: string;
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[shared-utils] getStoreFromUrl: failed to parse URL: ${url}`);
    }
    return null;
  }

  if (hostname.includes('amazon.in')) return Store.AMAZON;
  if (hostname.includes('flipkart.com')) return Store.FLIPKART;
  if (hostname.includes('croma.com')) return Store.CROMA;
  if (hostname.includes('reliancedigital.in')) return Store.RELIANCE;
  if (hostname.includes('vijaysales.com')) return Store.VIJAY_SALES;
  if (hostname.includes('apple.com')) return Store.APPLE;

  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[shared-utils] getStoreFromUrl: unsupported host "${hostname}"`);
  }
  return null;
}

export function isValidProductUrl(url: string): boolean {
  return getStoreFromUrl(url) !== null;
}
