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
      // @todo Wire up to the scraper service when it exposes a trigger interface.
      // Returning 501 until this is implemented — never return 2xx for a no-op.
      res.status(501).json({ success: false, message: 'Price refresh not yet implemented' });
    } catch (error) {
      next(error);
    }
  };
}

export const pricesController = new PricesController();
