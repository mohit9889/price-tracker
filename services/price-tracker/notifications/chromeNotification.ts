import { logger } from '../utils/logger';

export const generatePriceDropNotification = (productName: string, store: string, oldPrice: number, newPrice: number) => {
  logger.info(`🚨 NOTIFICATION GENERATED: Price Drop Alert!`);
  logger.info(`Product: ${productName}`);
  logger.info(`Store: ${store}`);
  logger.info(`Old Price: ${oldPrice}, New Price: ${newPrice}`);
  logger.info(`Savings: ${oldPrice - newPrice}`);
};
