import type { AnalystDataProvider, Earnings, FundamentalsProvider, PriceTarget } from "./interfaces.js";
import type { AnalystRating, ConsensusRating, Fundamentals } from "@trading-tools/shared";
import { ProviderConfigurationError } from "./unavailableProvider.js";

class EnterprisePlaceholder {
  constructor(public name: string, private reason: string) {}

  protected unavailable(): never {
    throw new ProviderConfigurationError(this.name, this.reason);
  }
}

export class TipRanksProvider extends EnterprisePlaceholder implements AnalystDataProvider {
  constructor() { super("tipranks", "requires licensed Nasdaq Data Link or Intrinio feed"); }
  getAnalystRatings(_ticker: string): Promise<AnalystRating[]> { this.unavailable(); }
  getConsensusRating(_ticker: string): Promise<ConsensusRating> { this.unavailable(); }
  getPriceTargets(_ticker: string): Promise<PriceTarget[]> { this.unavailable(); }
}

export class ZacksProvider extends EnterprisePlaceholder implements AnalystDataProvider {
  constructor() { super("zacks", "requires licensed Nasdaq Data Link or Intrinio feed"); }
  getAnalystRatings(_ticker: string): Promise<AnalystRating[]> { this.unavailable(); }
  getConsensusRating(_ticker: string): Promise<ConsensusRating> { this.unavailable(); }
  getPriceTargets(_ticker: string): Promise<PriceTarget[]> { this.unavailable(); }
}

export class FactSetProvider extends EnterprisePlaceholder implements AnalystDataProvider, FundamentalsProvider {
  constructor() { super("factset", "enterprise integration placeholder"); }
  getAnalystRatings(_ticker: string): Promise<AnalystRating[]> { this.unavailable(); }
  getConsensusRating(_ticker: string): Promise<ConsensusRating> { this.unavailable(); }
  getPriceTargets(_ticker: string): Promise<PriceTarget[]> { this.unavailable(); }
  getFundamentals(_ticker: string): Promise<Fundamentals> { this.unavailable(); }
  getEarnings(_ticker: string): Promise<Earnings[]> { this.unavailable(); }
}

export class LsegIbesProvider extends EnterprisePlaceholder implements AnalystDataProvider {
  constructor() { super("lseg-ibes", "enterprise integration placeholder"); }
  getAnalystRatings(_ticker: string): Promise<AnalystRating[]> { this.unavailable(); }
  getConsensusRating(_ticker: string): Promise<ConsensusRating> { this.unavailable(); }
  getPriceTargets(_ticker: string): Promise<PriceTarget[]> { this.unavailable(); }
}
