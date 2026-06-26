import { BrowserContext } from 'playwright';
import { openPage, extractFirstText, extractFirstAttribute } from '../scrapers/playwright';
import { parsePrice } from '../utils/helpers';
import { Store } from '@price-tracker/shared-types';
import { logger } from '../utils/logger';
import { ExtractedProductData } from '.';

// Amazon has several price layouts depending on stock status, Prime eligibility,
// and whether the item has size/colour variants. We try them all in parallel.
const PRICE_SELECTORS = [
  '.a-price-whole',                                // Standard in-stock price
  '#corePrice_feature_div .a-price-whole',         // Alternate product detail layout
  '.apexPriceToPay .a-price-whole',                // Subscribe & Save / coupon layout
  '#price_inside_buybox',                          // Buy-box price (some categories)
  '#tp_price_block_total_price_ww .a-price-whole', // Third-party seller layout
];

const TITLE_SELECTORS = [
  '#productTitle',
  '#title span',
];

const IMAGE_SELECTORS = [
  '#landingImage',
  '#imgBlkFront',  // Books
  '#main-image',   // Some alternate layouts
];

export const extractAmazon = async (
  context: BrowserContext,
  url: string,
): Promise<ExtractedProductData> => {
  const page = await openPage(context, url);
  try {
    // Wait for the product title to confirm the product page loaded (not a CAPTCHA).
    // Use a longer timeout here as the anchor check — subsequent extractions are fast.
    await page
      .waitForSelector(TITLE_SELECTORS.join(', '), { timeout: 15000 })
      .catch(() => logger.warn('Amazon: title selector not found within timeout'));

    // Strategy 1: Race all selectors in parallel
    const [title, priceStr, image] = await Promise.all([
      extractFirstText(page, TITLE_SELECTORS),
      extractFirstText(page, PRICE_SELECTORS),
      extractFirstAttribute(page, IMAGE_SELECTORS, 'src'),
    ]);

    let price = parsePrice(priceStr ?? '');
    let finalTitle = title;
    let finalImage = image;

    // Strategy 2: If selectors fail, try a DOM scan (Amazon changes DOM dynamically)
    if (price === 0) {
      logger.warn('Amazon explicit selectors failed, trying DOM scan...');
      const fallbackData = await page.evaluate(() => {
        let priceText = '';
        const allElements = [...document.querySelectorAll('*')];
        for (const el of allElements) {
          if (el.children.length > 0) continue;
          const text = (el as HTMLElement).innerText?.trim() || '';
          if (!priceText && /^₹[\d,]+$/.test(text) && text.replace(/[₹,]/g, '').length >= 4) {
            priceText = text;
            break;
          }
        }
        const titleText = document.title.split(':')[0].trim();
        return { priceText, titleText };
      });
      price = parsePrice(fallbackData.priceText);
      finalTitle = finalTitle || fallbackData.titleText;
    }

    if (price > 0) {
      logger.info(`Amazon extracted: "${finalTitle}" — ₹${price}`);
    } else {
      logger.warn(`Amazon extraction yielded no price for: ${url}`);
    }

    return { store: Store.AMAZON, productName: finalTitle, price, image: finalImage, url };
  } finally {
    await page.close();
  }
};