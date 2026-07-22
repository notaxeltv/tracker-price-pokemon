import type {
  DashboardData,
  DashboardStats,
  GradedCard,
  ProductFilters,
  SealedProduct,
} from "./types";
import { GRADED_CARDS, SEALED_PRODUCTS } from "./mock-data";

function computeStats(
  sealed: SealedProduct[],
  graded: GradedCard[]
): DashboardStats {
  const allChanges = [
    ...sealed.map((p) => ({ name: p.name, change: p.change7d })),
    ...graded.flatMap((c) =>
      c.grades.map((g) => ({
        name: `${c.name} ${g.company} ${g.grade}`,
        change: g.change7d,
      }))
    ),
  ];

  const sorted = [...allChanges].sort((a, b) => b.change - a.change);
  const avgChange7d =
    allChanges.reduce((sum, item) => sum + item.change, 0) / allChanges.length;

  return {
    totalProducts: sealed.length + graded.length,
    sealedCount: sealed.length,
    gradedCount: graded.length,
    avgChange7d: Math.round(avgChange7d * 10) / 10,
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

  if (filters.market !== "all") {
    result = result.filter((p) => p.market === filters.market);
  }

  result.sort((a, b) => {
    let cmp = 0;
    switch (filters.sortField) {
      case "name":
        cmp = a.name.localeCompare(b.name);
        break;
      case "price":
        cmp = a.price - b.price;
        break;
      case "change7d":
        cmp = a.change7d - b.change7d;
        break;
      case "change30d":
        cmp = a.change30d - b.change30d;
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

  if (filters.market !== "all") {
    result = result.filter((c) => c.market === filters.market);
  }

  if (filters.gradingCompany) {
    result = result.filter((c) =>
      c.grades.some((g) => g.company === filters.gradingCompany)
    );
  }

  result.sort((a, b) => {
    const priceA = Math.max(...a.grades.map((g) => g.price));
    const priceB = Math.max(...b.grades.map((g) => g.price));
    const change7dA = Math.max(...a.grades.map((g) => g.change7d));
    const change7dB = Math.max(...b.grades.map((g) => g.change7d));
    const change30dA = Math.max(...a.grades.map((g) => g.change30d));
    const change30dB = Math.max(...b.grades.map((g) => g.change30d));

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
