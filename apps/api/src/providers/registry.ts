import { env, providerKeyStatus } from "../config/env.js";
import { BenzingaProvider } from "./benzingaProvider.js";
import { FinnhubProvider } from "./finnhubProvider.js";
import { FmpProvider } from "./fmpProvider.js";
import { FactSetProvider, LsegIbesProvider, TipRanksProvider, ZacksProvider } from "./placeholders.js";
import { PolygonProvider } from "./polygonProvider.js";
import { AnalystDataProviderChain, FundamentalsProviderChain, MarketDataProviderChain, NewsProviderChain } from "./providerChain.js";
import { UnavailableProvider } from "./unavailableProvider.js";

const fmp = env.fmpApiKey ? new FmpProvider(env.fmpApiKey) : undefined;
const benzinga = env.benzingaApiKey ? new BenzingaProvider(env.benzingaApiKey) : undefined;
const polygon = env.polygonApiKey ? new PolygonProvider(env.polygonApiKey) : undefined;
const finnhub = env.finnhubApiKey ? new FinnhubProvider(env.finnhubApiKey) : undefined;
const unavailableMarket = new UnavailableProvider("market-data", "set POLYGON_API_KEY, FINNHUB_API_KEY, or FMP_API_KEY");
const unavailableAnalyst = new UnavailableProvider("analyst-data", "set BENZINGA_API_KEY or FMP_API_KEY");
const unavailableFundamentals = new UnavailableProvider("fundamentals", "set FMP_API_KEY");
const unavailableNews = new UnavailableProvider("news", "set FINNHUB_API_KEY or FMP_API_KEY");

function configured<T>(provider: T | undefined): provider is T {
  return Boolean(provider);
}

export const providers = {
  market: new MarketDataProviderChain([polygon, finnhub, fmp].filter(configured)),
  analyst: new AnalystDataProviderChain([benzinga, fmp].filter(configured)),
  fundamentals: new FundamentalsProviderChain([fmp].filter(configured)),
  news: new NewsProviderChain([finnhub, fmp].filter(configured)),
  all: [
    polygon,
    finnhub,
    fmp,
    benzinga,
    new TipRanksProvider(),
    new ZacksProvider(),
    new FactSetProvider(),
    new LsegIbesProvider()
  ].filter(Boolean)
};

export function getProviderStatus() {
  const keys = providerKeyStatus();
  const activeMarket = providers.market.name || unavailableMarket.name;
  const activeAnalyst = providers.analyst.name || unavailableAnalyst.name;
  const activeFundamentals = providers.fundamentals.name || unavailableFundamentals.name;
  const activeNews = providers.news.name || unavailableNews.name;
  return {
    keys,
    active: {
      market: activeMarket,
      analyst: activeAnalyst,
      fundamentals: activeFundamentals,
      news: activeNews
    },
    freshnessPolicy: {
      quotes: "5-15 seconds",
      companyProfile: "24 hours",
      fundamentals: "12-24 hours",
      analystRatings: "1-6 hours",
      news: "10-30 minutes",
      historicalPrices: "24 hours after market close"
    }
  };
}
