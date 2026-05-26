import type { PortfolioHolding, PortfolioHoldingMetrics, PortfolioSummary } from "@trading-tools/shared";

export function calculateHoldingMetrics(
  holding: PortfolioHolding,
  portfolioMarketValue: number
): PortfolioHoldingMetrics {
  const marketValue = holding.quantity * holding.currentPrice;
  const costBasis = holding.quantity * holding.averageCost;
  const unrealizedGainLoss = marketValue - costBasis;
  const unrealizedGainLossPercent = costBasis === 0 ? 0 : (unrealizedGainLoss / costBasis) * 100;
  const dayGainLoss = holding.quantity * holding.priceChange;
  const allocationPercent = portfolioMarketValue === 0 ? 0 : (marketValue / portfolioMarketValue) * 100;

  return {
    ...holding,
    marketValue,
    costBasis,
    unrealizedGainLoss,
    unrealizedGainLossPercent,
    dayGainLoss,
    allocationPercent
  };
}

export function calculatePortfolioSummary(holdings: PortfolioHolding[]): PortfolioSummary {
  const totalMarketValue = holdings.reduce((sum, holding) => sum + holding.quantity * holding.currentPrice, 0);
  const metrics = holdings.map((holding) => calculateHoldingMetrics(holding, totalMarketValue));
  const totalCostBasis = metrics.reduce((sum, holding) => sum + holding.costBasis, 0);
  const totalUnrealizedGainLoss = metrics.reduce((sum, holding) => sum + holding.unrealizedGainLoss, 0);
  const dailyGainLoss = metrics.reduce((sum, holding) => sum + holding.dayGainLoss, 0);
  const concentrationWarnings = metrics
    .filter((holding) => holding.allocationPercent >= 35)
    .map((holding) => `${holding.ticker} is ${holding.allocationPercent.toFixed(1)}% of portfolio value.`);

  return {
    totalMarketValue,
    totalCostBasis,
    totalUnrealizedGainLoss,
    totalUnrealizedGainLossPercent: totalCostBasis === 0 ? 0 : (totalUnrealizedGainLoss / totalCostBasis) * 100,
    dailyGainLoss,
    holdings: metrics,
    concentrationWarnings
  };
}
