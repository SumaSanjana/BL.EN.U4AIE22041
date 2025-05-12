export interface StockPrice {
  price: number;
  lastUpdatedAt: string;
}

export interface StockData {
  averagePrice: number;
  priceHistory: StockPrice[];
}

export interface CorrelationResponse {
  correlation: number;
  stocks: {
    [ticker: string]: StockData;
  };
}