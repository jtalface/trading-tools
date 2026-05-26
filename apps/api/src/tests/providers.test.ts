import { afterEach, describe, expect, it, vi } from "vitest";
import { FmpProvider } from "../providers/fmpProvider.js";
import { UnavailableProvider } from "../providers/unavailableProvider.js";

describe("provider mapping", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps FMP quote payload into the shared quote contract", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ([{
        price: 190,
        previousClose: 185,
        open: 186,
        dayHigh: 191,
        dayLow: 184,
        volume: 50000000,
        change: 5,
        changesPercentage: 2.7027
      }])
    })));

    const provider = new FmpProvider("test-key");
    const quote = await provider.getQuote("AAPL");

    expect(quote.ticker).toBe("AAPL");
    expect(quote.provider).toBe("fmp");
    expect(quote.price).toBe(190);
    expect(quote.changePercent).toBe(2.7027);
  });

  it("throws a configuration error instead of serving fake provider data", async () => {
    const provider = new UnavailableProvider("market-data", "set a provider key");
    await expect(provider.getQuote("AAPL")).rejects.toMatchObject({ statusCode: 503 });
  });
});
