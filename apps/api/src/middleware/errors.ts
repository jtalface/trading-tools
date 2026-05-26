import type { ErrorRequestHandler, RequestHandler } from "express";

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: "Not found" });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  const statusCode = typeof error === "object" && error && "statusCode" in error ? Number(error.statusCode) : undefined;
  const status = statusCode ?? (message.toLowerCase().includes("invalid") ? 400 : 500);
  res.status(status).json({ error: message });
};
