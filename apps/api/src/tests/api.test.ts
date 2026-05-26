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

  it("serves stock quote", async () => {
    const response = await request(app).get("/api/stocks/AAPL/quote");
    expect(response.status).toBe(200);
    expect(response.body.ticker).toBe("AAPL");
  });

  it("serves portfolio summary", async () => {
    const response = await request(app).get("/api/portfolio");
    expect(response.status).toBe(200);
    expect(response.body.portfolios[0].summary.totalMarketValue).toBeGreaterThan(0);
  });
});
