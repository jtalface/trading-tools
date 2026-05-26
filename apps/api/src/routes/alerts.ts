import { Router } from "express";
import { z } from "zod";
import { sanitizeTicker } from "../lib/ticker.js";

export const alertsRouter = Router();

const alerts: Array<{ id: string; ticker: string; type: string; threshold?: string; enabled: boolean; createdAt: string; updatedAt: string }> = [];

const alertSchema = z.object({
  ticker: z.string(),
  type: z.enum(["PRICE_ABOVE", "PRICE_BELOW", "RATING_CHANGE", "PRICE_TARGET_CHANGE", "NEWS_SENTIMENT", "VOLUME_SPIKE", "EARNINGS_DATE"]),
  threshold: z.string().optional(),
  enabled: z.boolean().default(true)
});

alertsRouter.get("/", (_req, res) => {
  res.json({ alerts });
});

alertsRouter.post("/", (req, res, next) => {
  try {
    const body = alertSchema.parse(req.body);
    const now = new Date().toISOString();
    const alert = { ...body, ticker: sanitizeTicker(body.ticker), id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    alerts.push(alert);
    res.status(201).json(alert);
  } catch (error) {
    next(error);
  }
});

alertsRouter.patch("/:id", (req, res, next) => {
  try {
    const alert = alerts.find((item) => item.id === req.params.id);
    if (!alert) throw new Error("Alert not found");
    Object.assign(alert, req.body, { updatedAt: new Date().toISOString() });
    res.json(alert);
  } catch (error) {
    next(error);
  }
});

alertsRouter.delete("/:id", (req, res, next) => {
  try {
    const index = alerts.findIndex((item) => item.id === req.params.id);
    if (index >= 0) alerts.splice(index, 1);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
