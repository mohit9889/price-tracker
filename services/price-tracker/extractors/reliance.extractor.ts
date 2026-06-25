import { BrowserContext } from 'playwright';
import { openPage, extractText, extractAttribute } from '../scrapers/playwright';
import { parsePrice } from '../utils/helpers';
import { Store } from '@price-tracker/shared-types';

export const extractReliance = async (context: BrowserContext, url: string) => {
  const page = await openPage(context, url);
  try {
    const title = await extractText(page, 'h1.pdp__title');
    const priceStr = await extractText(page, '.pdp__offerPrice');
    const image = await extractAttribute(page, '.pdp__imageSlider img', 'src'); // or data-srcset

    return {
      store: Store.RELIANCE,
      productName: title,
      price: parsePrice(priceStr || ''),
      image,
      url
    };
  } finally {
    await page.close();
  }
};
