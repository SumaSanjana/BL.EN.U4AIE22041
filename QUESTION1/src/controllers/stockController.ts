import { Request, Response, RequestHandler } from 'express';
import { StockService } from '../services/stockService';
import logger from '../utils/logger';

const stockService = new StockService();

export const getAverageStockPrice: RequestHandler = async (req, res) => {
  try {
    const { ticker } = req.params;
    const minutes = parseInt(req.query.minutes as string, 10);
    if (isNaN(minutes) || minutes <= 0) {
      logger.error(`Invalid minutes parameter for ticker ${ticker}: ${req.query.minutes}`);
      return res.status(400).json({ error: 'Invalid minutes parameter' });
    }

    const result = await stockService.getAverageStockPrice(ticker, minutes);
    res.json(result);
  } catch (error: any) {
    logger.error(`Error in getAverageStockPrice: ${error.message}, Stack: ${error.stack}`);
    res.status(500).json({ error: error.message });
  }
};

export const getStockCorrelation: RequestHandler = async (req, res) => {
  try {
    const { ticker: tickers, minutes: minutesStr } = req.query;
    logger.info(`Received stock correlation request: minutes=${minutesStr}, tickers=${tickers}`);

    // Validate minutes
    if (!minutesStr || typeof minutesStr !== 'string') {
      logger.error(`Minutes parameter missing or invalid: ${minutesStr}`);
      return res.status(400).json({ error: 'Minutes parameter is required and must be a string' });
    }
    const minutes = parseInt(minutesStr, 10);
    if (isNaN(minutes) || minutes <= 0) {
      logger.error(`Invalid minutes parameter: ${minutesStr}`);
      return res.status(400).json({ error: 'Invalid minutes parameter' });
    }

    // Validate tickers
    if (!tickers || (Array.isArray(tickers) && tickers.length !== 2)) {
      logger.error(`Invalid tickers parameter: ${tickers}`);
      return res.status(400).json({ error: 'Exactly two tickers are required' });
    }

    const tickerArray = Array.isArray(tickers) ? tickers : [tickers];
    if (tickerArray.length !== 2) {
      logger.error(`Invalid tickers count: ${tickerArray}`);
      return res.status(400).json({ error: 'Exactly two tickers are required' });
    }

    const [ticker1, ticker2] = tickerArray;
    if (typeof ticker1 !== 'string' || typeof ticker2 !== 'string') {
      logger.error(`Invalid ticker format: ticker1=${ticker1}, ticker2=${ticker2}`);
      return res.status(400).json({ error: 'Invalid ticker format' });
    }

    // Fetch correlation data
    const result = await stockService.getStockCorrelation(ticker1, ticker2, minutes);
    res.json(result);
  } catch (error: any) {
    logger.error(`Error in getStockCorrelation: ${error.message}, Stack: ${error.stack}`);
    const status = error.message.includes('Invalid ticker') ? 400 : 500;
    res.status(status).json({ error: error.message });
  }
};