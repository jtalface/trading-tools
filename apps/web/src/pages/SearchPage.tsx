import { Search } from "lucide-react";
import { useState } from "react";
import type { StockSearchResult } from "@trading-tools/shared";
import { Card } from "../components/ui/Card";
import { apiGet } from "../lib/api";

export function SearchPage({ onSelect }: { onSelect: (ticker: string) => void }) {
  const [query, setQuery] = useState("AAPL");
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const payload = await apiGet<{ results: StockSearchResult[] }>(`/api/stocks/search?q=${encodeURIComponent(query)}`);
      setResults(payload.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Stock Search</h1>
        <p className="text-sm text-steel">Search by ticker or company name with provider-backed autocomplete.</p>
      </div>
      <Card>
        <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-steel" size={18} />
            <input className="w-full rounded-md border border-line py-2 pl-10 pr-3" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ticker or company name" />
          </div>
          <button className="rounded-md bg-ink px-5 py-2 font-medium text-white">Search</button>
        </form>
        {error && <p className="mt-3 rounded-md bg-berry/10 p-3 text-sm text-berry">{error}</p>}
      </Card>
      <div className="grid gap-3">
        {results.map((result) => (
          <button key={result.ticker} onClick={() => onSelect(result.ticker)} className="rounded-lg border border-line bg-white p-4 text-left shadow-soft hover:border-ink">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold">{result.ticker}</div>
                <div className="text-sm text-steel">{result.companyName}</div>
              </div>
              <div className="text-sm text-steel">{result.exchange}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
