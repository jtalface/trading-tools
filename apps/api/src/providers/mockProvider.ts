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

const demoStocks: StockProfile[] = [
  { ticker: "AAPL", companyName: "Apple Inc.", exchange: "NASDAQ", sector: "Technology", industry: "Consumer Electronics", country: "US", currency: "USD", marketCap: 2950000000000 },
  { ticker: "MSFT", companyName: "Microsoft Corporation", exchange: "NASDAQ", sector: "Technology", industry: "Software", country: "US", currency: "USD", marketCap: 3200000000000 },
  { ticker: "NVDA", companyName: "NVIDIA Corporation", exchange: "NASDAQ", sector: "Technology", industry: "Semiconductors", country: "US", currency: "USD", marketCap: 2600000000000 },
  { ticker: "JPM", companyName: "JPMorgan Chase & Co.", exchange: "NYSE", sector: "Financial Services", industry: "Banks", country: "US", currency: "USD", marketCap: 560000000000 }
];

function seededPrice(ticker: string) {
  const seed = ticker.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return 80 + (seed % 220);
}

export class MockProvider implements MarketDataProvider, AnalystDataProvider, FundamentalsProvider, NewsProvider {
  name = "mock";

  async searchStocks(query: string): Promise<StockSearchResult[]> {
    const q = query.toLowerCase();
    return demoStocks.filter((stock) => stock.ticker.toLowerCase().includes(q) || stock.companyName.toLowerCase().includes(q));
  }

  async getQuote(ticker: string): Promise<Quote> {
    const price = seededPrice(ticker);
    const previousClose = price - 1.42;
    return {
      ticker,
      price,
      previousClose,
      open: previousClose + 0.4,
      high: price + 2.1,
      low: price - 3.25,
      volume: 42150000,
      change: price - previousClose,
      changePercent: ((price - previousClose) / previousClose) * 100,
      timestamp: new Date().toISOString(),
      provider: this.name
    };
  }

  async getHistoricalPrices(ticker: string, _range: DateRange): Promise<HistoricalPrice[]> {
    const base = seededPrice(ticker);
    return Array.from({ length: 90 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (89 - index));
      const close = base + Math.sin(index / 5) * 8 + index * 0.08;
      return {
        ticker,
        date: date.toISOString().slice(0, 10),
        open: close - 1.2,
        high: close + 2.3,
        low: close - 2.1,
        close,
        adjustedClose: close,
        volume: 25000000 + index * 100000,
        provider: this.name
      };
    });
  }

  async getCompanyProfile(ticker: string): Promise<StockProfile> {
    return demoStocks.find((stock) => stock.ticker === ticker) ?? {
      ticker,
      companyName: `${ticker} Corporation`,
      exchange: "NASDAQ",
      sector: "Unknown",
      industry: "Unknown",
      country: "US",
      currency: "USD"
    };
  }

  async getAnalystRatings(ticker: string): Promise<AnalystRating[]> {
    return [
      { ticker, firmName: "Morgan Stanley", firmCategory: "SELL_SIDE", analystName: "Demo Analyst", actionType: "MAINTAINED", originalRating: "Overweight", normalizedRating: "BUY", priceTarget: seededPrice(ticker) * 1.18, currency: "USD", ratingDate: new Date().toISOString(), sourceProvider: this.name, confidenceScore: 0.72 },
      { ticker, firmName: "Morningstar", firmCategory: "INDEPENDENT", actionType: "REITERATED", originalRating: "Hold", normalizedRating: "HOLD", priceTarget: seededPrice(ticker) * 1.02, currency: "USD", ratingDate: new Date().toISOString(), sourceProvider: this.name, confidenceScore: 0.65 },
      { ticker, firmName: "Benzinga", firmCategory: "AGGREGATOR", actionType: "UPGRADED", originalRating: "Buy", normalizedRating: "BUY", previousRating: "Neutral", priceTarget: seededPrice(ticker) * 1.12, previousPriceTarget: seededPrice(ticker), currency: "USD", ratingDate: new Date().toISOString(), sourceProvider: this.name, confidenceScore: 0.69 }
    ];
  }

  async getConsensusRating(ticker: string): Promise<ConsensusRating> {
    const quote = await this.getQuote(ticker);
    const averagePriceTarget = quote.price * 1.12;
    return {
      ticker,
      strongBuyCount: 2,
      buyCount: 14,
      holdCount: 8,
      sellCount: 1,
      strongSellCount: 0,
      consensusLabel: "BUY",
      averagePriceTarget,
      medianPriceTarget: quote.price * 1.1,
      highPriceTarget: quote.price * 1.28,
      lowPriceTarget: quote.price * 0.92,
      numberOfAnalysts: 25,
      upsidePercent: ((averagePriceTarget - quote.price) / quote.price) * 100,
      asOfDate: new Date().toISOString(),
      provider: this.name
    };
  }

  async getPriceTargets(ticker: string): Promise<PriceTarget[]> {
    const quote = await this.getQuote(ticker);
    return [
      { firmName: "Goldman Sachs", target: quote.price * 1.2, date: new Date().toISOString(), currency: "USD" },
      { firmName: "CFRA", target: quote.price * 1.06, date: new Date().toISOString(), currency: "USD" }
    ];
  }

  async getFundamentals(ticker: string): Promise<Fundamentals> {
    return {
      ticker,
      revenue: 385000000000,
      grossMargin: 0.46,
      operatingMargin: 0.31,
      netIncome: 97000000000,
      eps: 6.12,
      peRatio: 28.4,
      forwardPe: 24.7,
      pegRatio: 2.1,
      priceToSales: 7.2,
      priceToBook: 38.5,
      debtToEquity: 1.47,
      freeCashFlow: 99000000000,
      dividendYield: 0.0056,
      fiscalPeriod: "FY",
      fiscalYear: new Date().getFullYear() - 1,
      provider: this.name
    };
  }

  async getEarnings() {
    return [];
  }

  async getNews(ticker: string): Promise<NewsItem[]> {
    return [
      {
        ticker,
        title: `${ticker} analysts debate valuation after latest market move`,
        summary: "Demo research feed item for local development.",
        url: "https://example.com/research-only-demo",
        source: "Demo News",
        sentiment: "NEUTRAL",
        publishedAt: new Date().toISOString(),
        provider: this.name
      }
    ];
  }
}
