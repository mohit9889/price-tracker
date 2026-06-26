import { BrowserContext } from 'playwright';
import { openPage } from '../scrapers/playwright';
import { parsePrice } from '../utils/helpers';
import { Store } from '@price-tracker/shared-types';
import { logger } from '../utils/logger';
import { ExtractedProductData } from '.';
import { extractJsonLdProduct } from '../utils/Jsonld';

// Vijay Sales is server-side rendered. The selling price is labelled "VSP ₹N"
// and the MRP is labelled "MRP ₹N". We must prefer VSP to avoid returning the
// higher crossed-out price. JSON-LD is also present and preferred when available.

export const extractVijaySales = async (
  context: BrowserContext,
  url: string,
): Promise<ExtractedProductData> => {
  const page = await openPage(context, url);
  try {
    // Wait for the page to settle — Vijay Sales does some client-side hydration
    // even though it's mostly SSR. We wait for an h1 rather than networkidle
    // to avoid an indefinite wait on CI.
    await page
      .waitForSelector('h1, meta[property="og:title"]', { timeout: 10000 })
      .catch(() => logger.warn('Vijay Sales: page anchor not found within timeout'));

    // Strategy 1: JSON-LD (preferred — gives exact selling price without ambiguity)
    const jsonLd = await extractJsonLdProduct(page, 5000);

    if (jsonLd?.price) {
      const price = parseFloat(jsonLd.price || '0');
      logger.info(`Vijay Sales JSON-LD extracted: "${jsonLd.title}" — ₹${price}`);
      return {
        store: Store.VIJAY_SALES,
        productName: jsonLd.title,
        price,
        image: jsonLd.image,
        url,
      };
    }

    // Strategy 2: DOM scan — explicitly prefer the VSP (selling price) label
    // over MRP to avoid returning the crossed-out higher price.
    logger.warn('Vijay Sales JSON-LD not found, trying DOM scan...');

    const productData = await page.evaluate(() => {
      let priceText = '';
      let titleText = '';
      let imageUrl = '';

      const allElements = [...document.querySelectorAll('*')];

      // Pass 1: look for a "VSP ₹NNNN" label — the actual selling price
      for (const el of allElements) {
        if (el.children.length > 0) continue; // leaf nodes only
        const text = (el as HTMLElement).innerText?.trim() || '';
        const vspMatch = text.match(/VSP\s*₹\s*([\d,]+)/i);
        if (vspMatch) {
          priceText = vspMatch[1];
          break;
        }
      }

      // Pass 2: any standalone ₹NNNN (at least 4 digits) if VSP not found
      if (!priceText) {
        for (const el of allElements) {
          if (el.children.length > 0) continue;
          const text = (el as HTMLElement).innerText?.trim() || '';
          // Exclude MRP lines explicitly
          if (/MRP/i.test(text)) continue;
          const match = text.match(/^₹\s*([\d,]+)$/);
          if (match && match[1].replace(/,/g, '').length >= 4) {
            priceText = match[1];
            break;
          }
        }
      }

      // Title: og:title meta → page <title> tag
      const metaTitle = document.querySelector('meta[property="og:title"]');
      titleText =
        metaTitle?.getAttribute('content') ||
        document.title.split('|')[0].trim();

      // Image: og:image meta
      const metaImage = document.querySelector('meta[property="og:image"]');
      imageUrl = metaImage?.getAttribute('content') || '';

      return { priceText, titleText, imageUrl };
    });

    const price = parsePrice(productData.priceText);

    if (price > 0) {
      logger.info(`Vijay Sales DOM extracted: "${productData.titleText}" — ₹${price}`);
    } else {
      logger.warn(`Vijay Sales extraction yielded no price for: ${url}`);
    }

    return {
      store: Store.VIJAY_SALES,
      productName: productData.titleText || null,
      price,
      image: productData.imageUrl || null,
      url,
    };
  } finally {
    await page.close();
  }
};