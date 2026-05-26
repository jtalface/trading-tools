import type { DateRange, HistoricalPrice, Quote, StockProfile, StockSearchResult } from "@trading-tools/shared";
import type { MarketDataProvider } from "./interfaces.js";

type PolygonTickerSearch = {
  ticker: string;
  name: string;
  primary_exchange?: string;
  currency_name?: string;
};

type PolygonSnapshot = {
  ticker?: {
    ticker: string;
    day?: { o?: number; h?: number; l?: number; c?: number; v?: number };
    prevDay?: { c?: number };
    lastTrade?: { p?: number; t?: number };
    updated?: number;
  };
};

type PolygonAgg = {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
};

export class PolygonProvider implements MarketDataProvider {
  name = "polygon";
  private baseUrl = "https://api.polygon.io";

  constructor(private apiKey: string) {}

  private async get<T>(path: string): Promise<T> {
    const separator = path.includes("?") ? "&" : "?";
    const response = await fetch(`${this.baseUrl}${path}${separator}apiKey=${this.apiKey}`);
    if (!response.ok) {
      throw new Error(`Polygon request failed: ${response.status}`);
    }
    return response.json() as Promise<T>;
  }

  async searchStocks(query: string): Promise<StockSearchResult[]> {
    const payload = await this.get<{ results?: PolygonTickerSearch[] }>(
      `/v3/reference/tickers?market=stocks&active=true&limit=10&search=${encodeURIComponent(query)}`
    );
    return (payload.results ?? []).map((row) => ({
      ticker: row.ticker,
      companyName: row.name,
      exchange: row.primary_exchange,
      currency: row.currency_name?.toUpperCase()
    }));
  }

  async getQuote(ticker: string): Promise<Quote> {
    const payload = await this.get<PolygonSnapshot>(`/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}`);
    const row = payload.ticker;
    if (!row) throw new Error(`No Polygon quote found for ${ticker}`);
    const price = row.lastTrade?.p ?? row.day?.c ?? row.prevDay?.c;
    const previousClose = row.prevDay?.c;
    if (price === undefined || previousClose === undefined) throw new Error(`Incomplete Polygon quote for ${ticker}`);

    return {
      ticker,
      price,
      previousClose,
      open: row.day?.o,
      high: row.day?.h,
      low: row.day?.l,
      volume: row.day?.v,
      change: price - previousClose,
      changePercent: ((price - previousClose) / previousClose) * 100,
      timestamp: new Date(row.lastTrade?.t ? row.lastTrade.t / 1_000_000 : Date.now()).toISOString(),
      provider: this.name
    };
  }

  async getHistoricalPrices(ticker: string, range: DateRange): Promise<HistoricalPrice[]> {
    const to = range.to || new Date().toISOString().slice(0, 10);
    const from = range.from || previousYearDate();
    const payload = await this.get<{ results?: PolygonAgg[] }>(
      `/v2/aggs/ticker/${ticker}/range/1/day/${from}/${to}?adjusted=true&sort=asc&limit=50000`
    );
    return (payload.results ?? []).map((row) => ({
      ticker,
      date: new Date(row.t).toISOString().slice(0, 10),
      open: row.o,
      high: row.h,
      low: row.l,
      close: row.c,
      adjustedClose: row.c,
      volume: row.v,
      provider: this.name
    }));
  }

  async getCompanyProfile(ticker: string): Promise<StockProfile> {
    const payload = await this.get<{ results?: Record<string, string | number> }>(`/v3/reference/tickers/${ticker}`);
    const row = payload.results;
    if (!row) throw new Error(`No Polygon profile found for ${ticker}`);
    return {
      ticker,
      companyName: String(row.name ?? ticker),
      exchange: row.primary_exchange ? String(row.primary_exchange) : undefined,
      sector: row.sic_description ? String(row.sic_description) : undefined,
      industry: row.type ? String(row.type) : undefined,
      country: row.locale ? String(row.locale).toUpperCase() : undefined,
      currency: row.currency_name ? String(row.currency_name).toUpperCase() : undefined,
      marketCap: row.market_cap ? Number(row.market_cap) : undefined,
      cik: row.cik ? String(row.cik) : undefined,
      figi: row.composite_figi ? String(row.composite_figi) : undefined
    };
  }
}

function previousYearDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  return date.toISOString().slice(0, 10);
}
