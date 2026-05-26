import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "../components/ui/Card";
import { Metric } from "../components/ui/Metric";
import { apiGet, apiSend, formatCurrency, formatPercent } from "../lib/api";

type PortfolioPayload = {
  portfolios: Array<{
    id: string;
    name: string;
    summary: {
      totalMarketValue: number;
      totalUnrealizedGainLoss: number;
      dailyGainLoss: number;
      holdings: Array<{ id: string; ticker: string; quantity: number; averageCost: number; currentPrice: number; marketValue: number; dayGainLoss: number; unrealizedGainLoss: number; allocationPercent: number; sector?: string }>;
    };
  }>;
};

export function PortfolioPage() {
  const [data, setData] = useState<PortfolioPayload>();
  const [ticker, setTicker] = useState("");

  const load = () => apiGet<PortfolioPayload>("/api/portfolio").then(setData);
  useEffect(() => { load().catch(console.error); }, []);
  const portfolio = data?.portfolios[0];

  async function addHolding(event: React.FormEvent) {
    event.preventDefault();
    if (!portfolio || !ticker) return;
    await apiSend(`/api/portfolio/${portfolio.id}/holdings`, "POST", { ticker, quantity: 1, averageCost: 100, strategyTag: "watch" });
    setTicker("");
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <p className="text-sm text-steel">Manual holdings, live value, allocation, and concentration risk.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><Metric label="Market Value" value={formatCurrency(portfolio?.summary.totalMarketValue)} /></Card>
        <Card><Metric label="Daily P/L" value={formatCurrency(portfolio?.summary.dailyGainLoss)} tone={(portfolio?.summary.dailyGainLoss ?? 0) >= 0 ? "up" : "down"} /></Card>
        <Card><Metric label="Unrealized P/L" value={formatCurrency(portfolio?.summary.totalUnrealizedGainLoss)} tone={(portfolio?.summary.totalUnrealizedGainLoss ?? 0) >= 0 ? "up" : "down"} /></Card>
      </div>
      <Card title="Holdings" action={<form onSubmit={addHolding} className="flex gap-2"><input className="w-28 rounded-md border border-line px-3 py-2" value={ticker} onChange={(event) => setTicker(event.target.value)} placeholder="Ticker" /><button className="rounded-md bg-ink px-3 py-2 text-white" title="Add holding"><Plus size={18} /></button></form>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="text-left text-steel"><tr><th className="py-2">Ticker</th><th>Shares</th><th>Avg Cost</th><th>Live Price</th><th>Market Value</th><th>Day P/L</th><th>Unrealized</th><th>Allocation</th></tr></thead>
            <tbody>
              {portfolio?.summary.holdings.map((holding) => (
                <tr key={holding.id} className="border-t border-line">
                  <td className="py-3 font-semibold">{holding.ticker}<div className="text-xs font-normal text-steel">{holding.sector ?? "Unknown"}</div></td>
                  <td>{holding.quantity}</td>
                  <td>{formatCurrency(holding.averageCost)}</td>
                  <td>{formatCurrency(holding.currentPrice)}</td>
                  <td>{formatCurrency(holding.marketValue)}</td>
                  <td>{formatCurrency(holding.dayGainLoss)}</td>
                  <td>{formatCurrency(holding.unrealizedGainLoss)}</td>
                  <td>{formatPercent(holding.allocationPercent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card title="Allocation">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={portfolio?.summary.holdings ?? []} dataKey="marketValue" nameKey="ticker" outerRadius={100} fill="#1f9d7a" label />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
