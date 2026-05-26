import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";

describe("api endpoints", () => {
  const app = createApp();

  it("serves health", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
  });

  it("returns an honest provider configuration error without API keys", async () => {
    const response = await request(app).get("/api/stocks/AAPL/quote");
    expect(response.status).toBe(503);
    expect(response.body.error).toContain("provider is not configured");
  });

  it("serves an empty portfolio without fake holdings", async () => {
    const response = await request(app).get("/api/portfolio");
    expect(response.status).toBe(200);
    expect(response.body.portfolios[0].holdings).toEqual([]);
    expect(response.body.portfolios[0].summary.totalMarketValue).toBe(0);
  });
});
