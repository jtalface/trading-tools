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

export interface PriceTarget {
  firmName: string;
  target: number;
  date: string;
  currency?: string;
}

export interface Earnings {
  ticker: string;
  date: string;
  epsActual?: number;
  epsEstimate?: number;
  revenueActual?: number;
  revenueEstimate?: number;
}

export interface MarketDataProvider {
  name: string;
  searchStocks(query: string): Promise<StockSearchResult[]>;
  getQuote(ticker: string): Promise<Quote>;
  getHistoricalPrices(ticker: string, range: DateRange): Promise<HistoricalPrice[]>;
  getCompanyProfile(ticker: string): Promise<StockProfile>;
}

export interface AnalystDataProvider {
  name: string;
  getAnalystRatings(ticker: string): Promise<AnalystRating[]>;
  getConsensusRating(ticker: string): Promise<ConsensusRating>;
  getPriceTargets(ticker: string): Promise<PriceTarget[]>;
}

export interface FundamentalsProvider {
  name: string;
  getFundamentals(ticker: string): Promise<Fundamentals>;
  getEarnings(ticker: string): Promise<Earnings[]>;
}

export interface NewsProvider {
  name: string;
  getNews(ticker: string): Promise<NewsItem[]>;
}
