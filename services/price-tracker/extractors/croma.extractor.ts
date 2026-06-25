import { BrowserContext } from 'playwright';
import { openPage, extractText, extractAttribute } from '../scrapers/playwright';
import { parsePrice } from '../utils/helpers';
import { Store } from '@price-tracker/shared-types';
import { logger } from '../utils/logger';
import { ExtractedProductData } from '.';

export const extractCroma = async (
  context: BrowserContext,
  url: string,
): Promise<ExtractedProductData> => {
  const page = await openPage(context, url);
  try {
    const title = await extractText(page, 'h1.pd-title');
    const priceStr = await extractText(page, 'span.amount');
    const image = await extractAttribute(page, '.product-img img', 'src');
    const price = parsePrice(priceStr || '');

    if (price > 0) {
      logger.info(`Croma extracted: "${title}" — ₹${price}`);
    } else {
      logger.warn(`Croma extraction yielded no price for: ${url}`);
    }

    return { store: Store.CROMA, productName: title, price, image, url };
  } finally {
    await page.close();
  }
};
