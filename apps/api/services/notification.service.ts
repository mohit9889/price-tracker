export class NotificationService {
  async notifyPriceDrop(productId: string, oldPrice: number, newPrice: number) {
    console.log(`🔔 PRICE DROP: Product ${productId} dropped from ${oldPrice} to ${newPrice}`);
  }
}

export const notificationService = new NotificationService();
