import type { AnalystDataProvider, PriceTarget } from "./interfaces.js";
import type { AnalystRating, ConsensusRating } from "@trading-tools/shared";
import { normalizeRating } from "../services/ratingNormalization.js";

export class BenzingaProvider implements AnalystDataProvider {
  name = "benzinga";
  private baseUrl = "https://api.benzinga.com/api/v2.1";

  constructor(private apiKey: string) {}

  private async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        accept: "application/json",
        Authorization: `token ${this.apiKey}`
      }
    });
    if (!response.ok) throw new Error(`Benzinga request failed: ${response.status}`);
    return response.json() as Promise<T>;
  }

  async getAnalystRatings(ticker: string): Promise<AnalystRating[]> {
    const rows = await this.get<Array<Record<string, string | number>>>(`/calendar/ratings?parameters[tickers]=${ticker}`);
    return rows.map((row) => {
      const originalRating = String(row.rating_current ?? row.rating_prior ?? "Hold");
      return {
        ticker,
        firmName: String(row.analyst ?? row.firm ?? "Benzinga"),
        firmCategory: "AGGREGATOR",
        analystName: row.analyst_name ? String(row.analyst_name) : undefined,
        actionType: this.actionType(String(row.action ?? "MAINTAINED")),
        originalRating,
        normalizedRating: normalizeRating(originalRating),
        previousRating: row.rating_prior ? String(row.rating_prior) : undefined,
        priceTarget: row.pt_current ? Number(row.pt_current) : undefined,
        previousPriceTarget: row.pt_prior ? Number(row.pt_prior) : undefined,
        currency: "USD",
        ratingDate: String(row.date ?? new Date().toISOString()),
        sourceProvider: this.name
      };
    });
  }

  async getConsensusRating(ticker: string): Promise<ConsensusRating> {
    const ratings = await this.getAnalystRatings(ticker);
    return {
      ticker,
      strongBuyCount: ratings.filter((rating) => rating.normalizedRating === "STRONG_BUY").length,
      buyCount: ratings.filter((rating) => rating.normalizedRating === "BUY").length,
      holdCount: ratings.filter((rating) => rating.normalizedRating === "HOLD").length,
      sellCount: ratings.filter((rating) => rating.normalizedRating === "SELL").length,
      strongSellCount: ratings.filter((rating) => rating.normalizedRating === "STRONG_SELL").length,
      consensusLabel: "MIXED",
      numberOfAnalysts: ratings.length,
      asOfDate: new Date().toISOString(),
      provider: this.name
    };
  }

  async getPriceTargets(ticker: string): Promise<PriceTarget[]> {
    return (await this.getAnalystRatings(ticker))
      .filter((rating) => rating.priceTarget)
      .map((rating) => ({ firmName: rating.firmName, target: rating.priceTarget as number, date: rating.ratingDate, currency: rating.currency }));
  }

  private actionType(value: string): AnalystRating["actionType"] {
    const normalized = value.toUpperCase();
    if (normalized.includes("UPGRADE")) return "UPGRADED";
    if (normalized.includes("DOWNGRADE")) return "DOWNGRADED";
    if (normalized.includes("INITIATE")) return "INITIATED";
    if (normalized.includes("REITERATE")) return "REITERATED";
    if (normalized.includes("RESUME")) return "RESUMED";
    return "MAINTAINED";
  }
}
