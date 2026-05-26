import { PrismaClient, SourceCategory } from "@prisma/client";

const prisma = new PrismaClient();

const firms: Array<{ name: string; category: SourceCategory; website?: string }> = [
  { name: "Goldman Sachs", category: "SELL_SIDE", website: "https://www.goldmansachs.com" },
  { name: "Morgan Stanley", category: "SELL_SIDE", website: "https://www.morganstanley.com" },
  { name: "JPMorgan", category: "SELL_SIDE", website: "https://www.jpmorgan.com" },
  { name: "Morningstar", category: "INDEPENDENT", website: "https://www.morningstar.com" },
  { name: "CFRA", category: "INDEPENDENT", website: "https://www.cfraresearch.com" },
  { name: "Zacks Investment Research", category: "INDEPENDENT", website: "https://www.zacks.com" },
  { name: "TipRanks", category: "AGGREGATOR", website: "https://www.tipranks.com" },
  { name: "Benzinga", category: "AGGREGATOR", website: "https://www.benzinga.com" },
  { name: "FMP", category: "AGGREGATOR", website: "https://financialmodelingprep.com" }
];

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@trading-tools.local" },
    update: {},
    create: { email: "demo@trading-tools.local", passwordHash: "demo-only" }
  });

  const portfolio = await prisma.portfolio.upsert({
    where: { id: "demo-portfolio" },
    update: {},
    create: { id: "demo-portfolio", userId: user.id, name: "Demo Research Portfolio", baseCurrency: "USD" }
  });

  await Promise.all(firms.map((firm) => prisma.analystFirm.upsert({
    where: { name: firm.name },
    update: firm,
    create: firm
  })));

  await prisma.holding.createMany({
    data: [
      { portfolioId: portfolio.id, ticker: "AAPL", companyName: "Apple Inc.", quantity: 12, averageCost: 168.25, strategyTag: "core" },
      { portfolioId: portfolio.id, ticker: "NVDA", companyName: "NVIDIA Corporation", quantity: 5, averageCost: 720.5, strategyTag: "growth" },
      { portfolioId: portfolio.id, ticker: "JPM", companyName: "JPMorgan Chase & Co.", quantity: 18, averageCost: 182.1, strategyTag: "financials" }
    ],
    skipDuplicates: true
  });
}

main().finally(async () => prisma.$disconnect());
