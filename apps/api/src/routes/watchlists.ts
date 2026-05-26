import { Router } from "express";
import { z } from "zod";
import { sanitizeTicker } from "../lib/ticker.js";

export const watchlistsRouter = Router();

const watchlists = new Map<string, { id: string; name: string; items: Array<{ ticker: string; notes?: string; createdAt: string }> }>([
  ["default", { id: "default", name: "Primary Watchlist", items: [{ ticker: "MSFT", createdAt: new Date().toISOString() }] }]
]);

watchlistsRouter.get("/", (_req, res) => {
  res.json({ watchlists: [...watchlists.values()] });
});

watchlistsRouter.post("/", (req, res, next) => {
  try {
    const body = z.object({ name: z.string().min(1) }).parse(req.body);
    const watchlist = { id: crypto.randomUUID(), name: body.name, items: [] };
    watchlists.set(watchlist.id, watchlist);
    res.status(201).json(watchlist);
  } catch (error) {
    next(error);
  }
});

watchlistsRouter.post("/:id/items", (req, res, next) => {
  try {
    const watchlist = watchlists.get(req.params.id);
    if (!watchlist) throw new Error("Watchlist not found");
    const body = z.object({ ticker: z.string(), notes: z.string().optional() }).parse(req.body);
    const item = { ticker: sanitizeTicker(body.ticker), notes: body.notes, createdAt: new Date().toISOString() };
    watchlist.items.push(item);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

watchlistsRouter.delete("/:id/items/:ticker", (req, res, next) => {
  try {
    const watchlist = watchlists.get(req.params.id);
    if (!watchlist) throw new Error("Watchlist not found");
    watchlist.items = watchlist.items.filter((item) => item.ticker !== sanitizeTicker(req.params.ticker));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
