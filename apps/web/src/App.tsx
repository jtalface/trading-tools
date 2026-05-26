import { useState } from "react";
import { Layout } from "./components/Layout";
import { AlertsPage } from "./pages/AlertsPage";
import { Dashboard } from "./pages/Dashboard";
import { PortfolioPage } from "./pages/PortfolioPage";
import { RatingsPage } from "./pages/RatingsPage";
import { SearchPage } from "./pages/SearchPage";
import { SettingsPage } from "./pages/SettingsPage";
import { StockDetail } from "./pages/StockDetail";
import { WatchlistsPage } from "./pages/WatchlistsPage";

export function App() {
  const [page, setPage] = useState("dashboard");
  const [ticker, setTicker] = useState("AAPL");

  function selectTicker(nextTicker: string) {
    setTicker(nextTicker);
    setPage("stock");
  }

  return (
    <Layout active={page} onNavigate={setPage}>
      {page === "dashboard" && <Dashboard />}
      {page === "search" && <SearchPage onSelect={selectTicker} />}
      {page === "stock" && <StockDetail ticker={ticker} />}
      {page === "portfolio" && <PortfolioPage />}
      {page === "watchlists" && <WatchlistsPage />}
      {page === "alerts" && <AlertsPage />}
      {page === "ratings" && <RatingsPage ticker={ticker} />}
      {page === "settings" && <SettingsPage />}
    </Layout>
  );
}
