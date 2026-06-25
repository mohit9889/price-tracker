import { BrowserContext } from 'playwright';
import { openPage, extractText, extractAttribute } from '../scrapers/playwright';
import { parsePrice } from '../utils/helpers';
import { Store } from '@price-tracker/shared-types';

export const extractFlipkart = async (context: BrowserContext, url: string) => {
  const page = await openPage(context, url);
  try {
    const title = await extractText(page, '.B_NuCI, .VU-Tz5'); // Flipkart changes classes often
    const priceStr = await extractText(page, '._30jeq3._16Jk6d, .Nx9bqj.CxhGGd');
    const image = await extractAttribute(page, '._396cs4, ._396cs4._2amPTt', 'src');

    return {
      store: Store.FLIPKART,
      productName: title,
      price: parsePrice(priceStr || ''),
      image,
      url
    };
  } finally {
    await page.close();
  }
};
