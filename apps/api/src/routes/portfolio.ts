import { Router } from "express";
import { z } from "zod";
import type { HoldingInput, PortfolioHolding } from "@trading-tools/shared";
import { sanitizeTicker } from "../lib/ticker.js";
import { providers } from "../providers/registry.js";
import { calculatePortfolioSummary } from "../services/portfolioCalculations.js";

export const portfolioRouter = Router();

const portfolios = new Map<string, { id: string; name: string; baseCurrency: string; holdings: HoldingInput[] }>([
  ["demo", {
    id: "demo",
    name: "Demo Research Portfolio",
    baseCurrency: "USD",
    holdings: [
      { ticker: "AAPL", companyName: "Apple Inc.", quantity: 12, averageCost: 168.25, strategyTag: "core" },
      { ticker: "NVDA", companyName: "NVIDIA Corporation", quantity: 5, averageCost: 720.5, strategyTag: "growth" },
      { ticker: "JPM", companyName: "JPMorgan Chase & Co.", quantity: 18, averageCost: 182.1, strategyTag: "financials" }
    ]
  }]
]);

const holdingSchema = z.object({
  ticker: z.string().min(1),
  companyName: z.string().optional(),
  quantity: z.number().positive(),
  averageCost: z.number().nonnegative(),
  purchaseDate: z.string().optional(),
  notes: z.string().optional(),
  strategyTag: z.string().optional()
});

portfolioRouter.get("/", async (_req, res, next) => {
  try {
    const data = await Promise.all([...portfolios.values()].map(async (portfolio) => ({
      ...portfolio,
      summary: await summarize(portfolio.holdings)
    })));
    res.json({ portfolios: data });
  } catch (error) {
    next(error);
  }
});

portfolioRouter.post("/", (req, res, next) => {
  try {
    const body = z.object({ name: z.string().min(1), baseCurrency: z.string().default("USD") }).parse(req.body);
    const id = crypto.randomUUID();
    const portfolio = { id, name: body.name, baseCurrency: body.baseCurrency, holdings: [] };
    portfolios.set(id, portfolio);
    res.status(201).json(portfolio);
  } catch (error) {
    next(error);
  }
});

portfolioRouter.post("/:id/holdings", (req, res, next) => {
  try {
    const portfolio = mustPortfolio(req.params.id);
    const holding = holdingSchema.parse(req.body);
    holding.ticker = sanitizeTicker(holding.ticker);
    portfolio.holdings.push(holding);
    res.status(201).json(holding);
  } catch (error) {
    next(error);
  }
});

portfolioRouter.patch("/:id/holdings/:holdingId", (req, res, next) => {
  try {
    const portfolio = mustPortfolio(req.params.id);
    const index = Number(req.params.holdingId);
    const current = portfolio.holdings[index];
    if (!current) throw new Error("Holding not found");
    portfolio.holdings[index] = { ...current, ...req.body, ticker: sanitizeTicker(req.body.ticker ?? current.ticker) };
    res.json(portfolio.holdings[index]);
  } catch (error) {
    next(error);
  }
});

portfolioRouter.delete("/:id/holdings/:holdingId", (req, res, next) => {
  try {
    const portfolio = mustPortfolio(req.params.id);
    portfolio.holdings.splice(Number(req.params.holdingId), 1);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

portfolioRouter.get("/:id/performance", async (req, res, next) => {
  try {
    res.json(await summarize(mustPortfolio(req.params.id).holdings));
  } catch (error) {
    next(error);
  }
});

portfolioRouter.get("/:id/allocation", async (req, res, next) => {
  try {
    const summary = await summarize(mustPortfolio(req.params.id).holdings);
    const sectorAllocation = summary.holdings.reduce<Record<string, number>>((acc, holding) => {
      const sector = holding.sector ?? "Unknown";
      acc[sector] = (acc[sector] ?? 0) + holding.marketValue;
      return acc;
    }, {});
    res.json({ holdings: summary.holdings, sectorAllocation });
  } catch (error) {
    next(error);
  }
});

function mustPortfolio(id: string) {
  const portfolio = portfolios.get(id);
  if (!portfolio) throw new Error("Portfolio not found");
  return portfolio;
}

async function summarize(holdings: HoldingInput[]) {
  const enriched: PortfolioHolding[] = await Promise.all(holdings.map(async (holding, index) => {
    const ticker = sanitizeTicker(holding.ticker);
    const [quote, profile] = await Promise.all([providers.market.getQuote(ticker), providers.market.getCompanyProfile(ticker)]);
    return {
      id: String(index),
      ...holding,
      ticker,
      companyName: holding.companyName ?? profile.companyName,
      currentPrice: quote.price,
      priceChange: quote.change,
      sector: profile.sector
    };
  }));
  return calculatePortfolioSummary(enriched);
}
