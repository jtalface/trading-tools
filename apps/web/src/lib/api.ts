export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(payload.error ?? "Request failed");
  }
  return response.json() as Promise<T>;
}

export async function apiSend<T>(path: string, method: "POST" | "PATCH" | "DELETE", body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  if (!response.ok && response.status !== 204) {
    const payload = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(payload.error ?? "Request failed");
  }
  return response.status === 204 ? (undefined as T) : (response.json() as Promise<T>);
}

export function formatCurrency(value?: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value ?? 0);
}

export function formatPercent(value?: number) {
  return `${(value ?? 0).toFixed(2)}%`;
}

export function timeAgo(timestamp?: string) {
  if (!timestamp) return "Updated just now";
  const seconds = Math.max(1, Math.round((Date.now() - new Date(timestamp).getTime()) / 1000));
  if (seconds < 60) return `Updated ${seconds} seconds ago`;
  const minutes = Math.round(seconds / 60);
  return `Updated ${minutes} minutes ago`;
}
