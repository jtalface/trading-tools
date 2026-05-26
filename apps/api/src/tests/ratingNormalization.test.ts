import { describe, expect, it } from "vitest";
import { normalizeRating } from "../services/ratingNormalization.js";

describe("normalizeRating", () => {
  it("maps strong buy language", () => {
    expect(normalizeRating("Strong Buy")).toBe("STRONG_BUY");
    expect(normalizeRating("Conviction Buy")).toBe("STRONG_BUY");
    expect(normalizeRating("Top Pick")).toBe("STRONG_BUY");
  });

  it("maps common buy, hold, and sell language", () => {
    expect(normalizeRating("Overweight")).toBe("BUY");
    expect(normalizeRating("Market Perform")).toBe("HOLD");
    expect(normalizeRating("Reduce")).toBe("SELL");
    expect(normalizeRating("Strong Sell")).toBe("STRONG_SELL");
  });

  it("defaults unknown ratings to hold", () => {
    expect(normalizeRating("Peer Perform")).toBe("HOLD");
  });
});
