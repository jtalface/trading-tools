import { config } from "dotenv";

if (process.env.NODE_ENV !== "test") {
  config({ path: new URL("../../../../.env", import.meta.url).pathname });
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  fmpApiKey: process.env.FMP_API_KEY,
  benzingaApiKey: process.env.BENZINGA_API_KEY,
  polygonApiKey: process.env.POLYGON_API_KEY,
  finnhubApiKey: process.env.FINNHUB_API_KEY,
  alphaVantageApiKey: process.env.ALPHA_VANTAGE_API_KEY,
  jwtSecret: process.env.JWT_SECRET ?? "local-dev-secret"
};

export function providerKeyStatus() {
  return {
    fmp: Boolean(env.fmpApiKey),
    benzinga: Boolean(env.benzingaApiKey),
    polygon: Boolean(env.polygonApiKey),
    finnhub: Boolean(env.finnhubApiKey),
    alphaVantage: Boolean(env.alphaVantageApiKey)
  };
}
