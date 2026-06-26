import { BrowserContext } from 'playwright';
import { openPage, extractText, extractAttribute } from '../scrapers/playwright';
import { parsePrice } from '../utils/helpers';
import { Store } from '@price-tracker/shared-types';
import { logger } from '../utils/logger';
import { ExtractedProductData } from '.';
import { extractJsonLdProduct } from '../utils/Jsonld';

// Apple.com renders JSON-LD reliably on SSR page load, but the DOM selectors
// below are kept as a fallback in case the schema changes.
const TITLE_SELECTORS = [
  'h1.hero-headline',
  'h1.as-producttile-title',
  'h1',
];

const PRICE_SELECTORS = [
  '.as-price-currentprice',
  '.rc-prices-fullprice',
  '[data-autom="full-price"]',
];

const IMAGE_SELECTORS = [
  '.as-images-image',
  '.rc-images-image',
  '.as-l-container-image img',
  'picture.product-image img',
];

export const extractApple = async (
  context: BrowserContext,
  url: string,
): Promise<ExtractedProductData> => {
  const page = await openPage(context, url);
  try {
    // Strategy 1: JSON-LD (preferred — survives DOM restructuring)
    const jsonLd = await extractJsonLdProduct(page, 8000);

    if (jsonLd?.price) {
      const price = parseFloat(jsonLd.price || '0');
      logger.info(`Apple JSON-LD extracted: "${jsonLd.title}" — ₹${price}`);
      return {
        store: Store.APPLE,
        productName: jsonLd.title || 'Apple Product',
        price,
        image: jsonLd.image,
        url,
      };
    }

    // Strategy 2: DOM selectors — wait for the title to confirm page load
    logger.warn('Apple JSON-LD not found, falling back to DOM selectors...');
    await page
      .waitForSelector(TITLE_SELECTORS.join(', '), { timeout: 10000 })
      .catch(() => logger.warn('Apple: title selector not found within timeout'));

    let title: string | null = null;
    for (const sel of TITLE_SELECTORS) {
      const text = await extractText(page, sel);
      if (text) { title = text; break; }
    }

    let priceStr = '';
    for (const sel of PRICE_SELECTORS) {
      const text = await extractText(page, sel);
      if (text) { priceStr = text; break; }
    }

    let image: string | null = null;
    for (const sel of IMAGE_SELECTORS) {
      const src = await extractAttribute(page, sel, 'src');
      if (src) { image = src; break; }
    }

    const price = parsePrice(priceStr);
    logger.info(`Apple DOM extracted: "${title}" — ₹${price}`);

    return {
      store: Store.APPLE,
      productName: title || 'Apple Product',
      price,
      image,
      url,
    };
  } finally {
    await page.close();
  }
};