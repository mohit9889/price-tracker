import { BrowserContext } from 'playwright';
import { openPage } from '../scrapers/playwright';
import { parsePrice } from '../utils/helpers';
import { Store } from '@price-tracker/shared-types';
import { logger } from '../utils/logger';

export const extractVijaySales = async (context: BrowserContext, url: string) => {
  const page = await openPage(context, url);
  try {
    // Vijay Sales renders content server-side, but class names don't match
    // the guessed selectors. The price appears as "VSP ₹137990" and "MRP ₹144900"
    // in the rendered HTML. We extract it by scanning text content.

    // Wait a bit for any hydration
    await page.waitForTimeout(3000);

    const productData = await page.evaluate(() => {
      let priceText = '';
      let titleText = '';
      let imageUrl = '';

      // JSON-LD strategy first
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const script of scripts) {
        try {
          const data = JSON.parse(script.textContent || '');
          if (data['@type'] === 'Product' && data.offers) {
            const offers = Array.isArray(data.offers) ? data.offers[0] : data.offers;
            priceText = offers?.price || '';
            titleText = data.name || '';
            imageUrl = Array.isArray(data.image) ? data.image[0] : (data.image || '');
            return { priceText, titleText, imageUrl, source: 'json-ld' };
          }
        } catch (e) { /* ignore */ }
      }

      // Fallback: scan for ₹ price patterns in DOM text
      const allElements = document.querySelectorAll('*');
      for (const el of allElements) {
        const text = (el as HTMLElement).innerText?.trim() || '';
        // Match "VSP ₹137990" or standalone "₹137990"
        const match = text.match(/₹([\d,]+)/);
        if (!priceText && match && match[1].length >= 4) {
          priceText = match[1];
        }
      }

      // Title from breadcrumb or page title
      const metaTitle = document.querySelector('meta[property="og:title"]');
      if (metaTitle) titleText = metaTitle.getAttribute('content') || '';
      if (!titleText) titleText = document.title.split('|')[0].trim();

      // Image from og:image
      const metaImage = document.querySelector('meta[property="og:image"]');
      if (metaImage) imageUrl = metaImage.getAttribute('content') || '';

      return { priceText, titleText, imageUrl, source: 'dom' };
    });

    const price = productData.source === 'json-ld'
      ? parseFloat(productData.priceText || '0')
      : parsePrice(productData.priceText || '');

    logger.info(`Vijay Sales extracted (${productData.source}): ${productData.titleText} — ₹${price}`);

    return {
      store: Store.VIJAY_SALES,
      productName: productData.titleText || null,
      price,
      image: productData.imageUrl || null,
      url
    };
  } finally {
    await page.close();
  }
};
