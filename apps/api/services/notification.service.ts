export class NotificationService {
  /**
   * Notify a user that a tracked product has dropped in price.
   *
   * @todo Replace console.log with a real delivery mechanism (email, push
   * notification, or webhook). Inject a transport interface so the delivery
   * channel can be swapped without modifying this class.
   */
  async notifyPriceDrop(productId: string, oldPrice: number, newPrice: number) {
    console.log(`🔔 PRICE DROP: Product ${productId} dropped from ${oldPrice} to ${newPrice}`);
  }
}

export const notificationService = new NotificationService();
