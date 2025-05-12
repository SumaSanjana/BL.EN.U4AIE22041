import axios, { AxiosInstance } from 'axios';
import { StockPrice, StockData, CorrelationResponse } from '../types';
import logger from '../utils/logger';

export class StockService {
  private api: AxiosInstance;
  private cache: Map<string, { data: any; expiresAt: number }>;
  private cacheTTL: number = 60 * 1000; // Cache for 1 minute

  constructor() {
    logger.info(`Loading environment variables: TEST_SERVER_URL=${process.env.TEST_SERVER_URL}, ACCESS_TOKEN=${process.env.ACCESS_TOKEN}`);
    if (!process.env.ACCESS_TOKEN) {
      logger.error('ACCESS_TOKEN is not defined in .env');
      throw new Error('ACCESS_TOKEN is not defined in .env');
    }
    this.api = axios.create({
      baseURL: process.env.TEST_SERVER_URL || 'http://20.244.56.144/evaluation-service',
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      },
    });
    this.cache = new Map();
  }

  // Fetch list of valid stocks
  private async getValidStocks(): Promise<{ [name: string]: string }> {
    const cacheKey = 'validStocks';
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      logger.info('Cache hit for valid stocks');
      return cached.data;
    }

    try {
      logger.info('Fetching valid stocks from test server');
      const response = await this.api.get('/stocks');
      const stocks = response.data.stocks;
      if (!stocks || typeof stocks !== 'object') {
        throw new Error('Invalid stocks response format');
      }

      this.cache.set(cacheKey, {
        data: stocks,
        expiresAt: Date.now() + this.cacheTTL,
      });
      logger.info('Valid stocks fetched and cached');
      return stocks;
    } catch (error: any) {
      logger.error(`Error fetching valid stocks: ${error.message}, Status: ${error.response?.status}, Data: ${JSON.stringify(error.response?.data)}`);
      throw new Error('Failed to fetch valid stocks');
    }
  }

  // Fetch price history for a stock
  private async fetchPriceHistory(ticker: string, minutes: number): Promise<StockPrice[]> {
    // Validate ticker
    const validStocks = await this.getValidStocks();
    if (!Object.values(validStocks).includes(ticker)) {
      logger.error(`Invalid ticker: ${ticker}`);
      throw new Error(`Invalid ticker: ${ticker}`);
    }

    const cacheKey = `${ticker}:${minutes}`;
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      logger.info(`Cache hit for ${cacheKey}`);
      return cached.data;
    }

    try {
      logger.info(`Fetching data for ${ticker} with minutes=${minutes}`);
      const response = await this.api.get(`/stocks/${ticker}?minutes=${minutes}`);
      logger.info(`Response for ${ticker}: ${JSON.stringify(response.data)}`);

      let data: StockPrice[];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data?.stock && typeof response.data.stock.price === 'number') {
        data = [response.data.stock];
      } else {
        throw new Error('Unexpected response format from test server');
      }

      // Validate data structure
      if (!data.every(item => typeof item.price === 'number' && typeof item.lastUpdatedAt === 'string')) {
        logger.error(`Invalid data format for ${ticker}: ${JSON.stringify(data)}`);
        throw new Error('Invalid data format from test server');
      }

      this.cache.set(cacheKey, {
        data,
        expiresAt: Date.now() + this.cacheTTL,
      });
      logger.info(`Data cached for ${cacheKey}`);

      return data;
    } catch (error: any) {
      logger.error(`Error fetching price history for ${ticker}: ${error.message}, Status: ${error.response?.status}, Data: ${JSON.stringify(error.response?.data)}`);
      throw new Error(`Failed to fetch data for ${ticker}`);
    }
  }

  // Calculate average price
  private calculateAveragePrice(prices: StockPrice[]): number {
    if (!prices.length) return 0;
    return prices.reduce((sum, { price }) => sum + price, 0) / prices.length;
  }

  // Align timestamps using closest match
  private alignTimestamps(stock1: StockPrice[], stock2: StockPrice[]): [number[], number[]] {
    if (!stock1 || !stock2 || !stock1.length || !stock2.length) {
      throw new Error('Insufficient data for one or both stocks');
    }

    const timestamps1 = stock1.map(({ lastUpdatedAt }) => new Date(lastUpdatedAt).getTime());
    const prices1 = stock1.map(({ price }) => price);
    const prices2: number[] = [];

    // For each timestamp in stock1, find closest price in stock2
    for (const t1 of timestamps1) {
      let closestPrice = stock2[0].price;
      let minDiff = Infinity;

      for (const { price, lastUpdatedAt } of stock2) {
        const t2 = new Date(lastUpdatedAt).getTime();
        const diff = Math.abs(t1 - t2);
        if (diff < minDiff) {
          minDiff = diff;
          closestPrice = price;
        }
      }

      prices2.push(closestPrice);
    }

    if (prices1.length < 2 || prices2.length < 2) {
      throw new Error('Not enough common timestamps for correlation calculation');
    }

    return [prices1, prices2];
  }

  // Calculate Pearson Correlation Coefficient
  private calculateCorrelation(prices1: number[], prices2: number[]): number {
    if (prices1.length !== prices2.length || prices1.length < 2) {
      throw new Error('Insufficient paired data for correlation');
    }

    const n = prices1.length;
    const mean1 = prices1.reduce((sum, p) => sum + p, 0) / n;
    const mean2 = prices2.reduce((sum, p) => sum + p, 0) / n;

    let covariance = 0;
    let variance1 = 0;
    let variance2 = 0;

    for (let i = 0; i < n; i++) {
      const diff1 = prices1[i] - mean1;
      const diff2 = prices2[i] - mean2;
      covariance += diff1 * diff2;
      variance1 += diff1 * diff1;
      variance2 += diff2 * diff2;
    }

    covariance /= n - 1;
    const stdDev1 = Math.sqrt(variance1 / (n - 1));
    const stdDev2 = Math.sqrt(variance2 / (n - 1));

    if (stdDev1 === 0 || stdDev2 === 0) {
      return 0;
    }

    return covariance / (stdDev1 * stdDev2);
  }

  // Get average stock price
  public async getAverageStockPrice(ticker: string, minutes: number): Promise<StockData> {
    const priceHistory = await this.fetchPriceHistory(ticker, minutes);
    return {
      averagePrice: this.calculateAveragePrice(priceHistory),
      priceHistory,
    };
  }

  // Get stock correlation
  public async getStockCorrelation(ticker1: string, ticker2: string, minutes: number): Promise<CorrelationResponse> {
    try {
      const [stock1, stock2] = await Promise.all([
        this.fetchPriceHistory(ticker1, minutes),
        this.fetchPriceHistory(ticker2, minutes),
      ]);

      const [prices1, prices2] = this.alignTimestamps(stock1, stock2);
      const correlation = this.calculateCorrelation(prices1, prices2);

      return {
        correlation,
        stocks: {
          [ticker1]: {
            averagePrice: this.calculateAveragePrice(stock1),
            priceHistory: stock1,
          },
          [ticker2]: {
            averagePrice: this.calculateAveragePrice(stock2),
            priceHistory: stock2,
          },
        },
      };
    } catch (error: any) {
      logger.error(`Error in getStockCorrelation for ${ticker1} and ${ticker2}: ${error.message}, Stack: ${error.stack}`);
      throw error;
    }
  }
}