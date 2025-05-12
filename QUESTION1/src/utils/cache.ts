interface StockPrice {
  price: number;
  lastUpdatedAt: string;
}

export class StockCache {
  private cache: Map<string, StockPrice[]> = new Map();
  private readonly ttl: number = 5 * 60 * 1000; // 5 minutes TTL

  get(ticker: string): StockPrice[] | undefined {
    const data = this.cache.get(ticker);
    if (!data) return undefined;

    // Remove expired entries
    const now = Date.now();
    const validData = data.filter(
      (entry) => new Date(entry.lastUpdatedAt).getTime() > now - this.ttl
    );

    if (validData.length === 0) {
      this.cache.delete(ticker);
      return undefined;
    }

    return validData;
  }

  set(ticker: string, prices: StockPrice[]): void {
    this.cache.set(ticker, prices);
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [ticker, prices] of this.cache.entries()) {
      const validPrices = prices.filter(
        (entry) => new Date(entry.lastUpdatedAt).getTime() > now - this.ttl
      );
      if (validPrices.length === 0) {
        this.cache.delete(ticker);
      } else {
        this.cache.set(ticker, validPrices);
      }
    }
  }
}

export const stockCache = new StockCache();