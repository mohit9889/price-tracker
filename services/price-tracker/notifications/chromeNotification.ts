import { logger } from '../utils/logger';

/**
 * Log a price-drop event on the server side.
 *
 * @note This runs inside a Node.js process and has NO access to the
 * `chrome.notifications` API. The name "chromeNotification" is misleading —
 * this is purely a server-side log entry.
 *
 * @todo To actually notify the browser extension:
 *  1. Expose a WebSocket or Server-Sent Events (SSE) endpoint from apps/api.
 *  2. Have the extension subscribe to that stream.
 *  3. Call that endpoint here instead of (or in addition to) logging.
 */
export const logPriceDrop = (
  productName: string,
  store: string,
  oldPrice: number,
  newPrice: number,
): void => {
  logger.info(`🚨 PRICE DROP ALERT`);
  logger.info(`  Product : ${productName}`);
  logger.info(`  Store   : ${store}`);
  logger.info(`  Price   : ₹${oldPrice} → ₹${newPrice} (saved ₹${oldPrice - newPrice})`);
};

/** @deprecated Use {@link logPriceDrop} — kept temporarily for backwards compatibility. */
export const generatePriceDropNotification = logPriceDrop;
