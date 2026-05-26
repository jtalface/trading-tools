import type { AnalystDataProvider, Earnings, FundamentalsProvider, MarketDataProvider, NewsProvider, PriceTarget } from "./interfaces.js";
import type {
  AnalystRating,
  ConsensusRating,
  DateRange,
  Fundamentals,
  HistoricalPrice,
  NewsItem,
  Quote,
  StockProfile,
  StockSearchResult
} from "@trading-tools/shared";

export class ProviderConfigurationError extends Error {
  statusCode = 503;

  constructor(providerName: string, reason: string) {
    super(`${providerName} provider is not configured: ${reason}`);
    this.name = "ProviderConfigurationError";
  }
}

export class UnavailableProvider implements MarketDataProvider, AnalystDataProvider, FundamentalsProvider, NewsProvider {
  constructor(public name: string, private reason: string) {}

  private unavailable(): never {
    throw new ProviderConfigurationError(this.name, this.reason);
  }

  async searchStocks(_query: string): Promise<StockSearchResult[]> { this.unavailable(); }
  async getQuote(_ticker: string): Promise<Quote> { this.unavailable(); }
  async getHistoricalPrices(_ticker: string, _range: DateRange): Promise<HistoricalPrice[]> { this.unavailable(); }
  async getCompanyProfile(_ticker: string): Promise<StockProfile> { this.unavailable(); }
  async getAnalystRatings(_ticker: string): Promise<AnalystRating[]> { this.unavailable(); }
  async getConsensusRating(_ticker: string): Promise<ConsensusRating> { this.unavailable(); }
  async getPriceTargets(_ticker: string): Promise<PriceTarget[]> { this.unavailable(); }
  async getFundamentals(_ticker: string): Promise<Fundamentals> { this.unavailable(); }
  async getEarnings(_ticker: string): Promise<Earnings[]> { this.unavailable(); }
  async getNews(_ticker: string): Promise<NewsItem[]> { this.unavailable(); }
}
