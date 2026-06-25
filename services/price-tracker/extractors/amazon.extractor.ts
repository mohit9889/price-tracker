import { BrowserContext } from 'playwright';
import { openPage, extractText, extractAttribute } from '../scrapers/playwright';
import { parsePrice } from '../utils/helpers';
import { Store } from '@price-tracker/shared-types';
import { logger } from '../utils/logger';
import { ExtractedProductData } from '.';

export const extractAmazon = async (
  context: BrowserContext,
  url: string,
): Promise<ExtractedProductData> => {
  const page = await openPage(context, url);
  try {
    const title = await extractText(page, '#productTitle');
    const priceStr = await extractText(page, '.a-price-whole');
    const image = await extractAttribute(page, '#landingImage', 'src');
    const price = parsePrice(priceStr || '');

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
