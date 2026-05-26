# Trading Intelligence Suite Implementation Plan

## Product Positioning

This application is a research, monitoring, and portfolio intelligence platform. It does not place trades, route orders, or generate buy/sell commands. Its purpose is to centralize market data, portfolio exposure, analyst intelligence, news, alerts, and decision-support signals.

## Architecture

- Frontend: React, TypeScript, Vite, Tailwind CSS, Recharts
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL through Prisma
- Cache: Redis, with an in-memory fallback for local development
- Jobs: BullMQ-ready background worker structure
- Auth: JWT-ready API surface with demo auth in local mode
- Providers: pluggable adapters behind market, analyst, fundamentals, and news interfaces
- Deployment: Docker Compose for API, web, Postgres, and Redis

## Phase 1

- App shell and navigation
- Stock search
- Quote lookup and stock detail summary
- Manual portfolio CRUD
- Live portfolio value calculations
- Real provider-backed quote, profile, and history lookup
- Basic historical charts

## Phase 2

- Analyst ratings and Benzinga provider adapter
- Rating normalization and consensus cards
- Ratings intelligence page
- In-app alerts
- Provider status and freshness labels

## Phase 3

- TipRanks, Zacks, Intrinio, and Nasdaq Data Link adapters
- News sentiment enhancements
- Advanced portfolio analytics
- CSV import

## Phase 4

- FactSet, LSEG I/B/E/S, Bloomberg, and S&P Capital IQ placeholders
- Rating impact backtesting
- AI-assisted research summaries

## API Contracts

### Stocks

- `GET /api/stocks/search?q=`
- `GET /api/stocks/:ticker`
- `GET /api/stocks/:ticker/quote`
- `GET /api/stocks/:ticker/history?range=`
- `GET /api/stocks/:ticker/ratings`
- `GET /api/stocks/:ticker/consensus`
- `GET /api/stocks/:ticker/fundamentals`
- `GET /api/stocks/:ticker/news`

### Portfolio

- `GET /api/portfolio`
- `POST /api/portfolio`
- `POST /api/portfolio/:id/holdings`
- `PATCH /api/portfolio/:id/holdings/:holdingId`
- `DELETE /api/portfolio/:id/holdings/:holdingId`
- `GET /api/portfolio/:id/performance`
- `GET /api/portfolio/:id/allocation`

### Watchlists

- `GET /api/watchlists`
- `POST /api/watchlists`
- `POST /api/watchlists/:id/items`
- `DELETE /api/watchlists/:id/items/:ticker`

### Alerts

- `GET /api/alerts`
- `POST /api/alerts`
- `PATCH /api/alerts/:id`
- `DELETE /api/alerts/:id`

### Providers

- `GET /api/provider-status`

## Data Freshness Policy

- Quotes: 5 to 15 seconds
- Company profile: 24 hours
- Fundamentals: 12 to 24 hours
- Analyst ratings: 1 to 6 hours
- News: 10 to 30 minutes
- Historical prices: 24 hours after market close

## Compliance Language

This application is for research and informational purposes only. It does not provide financial advice, investment recommendations, or trading execution.
