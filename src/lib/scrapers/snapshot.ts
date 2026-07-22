import fs from "fs/promises";
import path from "path";
import type {
  AccessoryProduct,
  DashboardData,
  GradedCard,
  MarketQuote,
  RawCard,
  SealedProduct,
} from "../types";

export const DEFAULT_SNAPSHOT_PATH = path.join(
  process.cwd(),
  "data/scrape-snapshot.json"
);

export function getSnapshotPath(): string {
  return process.env.SCRAPE_SNAPSHOT_PATH ?? DEFAULT_SNAPSHOT_PATH;
}

export async function loadSnapshot(): Promise<DashboardData | null> {
  try {
    const raw = await fs.readFile(getSnapshotPath(), "utf-8");
    return JSON.parse(raw) as DashboardData;
  } catch {
    return null;
  }
}

export function isSnapshotFresh(
  data: DashboardData,
  maxAgeSeconds: number
): boolean {
  const ageMs = Date.now() - new Date(data.lastUpdated).getTime();
  return ageMs <= maxAgeSeconds * 1000;
}

export async function saveSnapshot(data: DashboardData): Promise<void> {
  const filePath = getSnapshotPath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function pctChange(current: number, previous: number): number {
  if (!previous) return 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function historyIndexDaysAgo(history: { date: string; price: number }[], days: number) {
  if (history.length <= days) return 0;
  return history.length - 1 - days;
}

function mergeQuote(prev: MarketQuote | undefined, next: MarketQuote): MarketQuote {
  if (!next.live || next.price <= 0) {
    return { ...next, history: prev?.history ?? next.history };
  }

  const today = new Date().toISOString().split("T")[0];
  let history = [...(prev?.history ?? [])];
  const last = history[history.length - 1];

  if (last?.date === today) {
    history[history.length - 1] = { date: today, price: next.price };
  } else {
    history.push({ date: today, price: next.price });
  }

  history = history.slice(-365);

  const i7 = historyIndexDaysAgo(history, 7);
  const i30 = historyIndexDaysAgo(history, 30);

  return {
    ...next,
    history,
    change24h:
      history.length > 1
        ? pctChange(next.price, history[history.length - 2].price)
        : 0,
    change7d: pctChange(next.price, history[i7]?.price ?? next.price),
    change30d: pctChange(next.price, history[i30]?.price ?? next.price),
  };
}

function quoteKey(q: MarketQuote): string {
  return `${q.region}:${q.source}:${q.sourceLabel}`;
}

function mergeMarkets(
  prev: MarketQuote[] | undefined,
  next: MarketQuote[]
): MarketQuote[] {
  const prevMap = new Map(
    (prev ?? []).map((q) => [quoteKey(q), q])
  );

  return next.map((q) => mergeQuote(prevMap.get(quoteKey(q)), q));
}

function mergeSealed(prev: SealedProduct[], next: SealedProduct[]): SealedProduct[] {
  const prevMap = new Map(prev.map((p) => [p.id, p]));
  return next.map((p) => {
    const old = prevMap.get(p.id);
    return old
      ? { ...p, markets: mergeMarkets(old.markets, p.markets) }
      : p;
  });
}

function mergeGraded(prev: GradedCard[], next: GradedCard[]): GradedCard[] {
  const prevMap = new Map(prev.map((c) => [c.id, c]));
  return next.map((c) => {
    const old = prevMap.get(c.id);
    if (!old) return c;

    const oldGrades = new Map(
      old.grades.map((g) => [`${g.company}-${g.grade}`, g])
    );

    return {
      ...c,
      grades: c.grades.map((g) => {
        const og = oldGrades.get(`${g.company}-${g.grade}`);
        return og
          ? { ...g, markets: mergeMarkets(og.markets, g.markets) }
          : g;
      }),
    };
  });
}

function mergeRaw(prev: RawCard[], next: RawCard[]): RawCard[] {
  const prevMap = new Map(prev.map((c) => [c.id, c]));
  return next.map((c) => {
    const old = prevMap.get(c.id);
    return old
      ? { ...c, markets: mergeMarkets(old.markets, c.markets) }
      : c;
  });
}

function mergeAccessory(
  prev: AccessoryProduct[],
  next: AccessoryProduct[]
): AccessoryProduct[] {
  const prevMap = new Map(prev.map((p) => [p.id, p]));
  return next.map((p) => {
    const old = prevMap.get(p.id);
    return old
      ? { ...p, markets: mergeMarkets(old.markets, p.markets) }
      : p;
  });
}

export function mergeDashboardHistory(
  prev: DashboardData | null,
  next: DashboardData
): DashboardData {
  if (!prev) return next;

  return {
    ...next,
    sealed: mergeSealed(prev.sealed, next.sealed),
    graded: mergeGraded(prev.graded, next.graded),
    raw: mergeRaw(prev.raw ?? [], next.raw ?? []),
    accessory: mergeAccessory(prev.accessory ?? [], next.accessory ?? []),
  };
}
