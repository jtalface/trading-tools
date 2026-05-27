import { Router } from "express";
import { z } from "zod";
import type { AnalystRating, ConsensusRating, Fundamentals, HistoricalPrice, NewsItem, Quote, StockProfile } from "@trading-tools/shared";
import { cached } from "../lib/cache.js";
import { sanitizeTicker } from "../lib/ticker.js";
import { providers } from "../providers/registry.js";

export const stocksRouter = Router();

stocksRouter.get("/search", async (req, res, next) => {
  try {
    const q = z.string().min(1).max(80).parse(req.query.q);
    const results = await cached(`search:${q}`, 60, () => providers.market.searchStocks(q));
    res.json({ results, updatedAt: new Date().toISOString(), provider: providers.market.name });
  } catch (error) {
    next(error);
  }
});

stocksRouter.get("/:ticker", async (req, res, next) => {
  try {
    const ticker = sanitizeTicker(req.params.ticker);
    const historyRange = ytdRange();
    const providerWarnings: Array<{ provider: string; message: string }> = [];
    const [profile, history] = await Promise.all([
      optionalProviderLoad<StockProfile>(
        providers.market.name,
        () => cached(`profile:${ticker}`, 86_400, () => providers.market.getCompanyProfile(ticker), 604_800),
        fallbackProfile(ticker),
        providerWarnings
      ),
      optionalProviderLoad<HistoricalPrice[]>(
        providers.market.name,
        () => cached(`history:${ticker}:ytd:${historyRange.from}:${historyRange.to}`, 86_400, () => providers.market.getHistoricalPrices(ticker, historyRange), 604_800),
        [],
        providerWarnings
      )
    ]);
    const quote = await loadQuoteOrDeriveFromHistory(ticker, history, providerWarnings);
    const [consensus, fundamentals, ratings, news] = await Promise.all([
      optionalProviderLoad(
        providers.analyst.name,
        () => cached(`consensus:${ticker}`, 3_600, () => providers.analyst.getConsensusRating(ticker)),
        emptyConsensus(ticker),
        providerWarnings
      ),
      optionalProviderLoad(
        providers.fundamentals.name,
        () => cached(`fundamentals:${ticker}`, 43_200, () => providers.fundamentals.getFundamentals(ticker)),
        emptyFundamentals(ticker),
        providerWarnings
      ),
      optionalProviderLoad<AnalystRating[]>(
        providers.analyst.name,
        () => cached(`ratings:${ticker}`, 3_600, () => providers.analyst.getAnalystRatings(ticker)),
        [],
        providerWarnings
      ),
      optionalProviderLoad<NewsItem[]>(
        providers.news.name,
        () => cached(`news:${ticker}`, 900, () => providers.news.getNews(ticker)),
        [],
        providerWarnings
      )
    ]);
    const latest = history.at(-1);
    const first = history[0];
    const ytdStart = history.find((price) => price.date.startsWith(`${new Date().getFullYear()}-`)) ?? first;
    const high52Week = history.length ? Math.max(...history.map((price) => price.high)) : quote.high ?? quote.price;
    const low52Week = history.length ? Math.min(...history.map((price) => price.low)) : quote.low ?? quote.price;
    const averagePriceTarget = consensus.averagePriceTarget ?? quote.price;
    res.json({
      profile,
      quote,
      consensus,
      fundamentals,
      ratings: ratings.slice(0, 10),
      news,
      providerWarnings,
      intelligence: {
        high52Week,
        low52Week,
        ytdReturn: ytdStart ? ((quote.price - ytdStart.close) / ytdStart.close) * 100 : 0,
        oneYearReturn: first ? ((quote.price - first.close) / first.close) * 100 : 0,
        averagePriceTarget,
        upsidePercent: ((averagePriceTarget - quote.price) / quote.price) * 100,
        ratingDisagreementScore: Math.min(100, Math.abs(consensus.buyCount - consensus.holdCount) * 4 + consensus.sellCount * 8),
        priceTargetDispersion: consensus.highPriceTarget && consensus.lowPriceTarget ? consensus.highPriceTarget - consensus.lowPriceTarget : 0,
        signalSummary: {
          momentum: latest && first && latest.close > first.close ? "Bullish signals" : "Mixed signals",
          analystSentiment: consensus.consensusLabel === "BUY" || consensus.consensusLabel === "STRONG_BUY" ? "Bullish signals" : "Needs more research",
          valuation: fundamentals.peRatio && fundamentals.peRatio > 40 ? "Bearish signals" : "Mixed signals",
          earningsQuality: "Needs more research",
          newsSentiment: "Mixed signals",
          risk: "Review concentration before making decisions"
        }
      },
      disclaimer: "This application is for research and informational purposes only. It does not provide financial advice, investment recommendations, or trading execution."
    });
  } catch (error) {
    next(error);
  }
});

