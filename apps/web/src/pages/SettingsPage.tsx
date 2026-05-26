import { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { apiGet } from "../lib/api";

type ProviderStatus = {
  keys: Record<string, boolean>;
  active: Record<string, string>;
  freshnessPolicy: Record<string, string>;
  cache: { mode: string; entries: number };
};

export function SettingsPage() {
  const [status, setStatus] = useState<ProviderStatus>();
  useEffect(() => { apiGet<ProviderStatus>("/api/provider-status").then(setStatus).catch(console.error); }, []);
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Settings</h1><p className="text-sm text-steel">Provider status, API key configuration, cache status, and data freshness.</p></div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="API Keys">
          <div className="space-y-2">{Object.entries(status?.keys ?? {}).map(([key, enabled]) => <Row key={key} label={key} value={enabled ? "Configured" : "Missing"} tone={enabled ? "text-mint" : "text-amber"} />)}</div>
        </Card>
        <Card title="Active Providers">
          <div className="space-y-2">{Object.entries(status?.active ?? {}).map(([key, value]) => <Row key={key} label={key} value={value} />)}</div>
        </Card>
        <Card title="Freshness Policy">
          <div className="space-y-2">{Object.entries(status?.freshnessPolicy ?? {}).map(([key, value]) => <Row key={key} label={key} value={value} />)}</div>
        </Card>
        <Card title="Cache">
          <Row label="Mode" value={status?.cache.mode ?? "memory"} />
          <Row label="Entries" value={String(status?.cache.entries ?? 0)} />
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, tone = "text-ink" }: { label: string; value: string; tone?: string }) {
  return <div className="flex justify-between border-b border-line pb-2 text-sm"><span className="text-steel">{label}</span><span className={`font-medium ${tone}`}>{value}</span></div>;
}
