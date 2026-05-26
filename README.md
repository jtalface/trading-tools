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

Implemented:

- Mock provider for local development
- FMP provider for quotes, search, history, profile, ratings, fundamentals, and news
- Benzinga analyst ratings adapter

Placeholders:

- Polygon
- Finnhub
- TipRanks
- Zacks
- FactSet
- LSEG I/B/E/S

Paid or enterprise integrations intentionally throw clear configuration errors instead of fake production data.

## Setup

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run dev
```

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
- Provider mapping/fallback behavior
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
