import { Page, BrowserContext } from 'playwright';
import { logger } from '../utils/logger';

export const openPage = async (context: BrowserContext, url: string): Promise<Page> => {
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (error) {
    logger.error(`Error navigating to ${url}:`, error);
  }
  return page;
};

export const extractText = async (page: Page, selector: string): Promise<string | null> => {
  try {
    await page.waitForSelector(selector, { timeout: 10000 });
    const text = await page.locator(selector).first().innerText();
    return text.trim();
  } catch (error) {
    logger.warn(`Could not extract text for selector ${selector}`);
    return null;
  }
};

export const extractAttribute = async (page: Page, selector: string, attribute: string): Promise<string | null> => {
  try {
    await page.waitForSelector(selector, { timeout: 10000 });
    const value = await page.locator(selector).first().getAttribute(attribute);
    return value ? value.trim() : null;
  } catch (error) {
    logger.warn(`Could not extract attribute ${attribute} for selector ${selector}`);
    return null;
  }
};
