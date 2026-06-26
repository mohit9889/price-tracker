import { BrowserContext } from 'playwright';
import { openPage, extractAttribute } from '../scrapers/playwright';
import { parsePrice } from '../utils/helpers';
import { Store } from '@price-tracker/shared-types';
import { logger } from '../utils/logger';
import { ExtractedProductData } from '.';

// Amazon has several price layouts depending on stock status, Prime eligibility,
// and whether the item has size/colour variants. We try them in priority order.
const PRICE_SELECTORS = [
  '.a-price-whole',                          // Standard in-stock price
  '#corePrice_feature_div .a-price-whole',   // Alternate product detail layout
  '.apexPriceToPay .a-price-whole',          // Subscribe & Save / coupon layout
  '#price_inside_buybox',                    // Buy-box price (some categories)
  '#tp_price_block_total_price_ww .a-price-whole', // Third-party seller layout
];

const TITLE_SELECTORS = [
  '#productTitle',
  '#title span',
];

const IMAGE_SELECTORS = [
  '#landingImage',
  '#imgBlkFront',       // Books
  '#main-image',        // Some alternate layouts
];

export const extractAmazon = async (
  context: BrowserContext,
  url: string,
): Promise<ExtractedProductData> => {
  const page = await openPage(context, url);
  try {
    // Wait for the product title — confirms the product page has loaded.
    // This is more reliable than waitForLoadState on CI runners.
    await page
      .waitForSelector(TITLE_SELECTORS.join(', '), { timeout: 15000 })
      .catch(() => logger.warn('Amazon: title selector not found within timeout'));

    // Extract title
    let title: string | null = null;
    for (const sel of TITLE_SELECTORS) {
      const el = await page.$(sel);
      if (el) {
        title = (await el.innerText()).trim() || null;
        if (title) break;
      }
    }

    // Extract price — try each selector in order, use the first that yields a value
    let priceStr = '';
    for (const sel of PRICE_SELECTORS) {
      const el = await page.$(sel);
      if (el) {
        const raw = (await el.innerText()).trim();
        if (raw) {
          priceStr = raw;
          break;
        }
      }
    }

    // Extract image
    let image: string | null = null;
    for (const sel of IMAGE_SELECTORS) {
      const src = await extractAttribute(page, sel, 'src');
      if (src) {
        image = src;
        break;
      }
    }

    const price = parsePrice(priceStr);

    if (price > 0) {
      logger.info(`Amazon extracted: "${title}" — ₹${price}`);
    } else {
      logger.warn(`Amazon extraction yielded no price for: ${url}`);
    }

    return { store: Store.AMAZON, productName: title, price, image, url };
  } finally {
    await page.close();
  }
};