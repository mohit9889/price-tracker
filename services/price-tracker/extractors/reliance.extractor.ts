import { BrowserContext } from 'playwright';
import { openPage, extractText } from '../scrapers/playwright';
import { parsePrice } from '../utils/helpers';
import { Store } from '@price-tracker/shared-types';
import { logger } from '../utils/logger';
import { ExtractedProductData } from '.';

export const extractReliance = async (
  context: BrowserContext,
  url: string,
): Promise<ExtractedProductData> => {
  const page = await openPage(context, url);
  try {
    // Reliance Digital is a Vue.js SPA. Product data is NOT in the visible DOM
    // on initial load — it's embedded as JSON-LD structured data in the <head>.
    const jsonLd = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const script of scripts) {
        try {
          const data = JSON.parse(script.textContent || '');
          if (data['@type'] === 'Product' && data.offers) {
            return data;
          }
        } catch (e) { /* ignore parse errors */ }
      }
      return null;
    });

    if (jsonLd) {
      const price = parseFloat(jsonLd.offers?.price || '0');
      const title = jsonLd.name || null;
      const image = jsonLd.image || null;

      logger.info(`Reliance JSON-LD extracted: ${title} — ₹${price}`);
      return {
        store: Store.RELIANCE,
        productName: title,
        price,
        image,
        url
      };
    }

    // Fallback: wait for SPA hydration then try DOM selectors
    logger.warn('Reliance JSON-LD not found, trying DOM selectors...');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() =>
      logger.warn('Reliance: networkidle timeout, proceeding with current DOM state')
    );
    const title = await extractText(page, 'h1');
    const priceStr = await extractText(page, '[class*="price"], [class*="Price"]');

    return {
      store: Store.RELIANCE,
      productName: title,
      price: parsePrice(priceStr || ''),
      image: null,
      url
    };
  } finally {
    await page.close();
  }
};
