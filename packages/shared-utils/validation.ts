import { Store } from '@price-tracker/shared-types';

export function getStoreFromUrl(url: string): Store | null {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    if (hostname.includes('amazon.in')) return Store.AMAZON;
    if (hostname.includes('flipkart.com')) return Store.FLIPKART;
    if (hostname.includes('croma.com')) return Store.CROMA;
    if (hostname.includes('reliancedigital.in')) return Store.RELIANCE;
    if (hostname.includes('vijaysales.com')) return Store.VIJAY_SALES;
    
    return null;
  } catch (e) {
    return null;
  }
}

export function isValidProductUrl(url: string): boolean {
  return getStoreFromUrl(url) !== null;
}
