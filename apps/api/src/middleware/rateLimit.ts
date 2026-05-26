import type { RequestHandler } from "express";

const windows = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(maxRequests = 120, windowMs = 60_000): RequestHandler {
  return (req, res, next) => {
    const key = req.ip ?? req.socket.remoteAddress ?? "unknown";
    const now = Date.now();
    const current = windows.get(key) ?? { count: 0, resetAt: now + windowMs };
    if (current.resetAt < now) {
      current.count = 0;
      current.resetAt = now + windowMs;
    }
    current.count += 1;
    windows.set(key, current);
    if (current.count > maxRequests) {
      res.status(429).json({ error: "Rate limit exceeded" });
      return;
    }
    next();
  };
}
