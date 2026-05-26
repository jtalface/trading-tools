import cors from "cors";
import express from "express";
import helmet from "helmet";
import { alertsRouter } from "./routes/alerts.js";
import { portfolioRouter } from "./routes/portfolio.js";
import { providerStatusRouter } from "./routes/providerStatus.js";
import { stocksRouter } from "./routes/stocks.js";
import { watchlistsRouter } from "./routes/watchlists.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import { rateLimit } from "./middleware/rateLimit.js";

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(rateLimit());

  app.get("/api/health", (_req, res) => res.json({ ok: true, service: "trading-tools-api" }));
  app.use("/api/stocks", stocksRouter);
  app.use("/api/portfolio", portfolioRouter);
  app.use("/api/watchlists", watchlistsRouter);
  app.use("/api/alerts", alertsRouter);
  app.use("/api/provider-status", providerStatusRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
