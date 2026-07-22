import type { DashboardData, ProductCategory } from "./types";

export interface CategoryFreshness {
  lastScraped: string | null;
  liveCount: number;
  totalQuotes: number;
}

function maxIso(a: string | null, b: string | undefined): string | null {
  if (!b) return a;
  if (!a) return b;
  return new Date(b) > new Date(a) ? b : a;
}

function scanMarkets(
  markets: { live?: boolean; scrapedAt?: string }[]
): { last: string | null; live: number } {
  let last: string | null = null;
  let live = 0;
  for (const m of markets) {
    if (m.live) live++;
    last = maxIso(last, m.scrapedAt);
  }
  return { last, live };
}

export function getCategoryFreshness(
  data: DashboardData
): Record<ProductCategory, CategoryFreshness> {
  const result: Record<ProductCategory, CategoryFreshness> = {
    sealed: { lastScraped: null, liveCount: 0, totalQuotes: 0 },
    graded: { lastScraped: null, liveCount: 0, totalQuotes: 0 },
    raw: { lastScraped: null, liveCount: 0, totalQuotes: 0 },
    accessory: { lastScraped: null, liveCount: 0, totalQuotes: 0 },
  };

  for (const p of data.sealed) {
    const s = scanMarkets(p.markets);
    result.sealed.lastScraped = maxIso(result.sealed.lastScraped, s.last ?? undefined);
    result.sealed.liveCount += s.live;
    result.sealed.totalQuotes += p.markets.length;
  }

  for (const c of data.graded) {
    for (const g of c.grades) {
      const s = scanMarkets(g.markets);
      result.graded.lastScraped = maxIso(result.graded.lastScraped, s.last ?? undefined);
      result.graded.liveCount += s.live;
      result.graded.totalQuotes += g.markets.length;
    }
  }

  for (const c of data.raw ?? []) {
    const s = scanMarkets(c.markets);
    result.raw.lastScraped = maxIso(result.raw.lastScraped, s.last ?? undefined);
    result.raw.liveCount += s.live;
    result.raw.totalQuotes += c.markets.length;
  }

  for (const p of data.accessory ?? []) {
    const s = scanMarkets(p.markets);
    result.accessory.lastScraped = maxIso(result.accessory.lastScraped, s.last ?? undefined);
    result.accessory.liveCount += s.live;
    result.accessory.totalQuotes += p.markets.length;
  }

  return result;
}

export function formatFreshnessLabel(lastScraped: string | null): string {
  if (!lastScraped) return "—";
  const ageMs = Date.now() - new Date(lastScraped).getTime();
  const min = Math.round(ageMs / 60000);
  if (min < 1) return "adesso";
  if (min < 60) return `${min}m fa`;
  const h = Math.round(min / 60);
  if (h < 48) return `${h}h fa`;
  return new Date(lastScraped).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
}
