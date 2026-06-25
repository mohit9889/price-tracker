import { Router } from 'express';
import { pricesController } from '../controllers/prices.controller';

const router = Router();

router.get('/history/:productId', pricesController.getHistory);
router.post('/refresh/:productId', pricesController.refreshPrices);

export default router;
