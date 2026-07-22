import type {
  DashboardData,
  DashboardStats,
  GradedCard,
  MarketRegion,
  ProductFilters,
  SealedProduct,
} from "./types";
import { GRADED_CARDS, SEALED_PRODUCTS } from "./mock-data";
import {
  getAllMarketQuotesFromGraded,
  getGradedMarket,
  getMarketQuote,
  getMaxChange7dForRegion,
  getMaxPriceForRegion,
  getPrimaryMarketQuote,
  getSealedMarket,
} from "./market-utils";

function computeStats(
  sealed: SealedProduct[],
  graded: GradedCard[]
): DashboardStats {
  const itChanges = [
    ...sealed.map((p) => {
      const m = getSealedMarket(p, "IT");
      return m ? { name: p.name, change: m.change7d, region: "IT" as const } : null;
    }),
    ...graded.flatMap((c) =>
      c.grades.map((g) => {
        const m = getGradedMarket(g, "IT");
        return m
          ? {
              name: `${c.name} ${g.company} ${g.grade}`,
              change: m.change7d,
              region: "IT" as const,
            }
          : null;
      })
    ),
  ].filter(Boolean) as { name: string; change: number; region: MarketRegion }[];

  const intlChanges = [
    ...sealed.map((p) => {
      const m = getSealedMarket(p, "INTL");
      return m
        ? { name: p.name, change: m.change7d, region: "INTL" as const }
        : null;
    }),
    ...graded.flatMap((c) =>
      c.grades.map((g) => {
        const m = getGradedMarket(g, "INTL");
        return m
          ? {
              name: `${c.name} ${g.company} ${g.grade}`,
              change: m.change7d,
              region: "INTL" as const,
            }
          : null;
      })
    ),
  ].filter(Boolean) as { name: string; change: number; region: MarketRegion }[];

  const allChanges = [...itChanges, ...intlChanges];
  const sorted = [...allChanges].sort((a, b) => b.change - a.change);

  const avg = (items: typeof allChanges) =>
    items.length
      ? Math.round(
          (items.reduce((sum, i) => sum + i.change, 0) / items.length) * 10
        ) / 10
      : 0;

  return {
    totalProducts: sealed.length + graded.length,
    sealedCount: sealed.length,
    gradedCount: graded.length,
    avgChange7dIT: avg(itChanges),
    avgChange7dINTL: avg(intlChanges),
    topGainer: sorted[0] ?? null,
    topLoser: sorted[sorted.length - 1] ?? null,
  };
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const sealed = [...SEALED_PRODUCTS];
  const graded = [...GRADED_CARDS];

  return {
    stats: computeStats(sealed, graded),
    sealed,
    graded,
    lastUpdated: new Date().toISOString(),
  };
}

function sortRegion(filters: ProductFilters): MarketRegion {
  if (filters.market === "INTL") return "INTL";
  return "IT";
}

export function filterSealedProducts(
  products: SealedProduct[],
  filters: ProductFilters
): SealedProduct[] {
  let result = [...products];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.set.toLowerCase().includes(q) ||
        p.setCode.toLowerCase().includes(q)
    );
  }

  const region = sortRegion(filters);

  result.sort((a, b) => {
    const ma = getSealedMarket(a, region) ?? getPrimaryMarketQuote(a.markets);
    const mb = getSealedMarket(b, region) ?? getPrimaryMarketQuote(b.markets);

    let cmp = 0;
    switch (filters.sortField) {
      case "name":
        cmp = a.name.localeCompare(b.name);
        break;
      case "price":
        cmp = ma.price - mb.price;
        break;
      case "change7d":
        cmp = ma.change7d - mb.change7d;
        break;
      case "change30d":
        cmp = ma.change30d - mb.change30d;
        break;
    }
    return filters.sortDirection === "asc" ? cmp : -cmp;
  });

  return result;
}

export function filterGradedCards(
  cards: GradedCard[],
  filters: ProductFilters
): GradedCard[] {
  let result = [...cards];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.set.toLowerCase().includes(q) ||
        c.cardNumber.toLowerCase().includes(q)
    );
  }

  if (filters.gradingCompany) {
    result = result.filter((c) =>
      c.grades.some((g) => g.company === filters.gradingCompany)
    );
  }

  const region = sortRegion(filters);

  result.sort((a, b) => {
    const priceA = getMaxPriceForRegion(a, region);
    const priceB = getMaxPriceForRegion(b, region);
    const change7dA = getMaxChange7dForRegion(a, region);
    const change7dB = getMaxChange7dForRegion(b, region);
    const change30dA = Math.max(
      ...a.grades.map((g) => getGradedMarket(g, region)?.change30d ?? -Infinity)
    );
    const change30dB = Math.max(
      ...b.grades.map((g) => getGradedMarket(g, region)?.change30d ?? -Infinity)
    );

    let cmp = 0;
    switch (filters.sortField) {
      case "name":
        cmp = a.name.localeCompare(b.name);
        break;
      case "price":
        cmp = priceA - priceB;
        break;
      case "change7d":
        cmp = change7dA - change7dB;
        break;
      case "change30d":
        cmp = change30dA - change30dB;
        break;
    }
    return filters.sortDirection === "asc" ? cmp : -cmp;
  });

  return result;
}

export function getSpreadPercent(
  itPrice: number,
  intlPriceUsd: number,
  eurUsdRate = 0.92
): number {
  const intlInEur = intlPriceUsd * eurUsdRate;
  if (itPrice === 0) return 0;
  return Math.round(((itPrice - intlInEur) / itPrice) * 1000) / 10;
}
