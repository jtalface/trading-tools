export type SourceCategory = "SELL_SIDE" | "INDEPENDENT" | "AGGREGATOR";

export type NormalizedRating = "STRONG_BUY" | "BUY" | "HOLD" | "SELL" | "STRONG_SELL";

export type RatingActionType =
  | "INITIATED"
  | "UPGRADED"
  | "DOWNGRADED"
  | "MAINTAINED"
  | "REITERATED"
  | "RESUMED";

export type AlertType =
  | "PRICE_ABOVE"
  | "PRICE_BELOW"
  | "RATING_CHANGE"
  | "PRICE_TARGET_CHANGE"
  | "NEWS_SENTIMENT"
  | "VOLUME_SPIKE"
  | "EARNINGS_DATE";

export interface DateRange {
  from: string;
  to: string;
  interval?: "1d" | "1h" | "15m" | "5m";
}

export interface StockSearchResult {
  ticker: string;
  companyName: string;
  exchange?: string;
  currency?: string;
}

export interface StockProfile extends StockSearchResult {
  sector?: string;
  industry?: string;
  country?: string;
  marketCap?: number;
  cik?: string;
  figi?: string;
  isin?: string;
}

export interface Quote {
  ticker: string;
  price: number;
  previousClose: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
  change: number;
  changePercent: number;
  timestamp: string;
  provider: string;
}

export interface HistoricalPrice {
  ticker: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjustedClose?: number;
  volume: number;
  provider: string;
}

export interface AnalystFirm {
  id?: string;
  name: string;
  category: SourceCategory;
  description?: string;
  website?: string;
}

export interface AnalystRating {
  id?: string;
  ticker: string;
  firmName: string;
  firmCategory: SourceCategory;
  analystName?: string;
  actionType: RatingActionType;
  originalRating: string;
  normalizedRating: NormalizedRating;
  previousRating?: string;
  priceTarget?: number;
  previousPriceTarget?: number;
  currency?: string;
  ratingDate: string;
  sourceProvider: string;
  sourceUrl?: string;
  confidenceScore?: number;
}

export interface ConsensusRating {
  ticker: string;
  strongBuyCount: number;
  buyCount: number;
  holdCount: number;
  sellCount: number;
  strongSellCount: number;
  consensusLabel: NormalizedRating | "MIXED";
  averagePriceTarget?: number;
  medianPriceTarget?: number;
  highPriceTarget?: number;
  lowPriceTarget?: number;
  numberOfAnalysts: number;
  upsidePercent?: number;
  asOfDate: string;
  provider: string;
}

export interface Fundamentals {
  ticker: string;
  revenue?: number;
  grossMargin?: number;
  operatingMargin?: number;
  netIncome?: number;
  eps?: number;
  peRatio?: number;
  forwardPe?: number;
  pegRatio?: number;
  priceToSales?: number;
  priceToBook?: number;
  debtToEquity?: number;
  freeCashFlow?: number;
  dividendYield?: number;
  fiscalPeriod?: string;
  fiscalYear?: number;
  provider: string;
}

export interface NewsItem {
  id?: string;
  ticker: string;
  title: string;
  summary?: string;
  url: string;
  source: string;
  sentiment?: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  publishedAt: string;
  provider: string;
}

export interface HoldingInput {
  ticker: string;
  companyName?: string;
  quantity: number;
  averageCost: number;
  purchaseDate?: string;
  notes?: string;
  strategyTag?: string;
}

export interface PortfolioHolding extends HoldingInput {
  id: string;
  currentPrice: number;
  priceChange: number;
  sector?: string;
}

export interface PortfolioHoldingMetrics extends PortfolioHolding {
  marketValue: number;
  costBasis: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPercent: number;
  dayGainLoss: number;
  allocationPercent: number;
}

export interface PortfolioSummary {
  totalMarketValue: number;
  totalCostBasis: number;
  totalUnrealizedGainLoss: number;
  totalUnrealizedGainLossPercent: number;
  dailyGainLoss: number;
  holdings: PortfolioHoldingMetrics[];
  concentrationWarnings: string[];
}
