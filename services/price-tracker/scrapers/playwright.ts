import { Page, BrowserContext } from 'playwright';
import { logger } from '../utils/logger';

// ---------------------------------------------------------------------------
// Stealth headers applied to every page before navigation.
// These make headless Chromium look like a real Chrome 136 on Windows 10,
// which is enough to pass most passive bot-detection checks (User-Agent
// sniffing, Accept-Language checks, sec-ch-ua header validation).
//
// They do NOT defeat active JS-based fingerprinting (canvas, WebGL, etc.).
// If sites start actively fingerprinting, add playwright-extra + stealth plugin:
//   npm install playwright-extra puppeteer-extra-plugin-stealth
// ---------------------------------------------------------------------------
const STEALTH_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
  'Accept':
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-IN,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'sec-ch-ua': '"Chromium";v="136", "Google Chrome";v="136", "Not-A.Brand";v="99"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'Upgrade-Insecure-Requests': '1',
  'Cache-Control': 'max-age=0',
};

// ---------------------------------------------------------------------------
// How long extractText / extractAttribute will wait for a selector to appear.
// Kept deliberately short so that when a site serves a bot-wall page the
// fallback selectors fail fast (< 3 s each) rather than burning 10 s each.
// ---------------------------------------------------------------------------
const SELECTOR_TIMEOUT_MS = 3000;

// ---------------------------------------------------------------------------
// openPage
// ---------------------------------------------------------------------------

/**
 * Open a new page in the given context, inject stealth headers, and navigate
 * to `url`. Throws if navigation fails — callers must not continue scraping
 * a broken page.
 */
export const openPage = async (context: BrowserContext, url: string): Promise<Page> => {
  const page = await context.newPage();

  // Apply stealth headers before the first request so the very first HTTP
  // round-trip already carries them (route intercept fires pre-navigation).
  await page.setExtraHTTPHeaders(STEALTH_HEADERS);

  // Mask the headless flag exposed by navigator.webdriver
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  try {
    // Wait only for the network response headers (commit) rather than the entire
    // DOM to parse. E-commerce sites have heavy analytics that often prevent
    // domcontentloaded from firing on cloud servers, causing 30s timeouts.
    await page.goto(url, { waitUntil: 'commit', timeout: 30000 });
  } catch (error) {
    logger.error(`Navigation failed for ${url}:`, error);
    await page.close();
    throw error; // Re-throw — a failed navigation must not silently produce price 0
  }

  return page;
};

// ---------------------------------------------------------------------------
// extractText
// ---------------------------------------------------------------------------

/**
 * Extract the trimmed inner text of the first element matching `selector`.
 *
 * Waits up to SELECTOR_TIMEOUT_MS for the element to appear — short enough
 * that chains of fallback selectors fail quickly on bot-wall pages instead
 * of accumulating 10 s × N selectors of wasted time.
 */
export const extractText = async (page: Page, selector: string): Promise<string | null> => {
  try {
    await page.waitForSelector(selector, { timeout: SELECTOR_TIMEOUT_MS });
    const text = await page.locator(selector).first().innerText();
    return text.trim() || null;
  } catch {
    logger.warn(`Could not extract text for selector: ${selector}`);
    return null;
  }
};

// ---------------------------------------------------------------------------
// extractAttribute
// ---------------------------------------------------------------------------

/**
 * Extract a trimmed attribute value from the first element matching `selector`.
 *
 * Same short timeout rationale as extractText.
 */
export const extractAttribute = async (
  page: Page,
  selector: string,
  attribute: string,
): Promise<string | null> => {
  try {
    await page.waitForSelector(selector, { timeout: SELECTOR_TIMEOUT_MS });
    const value = await page.locator(selector).first().getAttribute(attribute);
    return value ? value.trim() : null;
  } catch {
    logger.warn(`Could not extract attribute "${attribute}" for selector: ${selector}`);
    return null;
  }
};

// ---------------------------------------------------------------------------
// extractFirstText
// ---------------------------------------------------------------------------

/**
 * Try a list of selectors in parallel and return the first non-empty inner
 * text found, or null if none match within the timeout.
 *
 * Use this instead of calling extractText in a for-loop — it races all
 * selectors concurrently so the total wait is one timeout, not N × timeout.
 *
 * @example
 * const title = await extractFirstText(page, ['h1.pd-title', 'h1[class*="title"]', 'h1']);
 */
export const extractFirstText = async (
  page: Page,
  selectors: string[],
  timeoutMs = SELECTOR_TIMEOUT_MS,
): Promise<string | null> => {
  const results = await Promise.allSettled(
    selectors.map(async (sel) => {
      await page.waitForSelector(sel, { timeout: timeoutMs });
      const text = await page.locator(sel).first().innerText();
      const trimmed = text.trim();
      if (!trimmed) throw new Error('empty');
      return trimmed;
    }),
  );

  for (const result of results) {
    if (result.status === 'fulfilled') return result.value;
  }

  logger.warn(`Could not extract text for any of: ${selectors.join(', ')}`);
  return null;
};

// ---------------------------------------------------------------------------
// extractFirstAttribute
// ---------------------------------------------------------------------------

/**
 * Try a list of selectors in parallel and return the first non-empty attribute
 * value found, or null if none match within the timeout.
 *
 * Same parallel-race rationale as extractFirstText.
 *
 * @example
 * const image = await extractFirstAttribute(page, ['#landingImage', '#imgBlkFront'], 'src');
 */
export const extractFirstAttribute = async (
  page: Page,
  selectors: string[],
  attribute: string,
  timeoutMs = SELECTOR_TIMEOUT_MS,
): Promise<string | null> => {
  const results = await Promise.allSettled(
    selectors.map(async (sel) => {
      await page.waitForSelector(sel, { timeout: timeoutMs });
      const value = await page.locator(sel).first().getAttribute(attribute);
      const trimmed = value?.trim();
      if (!trimmed) throw new Error('empty');
      return trimmed;
    }),
  );

  for (const result of results) {
    if (result.status === 'fulfilled') return result.value;
  }

  logger.warn(`Could not extract attribute "${attribute}" for any of: ${selectors.join(', ')}`);
  return null;
};