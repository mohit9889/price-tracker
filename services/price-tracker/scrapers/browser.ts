import { chromium, Browser, BrowserContext } from 'playwright';
import { logger } from '../utils/logger';

let browserInstance: Browser | null = null;
let contextInstance: BrowserContext | null = null;

export const getBrowserContext = async (): Promise<BrowserContext> => {
  if (!browserInstance) {
    logger.info('Launching Chromium browser...');
    browserInstance = await chromium.launch({ headless: true });
    contextInstance = await browserInstance.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
  }
  if (!contextInstance) {
    throw new Error('Browser context failed to initialise — contextInstance is null after launch');
  }
  return contextInstance;
};

export const closeBrowser = async () => {
  if (browserInstance) {
    logger.info('Closing browser...');
    await browserInstance.close();
    browserInstance = null;
    contextInstance = null;
  }
};
