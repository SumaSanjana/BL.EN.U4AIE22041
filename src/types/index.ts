export interface StockPrice {
  price: number;
  lastUpdatedAt: string;
}

export interface AverageStockResponse {
  averageStockPrice: number;
  priceHistory: StockPrice[];
}

export interface CorrelationResponse {
  correlation: number;
  stocks: {
    [ticker: string]: {
      averagePrice: number;
      priceHistory: StockPrice[];
    };
  };
}

export interface Stock {
  name: string;
  ticker: string;
}