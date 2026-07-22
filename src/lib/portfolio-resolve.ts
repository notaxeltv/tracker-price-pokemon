import { getGradedMarket, getSealedMarket } from "./market-utils";
import {
  getTotalCost,
  hasActivePriceAlert,
  hasPortfolioData,
  parsePortfolioKey,
} from "./portfolio";
import type {
  DashboardData,
  PortfolioEntry,
  ProductCategory,
  ResolvedPortfolioRow,
} from "./types";

function resolveMarketPrice(
  data: DashboardData,
  key: string
): number | null {
  const { productId, gradeKey } = parsePortfolioKey(key);

  const sealed = data.sealed.find((p) => p.id === productId);
  if (sealed) {
    const quote =
      getSealedMarket(sealed, "IT") ?? getSealedMarket(sealed, "INTL");
    return quote?.price ?? null;
  }

  const graded = data.graded.find((c) => c.id === productId);
  if (graded && gradeKey) {
    const grade = graded.grades.find((g) => `${g.company}-${g.grade}` === gradeKey);
    if (grade) {
      const quote =
        getGradedMarket(grade, "IT") ?? getGradedMarket(grade, "INTL");
      return quote?.price ?? null;
    }
  }

  const raw = data.raw.find((c) => c.id === productId);
  if (raw) {
    const quote =
      raw.markets.find((m) => m.region === "IT") ??
      raw.markets.find((m) => m.region === "INTL");
    return quote?.price ?? null;
  }

  const accessory = data.accessory.find((p) => p.id === productId);
  if (accessory) {
    const quote =
      accessory.markets.find((m) => m.region === "IT") ??
      accessory.markets.find((m) => m.region === "INTL");
    return quote?.price ?? null;
  }

  return null;
}

function resolveMeta(
  data: DashboardData,
  key: string
): {
  title: string;
  subtitle?: string;
  category: ProductCategory | "unknown";
  isUserProduct: boolean;
} {
  const { productId, gradeKey } = parsePortfolioKey(key);
  const isUserProduct = productId.startsWith("user-");

  const sealed = data.sealed.find((p) => p.id === productId);
  if (sealed) {
    return {
      title: sealed.name,
      subtitle: sealed.set,
      category: "sealed",
      isUserProduct,
    };
  }

  const graded = data.graded.find((c) => c.id === productId);
  if (graded) {
    const gradeLabel = gradeKey?.replace("-", " ") ?? "";
    return {
      title: gradeKey
        ? `${graded.name} · ${gradeLabel}`
        : graded.name,
      subtitle: graded.set,
      category: "graded",
      isUserProduct,
    };
  }

  const raw = data.raw.find((c) => c.id === productId);
  if (raw) {
    return {
      title: raw.name,
      subtitle: raw.set,
      category: "raw",
      isUserProduct,
    };
  }

  const accessory = data.accessory.find((p) => p.id === productId);
  if (accessory) {
    return {
      title: accessory.name,
      category: "accessory",
      isUserProduct,
    };
  }

  return {
    title: productId,
    subtitle: gradeKey,
    category: "unknown",
    isUserProduct,
  };
}

export function buildPortfolioRows(
  data: DashboardData,
  entries: Record<string, PortfolioEntry>
): ResolvedPortfolioRow[] {
  return Object.entries(entries)
    .filter(([, entry]) => hasPortfolioData(entry) && getTotalCost(entry) != null)
    .map(([key, entry]) => {
      const meta = resolveMeta(data, key);
      const marketPrice = resolveMarketPrice(data, key);
      return {
        key,
        productId: parsePortfolioKey(key).productId,
        ...meta,
        entry,
        marketPrice: marketPrice ?? undefined,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title, "it"));
}

export function countActiveAlerts(
  data: DashboardData,
  entries: Record<string, PortfolioEntry>
): number {
  return buildPortfolioRows(data, entries).filter(
    (row) => hasActivePriceAlert(row.entry, row.marketPrice)
  ).length;
}
