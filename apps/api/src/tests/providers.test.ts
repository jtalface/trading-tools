import { describe, expect, it } from "vitest";
import { MockProvider } from "../providers/mockProvider.js";

describe("provider mapping", () => {
  it("maps mock quote and consensus into shared contracts", async () => {
    const provider = new MockProvider();
    const quote = await provider.getQuote("AAPL");
    const consensus = await provider.getConsensusRating("AAPL");

    expect(quote.ticker).toBe("AAPL");
    expect(quote.provider).toBe("mock");
    expect(consensus.consensusLabel).toBe("BUY");
    expect(consensus.numberOfAnalysts).toBeGreaterThan(0);
  });
});
