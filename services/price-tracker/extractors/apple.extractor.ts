import { BrowserContext } from 'playwright';
import { openPage, extractText, extractAttribute } from '../scrapers/playwright';
import { parsePrice } from '../utils/helpers';
import { Store } from '@price-tracker/shared-types';
import { logger } from '../utils/logger';

export const extractApple = async (context: BrowserContext, url: string) => {
  const page = await openPage(context, url);
  try {
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

      // Fallback
      return { priceText: '', titleText: '', imageUrl: '', source: 'none' };
    });

    let title = productData.titleText;
    let priceStr = productData.priceText;
    let image = productData.imageUrl;

    if (productData.source === 'none') {
      logger.warn('Apple JSON-LD not found, trying DOM selectors...');
      title = await extractText(page, 'h1, .as-producttile-title') || '';
      priceStr = await extractText(page, '.as-price-currentprice, .rc-prices-fullprice') || '';
      image = await extractAttribute(page, '.as-images-image, .rc-images-image, .as-l-container-image img', 'src') || '';
    } else {
      logger.info(`Apple JSON-LD extracted: ${title} — ₹${priceStr}`);
    }

    const finalPrice = productData.source === 'json-ld' 
      ? parseFloat(priceStr || '0') 
      : parsePrice(priceStr || '');

    return {
      store: Store.APPLE,
      productName: title || 'Apple Product',
      price: finalPrice,
      image,
      url
    };
  } finally {
    await page.close();
  }
};
