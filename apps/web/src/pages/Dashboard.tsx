import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "../components/ui/Card";
import { Metric } from "../components/ui/Metric";
import { apiGet, formatCurrency } from "../lib/api";

type PortfolioResponse = {
  portfolios: Array<{
    id: string;
    name: string;
    summary: {
      totalMarketValue: number;
      dailyGainLoss: number;
      totalUnrealizedGainLoss: number;
      holdings: Array<{ ticker: string; marketValue: number; dayGainLoss: number }>;
      concentrationWarnings: string[];
    };
  }>;
};

export function Dashboard() {
  const [data, setData] = useState<PortfolioResponse>();

  useEffect(() => {
    apiGet<PortfolioResponse>("/api/portfolio").then(setData).catch(console.error);
  }, []);

  const portfolio = data?.portfolios[0];
  const holdings = portfolio?.summary.holdings ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
        <p className="text-sm text-steel">Portfolio intelligence, watchlist movement, ratings changes, and alert context.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><Metric label="Portfolio Value" value={formatCurrency(portfolio?.summary.totalMarketValue)} /></Card>
        <Card><Metric label="Daily P/L" value={formatCurrency(portfolio?.summary.dailyGainLoss)} tone={(portfolio?.summary.dailyGainLoss ?? 0) >= 0 ? "up" : "down"} /></Card>
        <Card><Metric label="Unrealized P/L" value={formatCurrency(portfolio?.summary.totalUnrealizedGainLoss)} tone={(portfolio?.summary.totalUnrealizedGainLoss ?? 0) >= 0 ? "up" : "down"} /></Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card title="Allocation By Holding">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={holdings}>
                <XAxis dataKey="ticker" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="marketValue" fill="#1f9d7a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Monitoring">
          <div className="space-y-3 text-sm">
            <Info label="Top movers" value={holdings.sort((a, b) => Math.abs(b.dayGainLoss) - Math.abs(a.dayGainLoss))[0]?.ticker ?? "No holdings"} />
            <Info label="Rating changes" value="3 recent demo actions" />
            <Info label="Upcoming earnings" value="Connect provider for live calendar" />
            <Info label="Watchlist movers" value="MSFT in primary watchlist" />
            <Info label="Alerts" value="In-app alerts ready" />
            {portfolio?.summary.concentrationWarnings.map((warning) => <p key={warning} className="rounded-md bg-amber/10 p-3 text-amber">{warning}</p>)}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 border-b border-line pb-2"><span className="text-steel">{label}</span><span className="font-medium text-ink">{value}</span></div>;
}
