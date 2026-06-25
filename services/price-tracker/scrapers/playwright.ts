import { Page, BrowserContext } from 'playwright';
import { logger } from '../utils/logger';

/**
 * Navigate to a URL and return the page.
 * Throws if navigation fails — callers must not continue scraping a broken page.
 */
export const openPage = async (context: BrowserContext, url: string): Promise<Page> => {
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (error) {
    logger.error(`Navigation failed for ${url}:`, error);
    await page.close();
    throw error; // Re-throw — a failed navigation must not produce a price of 0
  }
  return page;
};

/** Extract the trimmed inner text of the first element matching `selector`. */
export const extractText = async (page: Page, selector: string): Promise<string | null> => {
  try {
    await page.waitForSelector(selector, { timeout: 10000 });
    const text = await page.locator(selector).first().innerText();
    return text.trim();
  } catch {
    logger.warn(`Could not extract text for selector: ${selector}`);
    return null;
  }
};

/** Extract a trimmed attribute value from the first element matching `selector`. */
export const extractAttribute = async (
  page: Page,
  selector: string,
  attribute: string,
): Promise<string | null> => {
  try {
    await page.waitForSelector(selector, { timeout: 10000 });
    const value = await page.locator(selector).first().getAttribute(attribute);
    return value ? value.trim() : null;
  } catch {
    logger.warn(`Could not extract attribute "${attribute}" for selector: ${selector}`);
    return null;
  }
};
