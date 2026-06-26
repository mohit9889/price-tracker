import { BrowserContext } from 'playwright';
import { openPage, extractText } from '../scrapers/playwright';
import { parsePrice } from '../utils/helpers';
import { Store } from '@price-tracker/shared-types';
import { logger } from '../utils/logger';
import { ExtractedProductData } from '.';
import { extractJsonLdProduct } from '../utils/Jsonld';

// Reliance Digital is a Vue.js SPA. Product data is NOT in the initial HTML —
// it's injected via JSON-LD after client-side hydration. The shared
// extractJsonLdProduct utility polls for this block before reading.

const PRICE_SELECTORS = [
  '[class*="offer-price"]',
  '[class*="pdp-price"]',
  '[class*="Price"]',
  '[class*="price"]',
];

export const extractReliance = async (
  context: BrowserContext,
  url: string,
): Promise<ExtractedProductData> => {
  const page = await openPage(context, url);
  try {
    // Strategy 1: JSON-LD — poll until the SPA injects it (up to 12 s on CI)
    const jsonLd = await extractJsonLdProduct(page, 12000);

    if (jsonLd?.price) {
      const price = parseFloat(jsonLd.price || '0');
      logger.info(`Reliance JSON-LD extracted: "${jsonLd.title}" — ₹${price}`);
      return {
        store: Store.RELIANCE,
        productName: jsonLd.title,
        price,
        image: jsonLd.image,
        url,
      };
    }

    // Strategy 2: Wait for h1 to confirm Vue hydration, then try DOM selectors.
    // This avoids scraping the skeleton/loading state.
    logger.warn('Reliance JSON-LD not found, falling back to DOM selectors...');
    await page
      .waitForSelector('h1', { timeout: 12000 })
      .catch(() => logger.warn('Reliance: h1 not found within timeout'));

    const title = await extractText(page, 'h1');

    let priceStr = '';
    for (const sel of PRICE_SELECTORS) {
      const text = await extractText(page, sel);
      if (text) { priceStr = text; break; }
    }

    // Image fallback: og:image is set server-side on Reliance even before hydration
    const image = await page
      .$eval('meta[property="og:image"]', (el) => el.getAttribute('content'))
      .catch(() => null);

    const price = parsePrice(priceStr);

    if (price > 0) {
      logger.info(`Reliance DOM extracted: "${title}" — ₹${price}`);
    } else {
      logger.warn(`Reliance extraction yielded no price for: ${url}`);
    }

    return { store: Store.RELIANCE, productName: title, price, image, url };
  } finally {
    await page.close();
  }
};