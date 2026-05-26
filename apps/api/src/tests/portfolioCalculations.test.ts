import { describe, expect, it } from "vitest";
import { calculatePortfolioSummary } from "../services/portfolioCalculations.js";

describe("portfolio calculations", () => {
  it("calculates value, P/L, daily P/L, and allocation", () => {
    const summary = calculatePortfolioSummary([
      { id: "1", ticker: "AAA", quantity: 10, averageCost: 8, currentPrice: 12, priceChange: 1 },
      { id: "2", ticker: "BBB", quantity: 5, averageCost: 20, currentPrice: 18, priceChange: -2 }
    ]);

    expect(summary.totalMarketValue).toBe(210);
    expect(summary.totalCostBasis).toBe(180);
    expect(summary.totalUnrealizedGainLoss).toBe(30);
    expect(summary.dailyGainLoss).toBe(0);
    expect(summary.holdings[0].allocationPercent).toBeCloseTo(57.1428);
  });
});
