import { BrowserContext } from 'playwright';
import { openPage, extractText, extractAttribute } from '../scrapers/playwright';
import { parsePrice } from '../utils/helpers';
import { Store } from '@price-tracker/shared-types';

export const extractApple = async (context: BrowserContext, url: string) => {
  const page = await openPage(context, url);
  try {
    const title = await extractText(page, 'h1, .as-producttile-title'); // Apple uses dynamic classes, h1 usually has title
    const priceStr = await extractText(page, '.as-price-currentprice, .rc-prices-fullprice');
    const image = await extractAttribute(page, '.as-images-image, .rc-images-image, .as-l-container-image img', 'src');

    return {
      store: Store.APPLE,
      productName: title || 'Apple Product', // Fallback
      price: parsePrice(priceStr || ''),
      image,
      url
    };
  } finally {
    await page.close();
  }
};
