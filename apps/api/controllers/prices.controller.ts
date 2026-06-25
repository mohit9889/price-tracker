import { Request, Response, NextFunction } from 'express';
import { priceService } from '../services/price.service';

export class PricesController {
  getHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const history = await priceService.getPriceHistory(req.params.productId);
      res.json(history);
    } catch (error) {
      next(error);
    }
  };

  refreshPrices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // In a real scenario, this would trigger the scraper service for this product.
      // For MVP, we might just return an accepted status or simulate it.
      // This is a placeholder since the scraper runs independently.
      res.status(202).json({ message: 'Price refresh triggered' });
    } catch (error) {
      next(error);
    }
  };
}

export const pricesController = new PricesController();
