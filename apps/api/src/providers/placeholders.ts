import type { AnalystDataProvider, Earnings, FundamentalsProvider, MarketDataProvider, NewsProvider, PriceTarget } from "./interfaces.js";
import type { AnalystRating, ConsensusRating, DateRange, Fundamentals, HistoricalPrice, NewsItem, Quote, StockProfile, StockSearchResult } from "@trading-tools/shared";

class UnavailableProvider {
  constructor(public name: string, private reason: string) {}

  protected unavailable(): never {
    throw new Error(`${this.name} is not configured: ${this.reason}`);
  }
}

export class PolygonProvider extends UnavailableProvider implements MarketDataProvider {
  constructor(apiKey?: string) {
    super("polygon", apiKey ? "adapter implementation pending" : "POLYGON_API_KEY missing");
  }
  searchStocks(_query: string): Promise<StockSearchResult[]> { this.unavailable(); }
  getQuote(_ticker: string): Promise<Quote> { this.unavailable(); }
  getHistoricalPrices(_ticker: string, _range: DateRange): Promise<HistoricalPrice[]> { this.unavailable(); }
  getCompanyProfile(_ticker: string): Promise<StockProfile> { this.unavailable(); }
}

export class FinnhubProvider extends UnavailableProvider implements MarketDataProvider, NewsProvider {
  constructor(apiKey?: string) {
    super("finnhub", apiKey ? "adapter implementation pending" : "FINNHUB_API_KEY missing");
  }
  searchStocks(_query: string): Promise<StockSearchResult[]> { this.unavailable(); }
  getQuote(_ticker: string): Promise<Quote> { this.unavailable(); }
  getHistoricalPrices(_ticker: string, _range: DateRange): Promise<HistoricalPrice[]> { this.unavailable(); }
  getCompanyProfile(_ticker: string): Promise<StockProfile> { this.unavailable(); }
  getNews(_ticker: string): Promise<NewsItem[]> { this.unavailable(); }
}

export class TipRanksProvider extends UnavailableProvider implements AnalystDataProvider {
  constructor() { super("tipranks", "requires licensed Nasdaq Data Link or Intrinio feed"); }
  getAnalystRatings(_ticker: string): Promise<AnalystRating[]> { this.unavailable(); }
  getConsensusRating(_ticker: string): Promise<ConsensusRating> { this.unavailable(); }
  getPriceTargets(_ticker: string): Promise<PriceTarget[]> { this.unavailable(); }
}

export class ZacksProvider extends UnavailableProvider implements AnalystDataProvider {
  constructor() { super("zacks", "requires licensed Nasdaq Data Link or Intrinio feed"); }
  getAnalystRatings(_ticker: string): Promise<AnalystRating[]> { this.unavailable(); }
  getConsensusRating(_ticker: string): Promise<ConsensusRating> { this.unavailable(); }
  getPriceTargets(_ticker: string): Promise<PriceTarget[]> { this.unavailable(); }
}

export class FactSetProvider extends UnavailableProvider implements AnalystDataProvider, FundamentalsProvider {
  constructor() { super("factset", "enterprise integration placeholder"); }
  getAnalystRatings(_ticker: string): Promise<AnalystRating[]> { this.unavailable(); }
  getConsensusRating(_ticker: string): Promise<ConsensusRating> { this.unavailable(); }
  getPriceTargets(_ticker: string): Promise<PriceTarget[]> { this.unavailable(); }
  getFundamentals(_ticker: string): Promise<Fundamentals> { this.unavailable(); }
  getEarnings(_ticker: string): Promise<Earnings[]> { this.unavailable(); }
}

export class LsegIbesProvider extends UnavailableProvider implements AnalystDataProvider {
  constructor() { super("lseg-ibes", "enterprise integration placeholder"); }
  getAnalystRatings(_ticker: string): Promise<AnalystRating[]> { this.unavailable(); }
  getConsensusRating(_ticker: string): Promise<ConsensusRating> { this.unavailable(); }
  getPriceTargets(_ticker: string): Promise<PriceTarget[]> { this.unavailable(); }
}
