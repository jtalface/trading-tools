import { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { apiGet, apiSend } from "../lib/api";

type WatchlistsPayload = { watchlists: Array<{ id: string; name: string; items: Array<{ ticker: string; notes?: string }> }> };

export function WatchlistsPage() {
  const [data, setData] = useState<WatchlistsPayload>();
  const [ticker, setTicker] = useState("");
  const load = () => apiGet<WatchlistsPayload>("/api/watchlists").then(setData);
  useEffect(() => { load().catch(console.error); }, []);
  const list = data?.watchlists[0];

  async function add(event: React.FormEvent) {
    event.preventDefault();
    if (!list || !ticker) return;
    await apiSend(`/api/watchlists/${list.id}/items`, "POST", { ticker });
    setTicker("");
    await load();
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Watchlists</h1><p className="text-sm text-steel">Track price, daily change, consensus rating, and target upside.</p></div>
      <Card title={list?.name ?? "Watchlist"} action={<form onSubmit={add} className="flex gap-2"><input className="w-28 rounded-md border border-line px-3 py-2" value={ticker} onChange={(event) => setTicker(event.target.value)} placeholder="Ticker" /><button className="rounded-md bg-ink px-4 py-2 text-white">Add</button></form>}>
        <div className="grid gap-3 md:grid-cols-3">
          {list?.items.map((item) => <div key={item.ticker} className="rounded-md border border-line p-4"><div className="font-semibold">{item.ticker}</div><div className="text-sm text-steel">Consensus and target upside load from stock detail.</div></div>)}
        </div>
      </Card>
    </div>
  );
}
