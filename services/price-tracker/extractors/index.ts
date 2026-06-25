import { Store } from '@price-tracker/shared-types';
import { BrowserContext } from 'playwright';
import { extractAmazon } from './amazon.extractor';
import { extractFlipkart } from './flipkart.extractor';
import { extractCroma } from './croma.extractor';
import { extractReliance } from './reliance.extractor';
import { extractVijaySales } from './vijaysales.extractor';
import { extractApple } from './apple.extractor';

type ExtractorFunction = (context: BrowserContext, url: string) => Promise<any>;

export const getExtractor = (store: Store): ExtractorFunction => {
  switch (store) {
    case Store.AMAZON:
      return extractAmazon;
    case Store.FLIPKART:
      return extractFlipkart;
    case Store.CROMA:
      return extractCroma;
    case Store.RELIANCE:
      return extractReliance;
    case Store.VIJAY_SALES:
      return extractVijaySales;
    case Store.APPLE:
      return extractApple;
    default:
      throw new Error(`No extractor found for store: ${store}`);
  }
};
