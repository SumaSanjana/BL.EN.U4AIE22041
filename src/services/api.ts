import axios from 'axios';
import { AverageStockResponse, CorrelationResponse, Stock } from '../types';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

export const getStocks = async (): Promise<Stock[]> => {
  // Mocked response since we can't call test server directly
  return [
    { name: 'Nvidia Corporation', ticker: 'NVDA' },
    { name: 'PayPal Holdings, Inc.', ticker: 'PYPL' },
    { name: 'Apple Inc.', ticker: 'AAPL' },
    // Add more stocks as needed
  ];
};

export const getAverageStockPrice = async (
  ticker: string,
  minutes: number
): Promise<AverageStockResponse> => {
  const response = await api.get(`/stocks/${ticker}?minutes=${minutes}&aggregation=average`);
  return response.data;
};

export const getStockCorrelation = async (
  ticker1: string,
  ticker2: string,
  minutes: number
): Promise<CorrelationResponse> => {
  const response = await api.get(
    `/stockcorrelation?minutes=${minutes}&ticker=${ticker1}&ticker=${ticker2}`
  );
  return response.data;
};