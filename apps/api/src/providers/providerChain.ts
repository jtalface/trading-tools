import type {
  AnalystDataProvider,
  FundamentalsProvider,
  MarketDataProvider,
  NewsProvider,
  PriceTarget
} from "./interfaces.js";
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
import { ProviderConfigurationError } from "./unavailableProvider.js";

type ProviderMethod<TProvider, TResult> = (provider: TProvider) => Promise<TResult>;

async function firstSuccessful<TProvider extends { name: string }, TResult>(
  providers: TProvider[],
  operation: string,
  call: ProviderMethod<TProvider, TResult>
): Promise<TResult> {
  if (providers.length === 0) {
    throw new ProviderConfigurationError(operation, "no provider keys are configured");
  }
  const failures: string[] = [];
  for (const provider of providers) {
    try {
      return await call(provider);
    } catch (error) {
      const message = error instanceof Error ? error.message : "request failed";
      failures.push(`${provider.name}: ${message}`);
    }
  }
  throw new Error(`${operation} failed across configured providers: ${failures.join("; ")}`);
}

export class MarketDataProviderChain implements MarketDataProvider {
  name: string;

  constructor(private readonly providers: MarketDataProvider[]) {
    this.name = providers.map((provider) => provider.name).join("→") || "market-data";
  }

  searchStocks(query: string): Promise<StockSearchResult[]> {
    return firstSuccessful(this.providers, "stock search", (provider) => provider.searchStocks(query));
  }

  getQuote(ticker: string): Promise<Quote> {
    return firstSuccessful(this.providers, "quote lookup", (provider) => provider.getQuote(ticker));
  }

  getHistoricalPrices(ticker: string, range: DateRange): Promise<HistoricalPrice[]> {
    return firstSuccessful(this.providers, "historical price lookup", (provider) => provider.getHistoricalPrices(ticker, range));
  }

  getCompanyProfile(ticker: string): Promise<StockProfile> {
    return firstSuccessful(this.providers, "company profile lookup", (provider) => provider.getCompanyProfile(ticker));
  }
}

export class AnalystDataProviderChain implements AnalystDataProvider {
  name: string;

  constructor(private readonly providers: AnalystDataProvider[]) {
    this.name = providers.map((provider) => provider.name).join("→") || "analyst-data";
  }

  getAnalystRatings(ticker: string): Promise<AnalystRating[]> {
    return firstSuccessful(this.providers, "analyst ratings lookup", (provider) => provider.getAnalystRatings(ticker));
  }

  getConsensusRating(ticker: string): Promise<ConsensusRating> {
    return firstSuccessful(this.providers, "consensus rating lookup", (provider) => provider.getConsensusRating(ticker));
  }

  getPriceTargets(ticker: string): Promise<PriceTarget[]> {
    return firstSuccessful(this.providers, "price target lookup", (provider) => provider.getPriceTargets(ticker));
  }
}

export class FundamentalsProviderChain implements FundamentalsProvider {
  name: string;

  constructor(private readonly providers: FundamentalsProvider[]) {
    this.name = providers.map((provider) => provider.name).join("→") || "fundamentals";
  }

  getFundamentals(ticker: string): Promise<Fundamentals> {
    return firstSuccessful(this.providers, "fundamentals lookup", (provider) => provider.getFundamentals(ticker));
  }

  getEarnings(ticker: string) {
    return firstSuccessful(this.providers, "earnings lookup", (provider) => provider.getEarnings(ticker));
  }
}

export class NewsProviderChain implements NewsProvider {
  name: string;

  constructor(private readonly providers: NewsProvider[]) {
    this.name = providers.map((provider) => provider.name).join("→") || "news";
  }

  getNews(ticker: string): Promise<NewsItem[]> {
    return firstSuccessful(this.providers, "news lookup", (provider) => provider.getNews(ticker));
  }
}