async function optionalProviderLoad<T>(
  provider: string,
  loader: () => Promise<T>,
  fallback: T,
  warnings: Array<{ provider: string; message: string }>
): Promise<T> {
  try {
    return await loader();
  } catch (error) {
    warnings.push({
      provider,
      message: error instanceof Error ? error.message : "Provider request failed"
    });
    return fallback;
  }
}

function emptyConsensus(ticker: string): ConsensusRating {
  return {
    ticker,
    strongBuyCount: 0,
    buyCount: 0,
    holdCount: 0,
    sellCount: 0,
    strongSellCount: 0,
    consensusLabel: "MIXED",
    numberOfAnalysts: 0,
    asOfDate: new Date().toISOString(),
    provider: "unavailable"
  };
}

function emptyFundamentals(ticker: string): Fundamentals {
  return {
    ticker,
    provider: "unavailable"
  };
}

function fallbackProfile(ticker: string): StockProfile {
  return {
    ticker,
    companyName: ticker,
    currency: "USD"
  };
}

function ytdRange() {
  const now = new Date();
  const year = now.getFullYear();
  return {
    from: `${year}-01-01`,
    to: now.toISOString().slice(0, 10),
    interval: "1d" as const
  };
}

stocksRouter.get("/:ticker/quote", async (req, res, next) => {
  try {
    const ticker = sanitizeTicker(req.params.ticker);
    const historyRange = ytdRange();
    const providerWarnings: Array<{ provider: string; message: string }> = [];
    const history = await cached(`history:${ticker}:ytd:${historyRange.from}:${historyRange.to}`, 86_400, () => providers.market.getHistoricalPrices(ticker, historyRange), 604_800);
    const quote = await loadQuoteOrDeriveFromHistory(ticker, history, providerWarnings);
    res.json(providerWarnings.length ? { ...quote, providerWarnings } : quote);
  } catch (error) {
    next(error);
  }
});

stocksRouter.get("/:ticker/history", async (req, res, next) => {
  try {
    const ticker = sanitizeTicker(req.params.ticker);
    const range = ytdRange();
    const history = await cached(`history:${ticker}:ytd:${range.from}:${range.to}`, 86_400, () => providers.market.getHistoricalPrices(ticker, range), 604_800);
    res.json(history.filter((price) => price.date >= range.from && price.date <= range.to));
  } catch (error) {
    next(error);
  }
});

stocksRouter.get("/:ticker/ratings", async (req, res, next) => {
  try {
    const ticker = sanitizeTicker(req.params.ticker);
    res.json(await cached(`ratings:${ticker}`, 3_600, () => providers.analyst.getAnalystRatings(ticker)));
  } catch (error) {
    next(error);
  }
});

stocksRouter.get("/:ticker/consensus", async (req, res, next) => {
  try {
    const ticker = sanitizeTicker(req.params.ticker);
    res.json(await cached(`consensus:${ticker}`, 3_600, () => providers.analyst.getConsensusRating(ticker)));
  } catch (error) {
    next(error);
  }
});

stocksRouter.get("/:ticker/fundamentals", async (req, res, next) => {
  try {
    const ticker = sanitizeTicker(req.params.ticker);
    res.json(await cached(`fundamentals:${ticker}`, 43_200, () => providers.fundamentals.getFundamentals(ticker)));
  } catch (error) {
    next(error);
  }
});

stocksRouter.get("/:ticker/news", async (req, res, next) => {
  try {
    const ticker = sanitizeTicker(req.params.ticker);
    res.json(await cached(`news:${ticker}`, 900, () => providers.news.getNews(ticker)));
  } catch (error) {
    next(error);
  }
});

async function loadQuoteOrDeriveFromHistory(
  ticker: string,
  history: HistoricalPrice[],
  warnings: Array<{ provider: string; message: string }>
): Promise<Quote> {
  try {
    return await cached(`quote:${ticker}`, 1_800, () => providers.market.getQuote(ticker), 86_400);
  } catch (error) {
    const latest = history.at(-1);
    const previous = history.at(-2);
    if (!latest) throw error;
    warnings.push({
      provider: providers.market.name,
      message: error instanceof Error ? error.message : "Quote provider failed; derived quote from historical prices."
    });
    const previousClose = previous?.close ?? latest.open;
    return {
      ticker,
      price: latest.close,
      previousClose,
      open: latest.open,
      high: latest.high,
      low: latest.low,
      volume: latest.volume,
      change: latest.close - previousClose,
      changePercent: previousClose === 0 ? 0 : ((latest.close - previousClose) / previousClose) * 100,
      timestamp: new Date(latest.date).toISOString(),
      provider: `${latest.provider}:historical-derived`
    };
  }
}
