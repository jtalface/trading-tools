import type { AnalystDataProvider, FundamentalsProvider, MarketDataProvider, NewsProvider, PriceTarget } from "./interfaces.js";
import type { AnalystRating, ConsensusRating, DateRange, Fundamentals, HistoricalPrice, NewsItem, Quote, StockProfile, StockSearchResult } from "@trading-tools/shared";
import { normalizeRating } from "../services/ratingNormalization.js";

export class FmpProvider implements MarketDataProvider, AnalystDataProvider, FundamentalsProvider, NewsProvider {
  name = "fmp";
  private baseUrl = "https://financialmodelingprep.com/api/v3";

  constructor(private apiKey: string) {}

  private async get<T>(path: string): Promise<T> {
    const separator = path.includes("?") ? "&" : "?";
    const response = await fetch(`${this.baseUrl}${path}${separator}apikey=${this.apiKey}`);
    if (!response.ok) {
      throw new Error(`FMP request failed: ${response.status}`);
    }
    return response.json() as Promise<T>;
  }

  async searchStocks(query: string): Promise<StockSearchResult[]> {
    const rows = await this.get<Array<{ symbol: string; name: string; exchangeShortName?: string; currency?: string }>>(
      `/search?query=${encodeURIComponent(query)}&limit=10`
    );
    return rows.map((row) => ({
      ticker: row.symbol,
      companyName: row.name,
      exchange: row.exchangeShortName,
      currency: row.currency
    }));
  }

  async getQuote(ticker: string): Promise<Quote> {
    const [row] = await this.get<Array<Record<string, number | string>>>(`/quote/${ticker}`);
    if (!row) throw new Error(`No quote found for ${ticker}`);
    return {
      ticker,
      price: Number(row.price),
      previousClose: Number(row.previousClose),
      open: Number(row.open),
      high: Number(row.dayHigh),
      low: Number(row.dayLow),
      volume: Number(row.volume),
      change: Number(row.change),
      changePercent: Number(row.changesPercentage),
      timestamp: new Date().toISOString(),
      provider: this.name
    };
  }

  async getHistoricalPrices(ticker: string, range: DateRange): Promise<HistoricalPrice[]> {
    const from = range.from ? `&from=${range.from}` : "";
    const to = range.to ? `&to=${range.to}` : "";
    const data = await this.get<{ historical: Array<Record<string, number | string>> }>(`/historical-price-full/${ticker}?serietype=line${from}${to}`);
    return (data.historical ?? [])
      .filter((row) => {
        const date = String(row.date);
        return (!range.from || date >= range.from) && (!range.to || date <= range.to);
      })
      .map((row) => ({
        ticker,
        date: String(row.date),
        open: Number(row.open ?? row.close),
        high: Number(row.high ?? row.close),
        low: Number(row.low ?? row.close),
        close: Number(row.close),
        adjustedClose: Number(row.adjClose ?? row.close),
        volume: Number(row.volume ?? 0),
        provider: this.name
      }))
      .reverse();
  }

  async getCompanyProfile(ticker: string): Promise<StockProfile> {
    const [row] = await this.get<Array<Record<string, number | string>>>(`/profile/${ticker}`);
    if (!row) throw new Error(`No profile found for ${ticker}`);
    return {
      ticker,
      companyName: String(row.companyName ?? ticker),
      exchange: String(row.exchangeShortName ?? ""),
      sector: String(row.sector ?? ""),
      industry: String(row.industry ?? ""),
      country: String(row.country ?? ""),
      currency: String(row.currency ?? "USD"),
      marketCap: Number(row.mktCap ?? 0)
    };
  }

  async getAnalystRatings(ticker: string): Promise<AnalystRating[]> {
    const rows = await this.get<Array<Record<string, number | string>>>(`/upgrades-downgrades/${ticker}`);
    return rows.slice(0, 50).map((row) => {
      const originalRating = String(row.newGrade ?? row.grade ?? "Hold");
      return {
        ticker,
        firmName: String(row.gradingCompany ?? "FMP"),
        firmCategory: "AGGREGATOR",
        actionType: String(row.action ?? "MAINTAINED").toUpperCase().includes("DOWN") ? "DOWNGRADED" : "MAINTAINED",
        originalRating,
        normalizedRating: normalizeRating(originalRating),
        previousRating: row.previousGrade ? String(row.previousGrade) : undefined,
        ratingDate: String(row.publishedDate ?? new Date().toISOString()),
        sourceProvider: this.name
      };
    });
  }

  async getConsensusRating(ticker: string): Promise<ConsensusRating> {
    const rows = await this.get<Array<Record<string, number | string>>>(`/analyst-stock-recommendations/${ticker}`);
    const latest = rows[0];
    return {
      ticker,
      strongBuyCount: Number(latest?.analystRatingsStrongBuy ?? 0),
      buyCount: Number(latest?.analystRatingsbuy ?? 0),
      holdCount: Number(latest?.analystRatingsHold ?? 0),
      sellCount: Number(latest?.analystRatingsSell ?? 0),
      strongSellCount: Number(latest?.analystRatingsStrongSell ?? 0),
      consensusLabel: "BUY",
      numberOfAnalysts: Number(latest?.analystRatingsStrongBuy ?? 0) + Number(latest?.analystRatingsbuy ?? 0) + Number(latest?.analystRatingsHold ?? 0) + Number(latest?.analystRatingsSell ?? 0) + Number(latest?.analystRatingsStrongSell ?? 0),
      asOfDate: String(latest?.date ?? new Date().toISOString()),
      provider: this.name
    };
  }

  async getPriceTargets(ticker: string): Promise<PriceTarget[]> {
    const rows = await this.get<Array<Record<string, number | string>>>(`/price-target/${ticker}`);
    return rows.slice(0, 25).map((row) => ({
      firmName: String(row.analystCompany ?? "FMP"),
      target: Number(row.priceTarget),
      date: String(row.publishedDate ?? new Date().toISOString()),
      currency: "USD"
    }));
  }

  async getFundamentals(ticker: string): Promise<Fundamentals> {
    const [ratios] = await this.get<Array<Record<string, number | string>>>(`/ratios-ttm/${ticker}`);
    return {
      ticker,
      peRatio: Number(ratios?.peRatioTTM ?? 0),
      priceToSales: Number(ratios?.priceToSalesRatioTTM ?? 0),
      priceToBook: Number(ratios?.priceToBookRatioTTM ?? 0),
      debtToEquity: Number(ratios?.debtEquityRatioTTM ?? 0),
      dividendYield: Number(ratios?.dividendYielTTM ?? 0),
      provider: this.name
    };
  }

  async getEarnings() {
    return [];
  }

  async getNews(ticker: string): Promise<NewsItem[]> {
    const rows = await this.get<Array<Record<string, string>>>(`/stock_news?tickers=${ticker}&limit=10`);
    return rows.map((row) => ({
      ticker,
      title: row.title,
      summary: row.text,
      url: row.url,
      source: row.site,
      publishedAt: row.publishedDate,
      provider: this.name
    }));
  }
}
