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

export function hasPortfolioData(entry?: PortfolioEntry): boolean {
  if (!entry) return false;
  return (
    (entry.purchasePrice != null && entry.purchasePrice > 0) ||
    Boolean(entry.hasPlexiglassCase)
  );
}

/** Etichetta teca plexiglass per la UI. */
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
    hasPlexiglassCase: false,
    plexiglassCost: undefined,
  };
}
