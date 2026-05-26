import type { NormalizedRating } from "@trading-tools/shared";

const ratingMap: Array<[NormalizedRating, RegExp[]]> = [
  ["STRONG_BUY", [/^strong buy$/i, /conviction buy/i, /top pick/i, /outperform.*high conviction/i]],
  ["BUY", [/^buy$/i, /^outperform$/i, /^overweight$/i, /^accumulate$/i, /market outperform/i]],
  ["HOLD", [/^hold$/i, /^neutral$/i, /equal weight/i, /market perform/i, /sector perform/i]],
  ["SELL", [/^sell$/i, /^underperform$/i, /^underweight$/i, /^reduce$/i]],
  ["STRONG_SELL", [/strong sell/i]]
];

export function normalizeRating(originalRating: string): NormalizedRating {
  const value = originalRating.trim();
  for (const [normalized, patterns] of ratingMap) {
    if (patterns.some((pattern) => pattern.test(value))) {
      return normalized;
    }
  }
  return "HOLD";
}

export function ratingLabel(rating: NormalizedRating | "MIXED"): string {
  return rating
    .split("_")
    .map((part) => part[0] + part.slice(1).toLowerCase())
    .join(" ");
}
