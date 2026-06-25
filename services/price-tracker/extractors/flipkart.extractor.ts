import { BrowserContext } from 'playwright';
import { openPage } from '../scrapers/playwright';
import { parsePrice } from '../utils/helpers';
import { Store } from '@price-tracker/shared-types';
import { logger } from '../utils/logger';

export const extractFlipkart = async (context: BrowserContext, url: string) => {
  const page = await openPage(context, url);
  try {
    // Flipkart uses heavily obfuscated, hashed CSS class names that change
    // with every deployment. Instead of guessing class names, we use two strategies:
    // 1. JSON-LD structured data (if available)
    // 2. Evaluate the DOM looking for price patterns in text content

    // Strategy 1: JSON-LD
    const jsonLd = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const script of scripts) {
        try {
          const data = JSON.parse(script.textContent || '');
          if (data['@type'] === 'Product' && data.offers) {
            return data;
          }
        } catch (e) { /* ignore */ }
      }
      return null;
    });

    if (jsonLd) {
      const offers = Array.isArray(jsonLd.offers) ? jsonLd.offers[0] : jsonLd.offers;
      const price = parseFloat(offers?.price || '0');
      const title = jsonLd.name || null;
      const image = Array.isArray(jsonLd.image) ? jsonLd.image[0] : jsonLd.image || null;

      logger.info(`Flipkart JSON-LD extracted: ${title} — ₹${price}`);
      return {
        store: Store.FLIPKART,
        productName: title,
        price,
        image,
        url
      };
    }

    // Strategy 2: Wait for SPA hydration and look for price by text pattern
    logger.warn('Flipkart JSON-LD not found, trying DOM text extraction...');
    await page.waitForTimeout(5000);

    const priceData = await page.evaluate(() => {
      // Find elements containing ₹ followed by digits
      const allElements = document.querySelectorAll('*');
      let priceText = '';
      let titleText = '';

      for (const el of allElements) {
        const text = (el as HTMLElement).innerText?.trim() || '';
        // Look for price pattern: ₹ followed by digits with commas
        if (!priceText && /^₹[\d,]+$/.test(text) && text.length > 3) {
          priceText = text;
        }
      }

      // Title is usually in an h1 or a span with a large font
      const h1 = document.querySelector('h1');
      if (h1) titleText = h1.innerText?.trim() || '';
      // Also check the title tag
      if (!titleText) titleText = document.title.split('-')[0].trim();

      return { priceText, titleText };
    });

    return {
      store: Store.FLIPKART,
      productName: priceData.titleText || null,
      price: parsePrice(priceData.priceText || ''),
      image: null,
      url
    };
  } finally {
    await page.close();
  }
};
