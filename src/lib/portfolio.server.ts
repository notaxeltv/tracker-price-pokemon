import "server-only";

import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import type { PortfolioData, PortfolioEntry } from "./types";

const DEFAULT_PORTFOLIO: PortfolioData = {
  entries: {},
  updatedAt: new Date().toISOString(),
};

export function getPortfolioPath(): string {
  return process.env.PORTFOLIO_PATH ?? path.join(process.cwd(), "data/portfolio.json");
}

export async function loadPortfolio(): Promise<PortfolioData> {
  const filePath = getPortfolioPath();

  try {
    const raw = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as PortfolioData;
    return {
      entries: parsed.entries ?? {},
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return { ...DEFAULT_PORTFOLIO };
  }
}

export async function savePortfolio(data: PortfolioData): Promise<void> {
  const filePath = getPortfolioPath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function upsertPortfolioEntry(
  key: string,
  entry: PortfolioEntry | null
): Promise<PortfolioData> {
  const current = await loadPortfolio();
  const entries = { ...current.entries };

  if (entry == null || !hasEntryContent(entry)) {
    delete entries[key];
  } else {
    entries[key] = normalizeEntry(entry);
  }

  const next: PortfolioData = {
    entries,
    updatedAt: new Date().toISOString(),
  };

  await savePortfolio(next);
  return next;
}

function hasEntryContent(entry: PortfolioEntry): boolean {
  return (
    (entry.purchasePrice != null && entry.purchasePrice > 0) ||
    Boolean(entry.hasPlexiglassCase) ||
    (entry.soldPrice != null && entry.soldPrice > 0)
  );
}

function normalizeEntry(entry: PortfolioEntry): PortfolioEntry {
  return {
    purchasePrice:
      entry.purchasePrice != null && entry.purchasePrice > 0
        ? entry.purchasePrice
        : undefined,
    purchaseDate: entry.purchaseDate?.trim() || undefined,
    notes: entry.notes?.trim() || undefined,
    hasPlexiglassCase: Boolean(entry.hasPlexiglassCase),
    plexiglassCost:
      entry.hasPlexiglassCase &&
      entry.plexiglassCost != null &&
      entry.plexiglassCost > 0
        ? entry.plexiglassCost
        : undefined,
    soldPrice:
      entry.soldPrice != null && entry.soldPrice > 0
        ? entry.soldPrice
        : undefined,
    soldDate: entry.soldDate?.trim() || undefined,
  };
}
