type CacheValue<T> = {
  expiresAt: number;
  value: T;
};

const cache = new Map<string, CacheValue<unknown>>();

export async function cached<T>(key: string, ttlSeconds: number, loader: () => Promise<T>): Promise<T> {
  const existing = cache.get(key);
  if (existing && existing.expiresAt > Date.now()) {
    return existing.value as T;
  }
  const value = await loader();
  cache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  return value;
}

export function cacheStatus() {
  return {
    mode: "memory",
    entries: cache.size
  };
}
