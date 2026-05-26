import { Activity, Bell, BriefcaseBusiness, Gauge, LineChart, Search, Settings, Star } from "lucide-react";

const items = [
  { id: "dashboard", label: "Dashboard", icon: Gauge },
  { id: "search", label: "Search", icon: Search },
  { id: "stock", label: "Stock Detail", icon: LineChart },
  { id: "portfolio", label: "Portfolio", icon: BriefcaseBusiness },
  { id: "watchlists", label: "Watchlists", icon: Star },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "ratings", label: "Ratings", icon: Activity },
  { id: "settings", label: "Settings", icon: Settings }
];

export function Layout({ active, onNavigate, children }: { active: string; onNavigate: (page: string) => void; children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-white px-4 py-5 lg:block">
        <div className="mb-8">
          <div className="text-lg font-bold text-ink">Trading Intelligence</div>
          <div className="text-sm text-steel">Research and monitoring suite</div>
        </div>
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium ${active === item.id ? "bg-ink text-white" : "text-steel hover:bg-slate-100"}`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <p className="absolute bottom-5 left-4 right-4 text-xs leading-5 text-steel">
          This application is for research and informational purposes only. It does not provide financial advice, investment recommendations, or trading execution.
        </p>
      </aside>
      <main className="lg:pl-64">
        <div className="border-b border-line bg-white px-4 py-3 lg:hidden">
          <select className="w-full rounded-md border border-line px-3 py-2" value={active} onChange={(event) => onNavigate(event.target.value)}>
            {items.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
