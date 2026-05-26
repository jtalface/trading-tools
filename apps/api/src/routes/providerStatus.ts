import { Router } from "express";
import { cacheStatus } from "../lib/cache.js";
import { getProviderStatus } from "../providers/registry.js";

export const providerStatusRouter = Router();

providerStatusRouter.get("/", (_req, res) => {
  res.json({
    ...getProviderStatus(),
    cache: cacheStatus(),
    disclaimer: "API keys are checked server-side only and are never exposed to the frontend."
  });
});
