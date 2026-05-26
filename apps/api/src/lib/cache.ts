type CacheValue<T> = {
  expiresAt: number;
  staleUntil: number;
  value: T;
};

const cache = new Map<string, CacheValue<unknown>>();

export async function cached<T>(key: string, ttlSeconds: number, loader: () => Promise<T>, staleSeconds = ttlSeconds): Promise<T> {
  const existing = cache.get(key);
  if (existing && existing.expiresAt > Date.now()) {
    return existing.value as T;
  }
  try {
    const value = await loader();
    const now = Date.now();
    cache.set(key, {
      value,
      expiresAt: now + ttlSeconds * 1000,
      staleUntil: now + staleSeconds * 1000
    });
    return value;
  } catch (error) {
    if (existing && existing.staleUntil > Date.now()) {
      return existing.value as T;
    }
    throw error;
  }
}

export function cacheStatus() {
  return {
    mode: "memory",
    entries: cache.size
  };
}
