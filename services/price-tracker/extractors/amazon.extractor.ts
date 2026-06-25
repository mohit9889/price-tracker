import { BrowserContext } from 'playwright';
import { openPage, extractText, extractAttribute } from '../scrapers/playwright';
import { parsePrice } from '../utils/helpers';
import { Store } from '@price-tracker/shared-types';

export const extractAmazon = async (context: BrowserContext, url: string) => {
  const page = await openPage(context, url);
  try {
    const title = await extractText(page, '#productTitle');
    const priceStr = await extractText(page, '.a-price-whole');
    const image = await extractAttribute(page, '#landingImage', 'src');

    return {
      store: Store.AMAZON,
      productName: title,
      price: parsePrice(priceStr || ''),
      image,
      url
    };
  } finally {
    await page.close();
  }
};
