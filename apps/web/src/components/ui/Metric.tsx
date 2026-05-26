export function Metric({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "up" | "down" | "warn" }) {
  const toneClass = tone === "up" ? "text-mint" : tone === "down" ? "text-berry" : tone === "warn" ? "text-amber" : "text-ink";
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-steel">{label}</div>
      <div className={`number mt-1 text-2xl font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}
