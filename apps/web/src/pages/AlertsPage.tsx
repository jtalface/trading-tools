import { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { apiGet, apiSend } from "../lib/api";

type AlertsPayload = { alerts: Array<{ id: string; ticker: string; type: string; threshold?: string; enabled: boolean }> };

export function AlertsPage() {
  const [data, setData] = useState<AlertsPayload>({ alerts: [] });
  const [ticker, setTicker] = useState("AAPL");
  const [threshold, setThreshold] = useState("200");
  const load = () => apiGet<AlertsPayload>("/api/alerts").then(setData);
  useEffect(() => { load().catch(console.error); }, []);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    await apiSend("/api/alerts", "POST", { ticker, type: "PRICE_ABOVE", threshold, enabled: true });
    await load();
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Alerts</h1><p className="text-sm text-steel">In-app alerts for price, rating changes, price targets, sentiment, volume, and earnings dates.</p></div>
      <Card title="Create Alert">
        <form onSubmit={create} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input className="rounded-md border border-line px-3 py-2" value={ticker} onChange={(event) => setTicker(event.target.value)} />
          <input className="rounded-md border border-line px-3 py-2" value={threshold} onChange={(event) => setThreshold(event.target.value)} />
          <button className="rounded-md bg-ink px-5 py-2 text-white">Create</button>
        </form>
      </Card>
      <Card title="Active Alerts">
        <div className="space-y-2">
          {data.alerts.map((alert) => <div key={alert.id} className="flex justify-between rounded-md border border-line p-3"><span>{alert.ticker} · {alert.type}</span><span className="text-steel">{alert.threshold}</span></div>)}
          {data.alerts.length === 0 && <p className="text-sm text-steel">No alerts yet.</p>}
        </div>
      </Card>
    </div>
  );
}
