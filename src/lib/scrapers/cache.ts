import type { ScrapeResult } from "./types";

interface CacheEntry {
  result: ScrapeResult;
  expiresAt: number;
}

const store = new Map<string, CacheEntry>();

export function cacheKey(source: string, productId: string, extra = ""): string {
  return `${source}:${productId}:${extra}`;
}

export function getCached(key: string): ScrapeResult | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.result;
}

export function setCached(key: string, result: ScrapeResult, ttlSeconds: number): void {
  store.set(key, {
    result,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export function clearScraperCache(): void {
  store.clear();
}
