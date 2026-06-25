import { BrowserContext } from 'playwright';
import { openPage, extractText, extractAttribute } from '../scrapers/playwright';
import { parsePrice } from '../utils/helpers';
import { Store } from '@price-tracker/shared-types';

export const extractVijaySales = async (context: BrowserContext, url: string) => {
  const page = await openPage(context, url);
  try {
    const title = await extractText(page, 'h1.ProductTitle');
    const priceStr = await extractText(page, 'span.ProductPrice');
    const image = await extractAttribute(page, '#ProductImage', 'src');

    return {
      store: Store.VIJAY_SALES,
      productName: title,
      price: parsePrice(priceStr || ''),
      image,
      url
    };
  } finally {
    await page.close();
  }
};
