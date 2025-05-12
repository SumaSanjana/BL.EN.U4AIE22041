import { Router } from 'express';
import { getAverageStockPrice, getStockCorrelation } from '../controllers/stockController';

const router = Router();

// Route to get the average stock price for a specific ticker
router.get('/stocks/:ticker', getAverageStockPrice);

// Route to get the correlation between two stocks
router.get('/stockcorrelation', getStockCorrelation);

export default router;