import { Store } from '@price-tracker/shared-types';
import { BrowserContext } from 'playwright';
import { extractAmazon } from './amazon.extractor';
import { extractFlipkart } from './flipkart.extractor';
import { extractCroma } from './croma.extractor';
import { extractReliance } from './reliance.extractor';
import { extractVijaySales } from './vijaysales.extractor';
import { extractApple } from './apple.extractor';

/** The normalised shape every extractor must return. */
export interface ExtractedProductData {
  store: Store;
  productName: string | null;
  price: number;
  image: string | null;
  url: string;
}

export type ExtractorFunction = (
  context: BrowserContext,
  url: string,
) => Promise<ExtractedProductData>;

/** Returns the correct extractor function for a given store. Throws for unknown stores. */
export const getExtractor = (store: Store): ExtractorFunction => {
  switch (store) {
    case Store.AMAZON: return extractAmazon;
    case Store.FLIPKART: return extractFlipkart;
    case Store.CROMA: return extractCroma;
    case Store.RELIANCE: return extractReliance;
    case Store.VIJAY_SALES: return extractVijaySales;
    case Store.APPLE: return extractApple;
    default:
      throw new Error(`No extractor found for store: ${store}`);
  }
};