import type { DateRange, HistoricalPrice, NewsItem, Quote, StockProfile, StockSearchResult } from "@trading-tools/shared";
import type { MarketDataProvider, NewsProvider } from "./interfaces.js";

export class FinnhubProvider implements MarketDataProvider, NewsProvider {
  name = "finnhub";
  private baseUrl = "https://finnhub.io/api/v1";

  constructor(private apiKey: string) {}

  private async get<T>(path: string): Promise<T> {
    const separator = path.includes("?") ? "&" : "?";
    const response = await fetch(`${this.baseUrl}${path}${separator}token=${this.apiKey}`);
    if (!response.ok) {
      throw new Error(`Finnhub request failed: ${response.status}`);
    }
    return response.json() as Promise<T>;
  }

  async searchStocks(query: string): Promise<StockSearchResult[]> {
    const payload = await this.get<{ result?: Array<{ symbol: string; description: string; displaySymbol?: string; type?: string }> }>(
      `/search?q=${encodeURIComponent(query)}`
    );
    return (payload.result ?? []).slice(0, 10).map((row) => ({
      ticker: row.displaySymbol ?? row.symbol,
      companyName: row.description,
      exchange: row.type,
      currency: "USD"
    }));
  }

  async getQuote(ticker: string): Promise<Quote> {
    const row = await this.get<{ c: number; d: number; dp: number; h: number; l: number; o: number; pc: number; t: number }>(
      `/quote?symbol=${encodeURIComponent(ticker)}`
    );
    if (!row.c || !row.pc) throw new Error(`No Finnhub quote found for ${ticker}`);
    return {
      ticker,
      price: row.c,
      previousClose: row.pc,
      open: row.o,
      high: row.h,
      low: row.l,
      change: row.d,
      changePercent: row.dp,
      timestamp: new Date(row.t * 1000).toISOString(),
      provider: this.name
    };
  }

  async getHistoricalPrices(ticker: string, range: DateRange): Promise<HistoricalPrice[]> {
    const to = Math.floor(new Date(range.to || Date.now()).getTime() / 1000);
    const from = Math.floor(new Date(range.from || previousYearDate()).getTime() / 1000);
    const payload = await this.get<{ s: string; t?: number[]; o?: number[]; h?: number[]; l?: number[]; c?: number[]; v?: number[] }>(
      `/stock/candle?symbol=${encodeURIComponent(ticker)}&resolution=D&from=${from}&to=${to}`
    );
    if (payload.s !== "ok" || !payload.t) return [];
    return payload.t.map((timestamp, index) => ({
      ticker,
      date: new Date(timestamp * 1000).toISOString().slice(0, 10),
      open: payload.o?.[index] ?? 0,
      high: payload.h?.[index] ?? 0,
      low: payload.l?.[index] ?? 0,
      close: payload.c?.[index] ?? 0,
      adjustedClose: payload.c?.[index] ?? 0,
      volume: payload.v?.[index] ?? 0,
      provider: this.name
    }));
  }

  async getCompanyProfile(ticker: string): Promise<StockProfile> {
    const row = await this.get<Record<string, string | number>>(`/stock/profile2?symbol=${encodeURIComponent(ticker)}`);
    if (!row.name) throw new Error(`No Finnhub profile found for ${ticker}`);
    return {
      ticker,
      companyName: String(row.name),
      exchange: row.exchange ? String(row.exchange) : undefined,
      country: row.country ? String(row.country) : undefined,
      currency: row.currency ? String(row.currency) : undefined,
      marketCap: row.marketCapitalization ? Number(row.marketCapitalization) * 1_000_000 : undefined,
      industry: row.finnhubIndustry ? String(row.finnhubIndustry) : undefined
    };
  }

  async getNews(ticker: string): Promise<NewsItem[]> {
    const to = new Date().toISOString().slice(0, 10);
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 14);
    const from = fromDate.toISOString().slice(0, 10);
    const rows = await this.get<Array<Record<string, string | number>>>(`/company-news?symbol=${ticker}&from=${from}&to=${to}`);
    return rows.slice(0, 20).map((row) => ({
      ticker,
      title: String(row.headline),
      summary: row.summary ? String(row.summary) : undefined,
      url: String(row.url),
      source: String(row.source),
      publishedAt: new Date(Number(row.datetime) * 1000).toISOString(),
      provider: this.name
    }));
  }
}

function previousYearDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  return date.toISOString();
}
