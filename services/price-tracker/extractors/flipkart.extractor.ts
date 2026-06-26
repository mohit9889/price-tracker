import { BrowserContext } from 'playwright';
import { openPage } from '../scrapers/playwright';
import { parsePrice } from '../utils/helpers';
import { Store } from '@price-tracker/shared-types';
import { logger } from '../utils/logger';
import { ExtractedProductData } from '.';
import { extractJsonLdProduct } from '../utils/Jsonld';

// Flipkart is a React SPA with heavily obfuscated, hash-based CSS class names
// that rotate with every deployment. Class-name selectors are therefore useless.
// We rely on JSON-LD first, then structured DOM scanning as a fallback.

export const extractFlipkart = async (
  context: BrowserContext,
  url: string,
): Promise<ExtractedProductData> => {
  const page = await openPage(context, url);
  try {
    // Strategy 1: JSON-LD — poll until it appears (SPA injects it after hydration)
    const jsonLd = await extractJsonLdProduct(page, 12000);

    if (jsonLd?.price) {
      const price = parseFloat(jsonLd.price || '0');
      logger.info(`Flipkart JSON-LD extracted: "${jsonLd.title}" — ₹${price}`);
      return {
        store: Store.FLIPKART,
        productName: jsonLd.title,
        price,
        image: jsonLd.image,
        url,
      };
    }

    // Strategy 2: DOM scan — Flipkart's SPA may still be hydrating.
    // Wait for an h1 (product title) to appear before scanning.
    logger.warn('Flipkart JSON-LD not found, trying DOM scan...');
    await page
      .waitForSelector('h1', { timeout: 12000 })
      .catch(() => logger.warn('Flipkart: h1 not found within timeout'));

    const priceData = await page.evaluate(() => {
      let priceText = '';
      let titleText = '';
      let imageUrl = '';

      // Price: scan leaf-level elements for the ₹N,NNN pattern.
      // Leaf elements avoid matching parent containers that aggregate multiple
      // price strings (e.g. "₹1,000 ₹900 10% off").
      const allElements = [...document.querySelectorAll('*')];
      for (const el of allElements) {
        // Skip elements that have child elements — we only want text leaves
        if (el.children.length > 0) continue;
        const text = (el as HTMLElement).innerText?.trim() || '';
        if (!priceText && /^₹[\d,]+$/.test(text) && text.replace(/[₹,]/g, '').length >= 3) {
          priceText = text;
        }
      }

      // Title: prefer h1, fall back to <title> tag
      const h1 = document.querySelector('h1');
      titleText = h1?.innerText?.trim() || document.title.split('-')[0].trim();

      // Image: og:image meta tag is reliable on Flipkart
      const metaImage = document.querySelector('meta[property="og:image"]');
      imageUrl = metaImage?.getAttribute('content') || '';

      return { priceText, titleText, imageUrl };
    });

    const price = parsePrice(priceData.priceText);

    if (price > 0) {
      logger.info(`Flipkart DOM extracted: "${priceData.titleText}" — ₹${price}`);
    } else {
      logger.warn(`Flipkart extraction yielded no price for: ${url}`);
    }

    return {
      store: Store.FLIPKART,
      productName: priceData.titleText || null,
      price,
      image: priceData.imageUrl || null,
      url,
    };
  } finally {
    await page.close();
  }
};