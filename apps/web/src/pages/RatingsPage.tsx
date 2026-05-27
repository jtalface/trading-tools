import { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { apiGet, formatCurrency } from "../lib/api";

type Rating = { firmName: string; firmCategory: string; actionType: string; originalRating: string; normalizedRating: string; priceTarget?: number; ratingDate: string };
type RatingsResponse = Rating[] | { ratings: Rating[]; providerWarnings?: Array<{ provider: string; message: string }> };

export function RatingsPage({ ticker }: { ticker: string }) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [warnings, setWarnings] = useState<Array<{ provider: string; message: string }>>([]);
  useEffect(() => {
    apiGet<RatingsResponse>(`/api/stocks/${ticker}/ratings`).then((payload) => {
      if (Array.isArray(payload)) {
        setRatings(payload);
        setWarnings([]);
      } else {
        setRatings(payload.ratings);
        setWarnings(payload.providerWarnings ?? []);
      }
    }).catch(console.error);
  }, [ticker]);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Ratings Intelligence</h1><p className="text-sm text-steel">Filter and inspect upgrades, downgrades, source categories, and reliability placeholders.</p></div>
      {warnings.length > 0 && (
        <Card title="Provider Warnings">
          <div className="space-y-2 text-sm text-amber">
            {warnings.map((warning) => <p key={`${warning.provider}-${warning.message}`}>{warning.provider}: {warning.message}</p>)}
          </div>
        </Card>
      )}
      <Card title={`Tracked Ratings · ${ticker}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-steel"><tr><th className="py-2">Firm</th><th>Category</th><th>Action</th><th>Original</th><th>Normalized</th><th>Target</th><th>Reliability</th></tr></thead>
            <tbody>
              {ratings.map((rating) => (
                <tr key={`${rating.firmName}-${rating.ratingDate}`} className="border-t border-line">
                  <td className="py-3 font-medium">{rating.firmName}</td>
                  <td>{rating.firmCategory}</td>
                  <td>{rating.actionType}</td>
                  <td>{rating.originalRating}</td>
                  <td>{rating.normalizedRating}</td>
                  <td>{rating.priceTarget ? formatCurrency(rating.priceTarget) : "N/A"}</td>
                  <td>Placeholder</td>
                </tr>
              ))}
            </tbody>
          </table>
          {ratings.length === 0 && <p className="py-6 text-sm text-steel">No analyst ratings are available from the configured providers.</p>}
        </div>
      </Card>
    </div>
  );
}
