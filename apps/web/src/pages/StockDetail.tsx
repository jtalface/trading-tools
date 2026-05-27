import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "../components/ui/Card";
import { Metric } from "../components/ui/Metric";
import { apiGet, formatCurrency, formatPercent, timeAgo } from "../lib/api";

type StockDetailResponse = {
  profile: { ticker: string; companyName: string; sector?: string; industry?: string };
  quote: { price: number; change: number; changePercent: number; timestamp: string; provider: string; volume?: number };
  consensus: { consensusLabel: string; averagePriceTarget?: number; numberOfAnalysts: number; upsidePercent?: number };
  fundamentals: Record<string, number | string | undefined>;
  ratings: Array<{ firmName: string; firmCategory: string; actionType: string; originalRating: string; priceTarget?: number; ratingDate: string }>;
  news: Array<{ title: string; source: string; publishedAt: string; sentiment?: string }>;
  intelligence: Record<string, number | string | Record<string, string>>;
  disclaimer: string;
};

export function StockDetail({ ticker }: { ticker: string }) {
  const [detail, setDetail] = useState<StockDetailResponse>();
  const [history, setHistory] = useState<Array<{ date: string; close: number }>>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    Promise.all([
      apiGet<StockDetailResponse>(`/api/stocks/${ticker}`),
      apiGet<Array<{ date: string; close: number }>>(`/api/stocks/${ticker}/history?range=YTD`)
    ]).then(([stock, prices]) => {
      setDetail(stock);
      setHistory(prices);
    }).catch((err) => setError(err instanceof Error ? err.message : "Unable to load stock"));
  }, [ticker]);

  if (error) return <Card><p className="text-berry">{error}</p></Card>;
  if (!detail) return <Skeleton title={`Loading ${ticker}`} />;

  const signalSummary = detail.intelligence.signalSummary as Record<string, string>;
  const profileMeta = [detail.profile.sector, detail.profile.industry].filter(Boolean).join(" · ");

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-bold text-ink">{detail.profile.ticker} · {detail.profile.companyName}</h1>
          <p className="text-sm text-steel">{profileMeta ? `${profileMeta} · ` : ""}{timeAgo(detail.quote.timestamp)} via {detail.quote.provider}</p>
        </div>
        <p className="max-w-xl text-xs leading-5 text-steel">{detail.disclaimer}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><Metric label="Price" value={formatCurrency(detail.quote.price)} size="compact" /></Card>
        <Card><Metric label="Day Change" value={`${formatCurrency(detail.quote.change)} (${formatPercent(detail.quote.changePercent)})`} tone={detail.quote.change >= 0 ? "up" : "down"} size="compact" /></Card>
        <Card><Metric label="Consensus" value={detail.consensus.consensusLabel.replace("_", " ")} size="compact" /></Card>
        <Card><Metric label="Target Upside" value={formatPercent(detail.consensus.upsidePercent)} tone={(detail.consensus.upsidePercent ?? 0) >= 0 ? "up" : "down"} size="compact" /></Card>
      </div>
      <Card title="Historical Performance">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <XAxis dataKey="date" minTickGap={32} />
              <YAxis domain={["auto", "auto"]} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Line type="monotone" dataKey="close" stroke="#1f9d7a" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Analyst Intelligence">
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Analysts" value={String(detail.consensus.numberOfAnalysts)} />
            <Metric label="Avg Target" value={formatCurrency(detail.consensus.averagePriceTarget)} />
            <Metric label="Disagreement" value={String(detail.intelligence.ratingDisagreementScore)} tone="warn" />
          </div>
          <table className="mt-5 w-full text-sm">
            <thead className="text-left text-steel"><tr><th className="py-2">Firm</th><th>Action</th><th>Rating</th><th>Target</th></tr></thead>
            <tbody>
              {detail.ratings.map((rating) => (
                <tr key={`${rating.firmName}-${rating.ratingDate}`} className="border-t border-line">
                  <td className="py-2">{rating.firmName}<div className="text-xs text-steel">{rating.firmCategory}</div></td>
                  <td>{rating.actionType}</td>
                  <td>{rating.originalRating}</td>
                  <td>{rating.priceTarget ? formatCurrency(rating.priceTarget) : "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card title="Signal Summary">
          <div className="grid gap-3">
            {Object.entries(signalSummary).map(([key, value]) => (
              <div key={key} className="rounded-md border border-line p-3">
                <div className="text-xs font-medium uppercase text-steel">{key}</div>
                <div className="mt-1 font-semibold text-ink">{value}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Fundamentals">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {["peRatio", "forwardPe", "pegRatio", "priceToSales", "priceToBook", "debtToEquity", "grossMargin", "operatingMargin"].map((key) => (
              <div key={key} className="border-b border-line pb-2"><span className="text-steel">{key}</span><div className="number font-medium">{String(detail.fundamentals[key] ?? "N/A")}</div></div>
            ))}
          </div>
        </Card>
        <Card title="News Sentiment">
          <div className="space-y-3">
            {detail.news.map((item) => (
              <div key={item.title} className="border-b border-line pb-3">
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-steel">{item.source} · {item.sentiment ?? "NEUTRAL"}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Skeleton({ title }: { title: string }) {
  return <div className="space-y-4"><h1 className="text-2xl font-bold">{title}</h1><div className="h-80 animate-pulse rounded-lg bg-slate-200" /></div>;
}
