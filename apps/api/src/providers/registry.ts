import { env, providerKeyStatus } from "../config/env.js";
import { BenzingaProvider } from "./benzingaProvider.js";
import { FinnhubProvider } from "./finnhubProvider.js";
import { FmpProvider } from "./fmpProvider.js";
import { FactSetProvider, LsegIbesProvider, TipRanksProvider, ZacksProvider } from "./placeholders.js";
import { PolygonProvider } from "./polygonProvider.js";
import { UnavailableProvider } from "./unavailableProvider.js";

const fmp = env.fmpApiKey ? new FmpProvider(env.fmpApiKey) : undefined;
const benzinga = env.benzingaApiKey ? new BenzingaProvider(env.benzingaApiKey) : undefined;
const polygon = env.polygonApiKey ? new PolygonProvider(env.polygonApiKey) : undefined;
const finnhub = env.finnhubApiKey ? new FinnhubProvider(env.finnhubApiKey) : undefined;
const unavailableMarket = new UnavailableProvider("market-data", "set POLYGON_API_KEY, FINNHUB_API_KEY, or FMP_API_KEY");
const unavailableAnalyst = new UnavailableProvider("analyst-data", "set BENZINGA_API_KEY or FMP_API_KEY");
const unavailableFundamentals = new UnavailableProvider("fundamentals", "set FMP_API_KEY");
const unavailableNews = new UnavailableProvider("news", "set FINNHUB_API_KEY or FMP_API_KEY");

export const providers = {
  market: polygon ?? finnhub ?? fmp ?? unavailableMarket,
  analyst: benzinga ?? fmp ?? unavailableAnalyst,
  fundamentals: fmp ?? unavailableFundamentals,
  news: finnhub ?? fmp ?? unavailableNews,
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
  return {
    keys,
    active: {
      market: providers.market.name,
      analyst: providers.analyst.name,
      fundamentals: providers.fundamentals.name,
      news: providers.news.name
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
