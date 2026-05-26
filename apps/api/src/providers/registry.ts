import { env, providerKeyStatus } from "../config/env.js";
import { BenzingaProvider } from "./benzingaProvider.js";
import { FmpProvider } from "./fmpProvider.js";
import { MockProvider } from "./mockProvider.js";
import { FactSetProvider, FinnhubProvider, LsegIbesProvider, PolygonProvider, TipRanksProvider, ZacksProvider } from "./placeholders.js";

const mock = new MockProvider();
const fmp = env.fmpApiKey ? new FmpProvider(env.fmpApiKey) : undefined;
const benzinga = env.benzingaApiKey ? new BenzingaProvider(env.benzingaApiKey) : undefined;

export const providers = {
  market: fmp ?? mock,
  analyst: benzinga ?? fmp ?? mock,
  fundamentals: fmp ?? mock,
  news: fmp ?? mock,
  all: [
    fmp,
    benzinga,
    new PolygonProvider(env.polygonApiKey),
    new FinnhubProvider(env.finnhubApiKey),
    new TipRanksProvider(),
    new ZacksProvider(),
    new FactSetProvider(),
    new LsegIbesProvider(),
    mock
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
