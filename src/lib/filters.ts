import type {
  AccessoryProduct,
  GradedCard,
  MarketRegion,
  PortfolioEntry,
  ProductFilters,
  RawCard,
  SealedProduct,
} from "./types";
import { productHasPortfolio } from "./portfolio";
import {
  getGradedMarket,
  getMaxChange7dForRegion,
  getMaxPriceForRegion,
  getPrimaryMarketQuote,
  getSealedMarket,
} from "./market-utils";

function sortRegion(filters: ProductFilters): MarketRegion {
  if (filters.market === "INTL") return "INTL";
  return "IT";
}

function regionQuote(
  markets: { region: MarketRegion; price: number; change7d: number; change30d: number }[],
  region: MarketRegion
) {
  return markets.find((m) => m.region === region) ?? markets[0];
}

function applyPortfolioFilter<T extends { id: string }>(
  items: T[],
  filters: ProductFilters,
  portfolio?: Record<string, PortfolioEntry>
): T[] {
  if (!filters.portfolioOnly || !portfolio) return items;
  return items.filter((item) => productHasPortfolio(item.id, portfolio));
}

export function filterSealedProducts(
  products: SealedProduct[],
  filters: ProductFilters,
  portfolio?: Record<string, PortfolioEntry>
): SealedProduct[] {
  let result = [...products];

  result = applyPortfolioFilter(result, filters, portfolio);

  if (filters.sealedLanguage !== "all") {
    result = result.filter((p) => p.language === filters.sealedLanguage);
  }

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
  filters: ProductFilters,
  portfolio?: Record<string, PortfolioEntry>
): GradedCard[] {
  let result = cards.map((c) => ({
    ...c,
    grades: c.grades.filter((g) => {
      if (filters.gradingCompany && filters.gradingCompany !== "all") {
        if (g.company !== filters.gradingCompany) return false;
      }
      if (filters.grade != null && g.grade !== filters.grade) return false;
      return true;
    }),
  }));

  result = result.filter((c) => c.grades.length > 0);

  result = applyPortfolioFilter(result, filters, portfolio);

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.nameJa?.includes(filters.search) ?? false) ||
        c.set.toLowerCase().includes(q) ||
        c.cardNumber.toLowerCase().includes(q)
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

export function filterRawCards(
  cards: RawCard[],
  filters: ProductFilters,
  portfolio?: Record<string, PortfolioEntry>
): RawCard[] {
  let result = [...cards];

  result = applyPortfolioFilter(result, filters, portfolio);

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.nameJa?.includes(filters.search) ?? false) ||
        c.set.toLowerCase().includes(q) ||
        c.cardNumber.toLowerCase().includes(q)
    );
  }

  const region = sortRegion(filters);

  result.sort((a, b) => {
    const ma = regionQuote(a.markets, region);
    const mb = regionQuote(b.markets, region);

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

export function filterAccessoryProducts(
  products: AccessoryProduct[],
  filters: ProductFilters,
  portfolio?: Record<string, PortfolioEntry>
): AccessoryProduct[] {
  let result = [...products];

  result = applyPortfolioFilter(result, filters, portfolio);

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(q));
  }

  const region = sortRegion(filters);

  result.sort((a, b) => {
    const ma = regionQuote(a.markets, region);
    const mb = regionQuote(b.markets, region);

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

export function getSpreadPercent(
  itPrice: number,
  intlPriceUsd: number,
  eurUsdRate = 0.92
): number {
  const intlInEur = intlPriceUsd * eurUsdRate;
  if (itPrice === 0) return 0;
  return Math.round(((itPrice - intlInEur) / itPrice) * 1000) / 10;
}
