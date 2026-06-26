import { BrowserContext } from 'playwright';
import { openPage, extractFirstText, extractFirstAttribute } from '../scrapers/playwright';
import { parsePrice } from '../utils/helpers';
import { Store } from '@price-tracker/shared-types';
import { logger } from '../utils/logger';
import { ExtractedProductData } from '.';
import { extractJsonLdProduct } from '../utils/Jsonld';

// Croma is a Next.js SSR site. JSON-LD is usually present on load, but the
// DOM selectors below are tried as fallback in case of layout changes.
const TITLE_SELECTORS = [
  'h1.pd-title',
  'h1[class*="pdp-title"]',
  'h1',
];

const PRICE_SELECTORS = [
  'span.amount',
  '[class*="offer-price"]',
  '[class*="cp-price"]',
  '[data-testid="price"]',
];

const IMAGE_SELECTORS = [
  '.product-img img',
  '.cr-img-wrp img',
  'img[class*="product-image"]',
];

export const extractCroma = async (
  context: BrowserContext,
  url: string,
): Promise<ExtractedProductData> => {
  const page = await openPage(context, url);
  try {
    // Strategy 1: JSON-LD (most resilient to DOM changes)
    const jsonLd = await extractJsonLdProduct(page, 8000);

    if (jsonLd?.price) {
      const price = parseFloat(jsonLd.price || '0');
      logger.info(`Croma JSON-LD extracted: "${jsonLd.title}" — ₹${price}`);
      return {
        store: Store.CROMA,
        productName: jsonLd.title,
        price,
        image: jsonLd.image,
        url,
      };
    }

    // Strategy 2: DOM selectors — race all in parallel
    logger.warn('Croma JSON-LD not found, falling back to DOM selectors...');
    await page
      .waitForSelector(TITLE_SELECTORS.join(', '), { timeout: 10000 })
      .catch(() => logger.warn('Croma: title selector not found within timeout'));

    const [title, priceStr, image] = await Promise.all([
      extractFirstText(page, TITLE_SELECTORS),
      extractFirstText(page, PRICE_SELECTORS),
      extractFirstAttribute(page, IMAGE_SELECTORS, 'src'),
    ]);

    const price = parsePrice(priceStr ?? '');

    if (price > 0) {
      logger.info(`Croma DOM extracted: "${title}" — ₹${price}`);
    } else {
      logger.warn(`Croma extraction yielded no price for: ${url}`);
    }

    return { store: Store.CROMA, productName: title, price, image, url };
  } finally {
    await page.close();
  }
};