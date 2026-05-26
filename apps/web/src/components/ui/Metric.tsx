export function Metric({
  label,
  value,
  tone = "neutral",
  size = "default"
}: {
  label: string;
  value: string;
  tone?: "neutral" | "up" | "down" | "warn";
  size?: "default" | "compact";
}) {
  const toneClass = tone === "up" ? "text-mint" : tone === "down" ? "text-berry" : tone === "warn" ? "text-amber" : "text-ink";
  const sizeClass = size === "compact" ? "text-xl sm:text-2xl" : "text-2xl";
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-steel">{label}</div>
      <div className={`number mt-1 font-semibold ${sizeClass} ${toneClass}`}>{value}</div>
    </div>
  );
}
