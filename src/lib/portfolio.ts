import type { PortfolioEntry } from "./types";

export function portfolioKey(productId: string, gradeKey?: string): string {
  return gradeKey ? `${productId}:${gradeKey}` : productId;
}

export function parsePortfolioKey(key: string): {
  productId: string;
  gradeKey?: string;
} {
  const idx = key.indexOf(":");
  if (idx === -1) return { productId: key };
  return { productId: key.slice(0, idx), gradeKey: key.slice(idx + 1) };
}

/** Costo totale: acquisto + teca (solo se costo teca specificato separatamente). */
export function getTotalCost(entry: PortfolioEntry): number | null {
  if (entry.purchasePrice == null || entry.purchasePrice <= 0) return null;

  let total = entry.purchasePrice;
  if (
    entry.hasPlexiglassCase &&
    entry.plexiglassCost != null &&
    entry.plexiglassCost > 0
  ) {
    total += entry.plexiglassCost;
  }

  return total;
}

export function isSold(entry: PortfolioEntry): boolean {
  return entry.soldPrice != null && entry.soldPrice > 0;
}

export function getRealizedGainLoss(
  entry: PortfolioEntry
): { amount: number; percent: number } | null {
  const cost = getTotalCost(entry);
  if (cost == null || !isSold(entry)) return null;
  const amount = entry.soldPrice! - cost;
  return { amount, percent: (amount / cost) * 100 };
}

export function getUnrealizedGainLoss(
  marketPrice: number,
  entry: PortfolioEntry
): { amount: number; percent: number } | null {
  if (isSold(entry)) return null;
  return getGainLoss(marketPrice, entry);
}

export function getGainLoss(
  marketPrice: number,
  entry: PortfolioEntry
): { amount: number; percent: number } | null {
  const total = getTotalCost(entry);
  if (total == null || marketPrice <= 0) return null;

  const amount = marketPrice - total;
  return {
    amount,
    percent: (amount / total) * 100,
  };
}

/** P/L da mostrare: realizzato se venduto, altrimenti vs mercato. */
export function getDisplayGainLoss(
  entry: PortfolioEntry | undefined,
  marketPrice?: number
): { amount: number; percent: number; kind: "realized" | "unrealized" } | null {
  if (!entry) return null;
  const realized = getRealizedGainLoss(entry);
  if (realized) return { ...realized, kind: "realized" };
  if (marketPrice != null && marketPrice > 0) {
    const unrealized = getUnrealizedGainLoss(marketPrice, entry);
    if (unrealized) return { ...unrealized, kind: "unrealized" };
  }
  return null;
}

export function hasPortfolioData(entry?: PortfolioEntry): boolean {
  if (!entry) return false;
  return (
    (entry.purchasePrice != null && entry.purchasePrice > 0) ||
    Boolean(entry.hasPlexiglassCase) ||
    isSold(entry)
  );
}

export function productHasPortfolio(
  productId: string,
  portfolio: Record<string, PortfolioEntry>
): boolean {
  if (hasPortfolioData(portfolio[productId])) return true;
  const prefix = `${productId}:`;
  return Object.entries(portfolio).some(
    ([key, entry]) => key.startsWith(prefix) && hasPortfolioData(entry)
  );
}

export function formatPlexiglassLabel(entry: PortfolioEntry): string | null {
  if (!entry.hasPlexiglassCase) return null;

  if (entry.plexiglassCost != null && entry.plexiglassCost > 0) {
    return `Teca plexiglass · €${entry.plexiglassCost.toLocaleString("it-IT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return "Teca plexiglass · inclusa nel prezzo";
}

export function emptyPortfolioEntry(): PortfolioEntry {
  return {
    purchasePrice: undefined,
    purchaseDate: undefined,
    notes: undefined,
    hasPlexiglassCase: false,
    plexiglassCost: undefined,
    soldPrice: undefined,
    soldDate: undefined,
  };
}
