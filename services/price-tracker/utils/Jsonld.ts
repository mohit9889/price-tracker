import { Page } from 'playwright';
import { logger } from './logger';

export interface JsonLdProduct {
    title: string | null;
    price: string | null;
    image: string | null;
}

/**
 * Polls for a JSON-LD Product block to appear in the DOM, then extracts it.
 * Handles both SPAs (where JSON-LD is injected after hydration) and SSR pages.
 *
 * Returns null if no JSON-LD Product block is found within the timeout.
 */
export const extractJsonLdProduct = async (
    page: Page,
    timeoutMs = 8000,
): Promise<JsonLdProduct | null> => {
    // Wait until at least one JSON-LD Product block appears — critical for SPAs
    // on slow CI runners where hydration lags behind initial paint.
    await page
        .waitForFunction(() => {
            return [...document.querySelectorAll('script[type="application/ld+json"]')].some(
                (s) => {
                    try {
                        const d = JSON.parse(s.textContent || '');
                        return d['@type'] === 'Product';
                    } catch {
                        return false;
                    }
                },
            );
        }, { timeout: timeoutMs })
        .catch(() => {
            // Not a fatal error — caller will fall through to DOM strategy
            logger.warn('JSON-LD Product block did not appear within timeout');
        });

    return page.evaluate(() => {
        for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
            try {
                const data = JSON.parse(script.textContent || '');
                if (data['@type'] === 'Product' && data.offers) {
                    const offers = Array.isArray(data.offers) ? data.offers[0] : data.offers;
                    return {
                        title: (data.name as string) || null,
                        price: String(offers?.price ?? '') || null,
                        image: Array.isArray(data.image)
                            ? (data.image[0] as string)
                            : ((data.image as string) || null),
                    };
                }
            } catch {
                /* skip malformed blocks */
            }
        }
        return null;
    });
};