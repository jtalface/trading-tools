# Trading Tools

Research-only stock trading intelligence suite for market monitoring, portfolio intelligence, analyst ratings, price targets, watchlists, alerts, and decision support.

## What It Is

This is not a trading execution platform. It does not place orders or issue buy/sell commands. It aggregates market and research information so a user can make better-informed decisions.

Compliance disclaimer:

> This application is for research and informational purposes only. It does not provide financial advice, investment recommendations, or trading execution.

## Monorepo

```text
apps/
  api/     Express + TypeScript backend
  web/     React + TypeScript + Vite frontend
packages/
  shared/  Shared contracts and DTOs
prisma/    Database schema and seed data
```

## Providers

Implemented live adapters:

- FMP provider for quotes, search, history, profile, ratings, fundamentals, and news
- Benzinga analyst ratings adapter
- Polygon market-data adapter for search, profile, quote snapshots, and daily aggregate history
- Finnhub market-data/news adapter for search, profile, quote, candles, and company news

Placeholders:

- Polygon
- Finnhub
- TipRanks
- Zacks
- FactSet
- LSEG I/B/E/S

Paid or enterprise integrations intentionally throw clear configuration errors instead of fake production data.

Runtime behavior:

- The API does not use mock market prices, analyst ratings, or fundamentals.
- Without a configured provider key, provider-backed endpoints return `503` with a clear missing-key message.
- Test fixtures are isolated to unit tests and are not registered by the production app.

## Setup

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run dev
```

At least one market data key is required for stock search, quotes, history, and live portfolio valuation:

- Preferred: `POLYGON_API_KEY`
- Alternative: `FINNHUB_API_KEY`
- Fallback: `FMP_API_KEY`

Analyst data requires `BENZINGA_API_KEY` or `FMP_API_KEY`.
Fundamentals currently require `FMP_API_KEY`.
News requires `FINNHUB_API_KEY` or `FMP_API_KEY`.

The API runs on `http://localhost:4000`.
The web app runs on `http://localhost:5173`.

## Docker

```bash
cp .env.example .env
docker compose up
```

## Tests

```bash
npm test
```

Covered:

- Rating normalization
- Portfolio calculations
- Provider mapping and missing-provider behavior
- Basic API endpoint integration

## Security Notes

- API keys stay in backend environment variables.
- The frontend only calls the backend.
- Tickers are sanitized server-side.
- User requests are rate limited.
- Cache TTLs reduce provider API overuse.

## Environment Variables

- `DATABASE_URL`
- `REDIS_URL`
- `FMP_API_KEY`
- `BENZINGA_API_KEY`
- `POLYGON_API_KEY`
- `FINNHUB_API_KEY`
- `ALPHA_VANTAGE_API_KEY`
- `JWT_SECRET`
