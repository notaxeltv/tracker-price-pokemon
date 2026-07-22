import { getCatalogByKind } from "./catalog/products";
import {
  getGradedMarket,
  getSealedMarket,
} from "./market-utils";
import { buildFlatHistory } from "./scrapers/http";
import { scrapeForRegion } from "./scrapers/orchestrator";
import {
  isSnapshotFresh,
  loadSnapshot,
  mergeDashboardHistory,
  saveSnapshot,
} from "./scrapers/snapshot";
import type { ScrapeResult, ScraperSourceId, CatalogLanguage } from "./scrapers/types";
import type {
  AccessoryProduct,
  DashboardData,
  DashboardStats,
  GradedCard,
  GradedPrice,
  GradingCompany,
  MarketQuote,
  MarketRegion,
  PriceSource,
  ProductLanguage,
  RawCard,
  SealedProduct,
} from "./types";

function mapPriceSource(source: ScraperSourceId): PriceSource {
  switch (source) {
    case "cardmarket":
    case "tcgdex":
      return "cardmarket";
    case "tcgplayer":
      return "tcgplayer";
    default:
      return "ebay";
  }
}

function scrapeToQuote(result: ScrapeResult, region: MarketRegion): MarketQuote {
  const price = result.price ?? 0;

  return {
    region,
    source: mapPriceSource(result.source),
    sourceLabel: result.label,
    price,
    currency: result.currency,
    change24h: 0,
    change7d: 0,
    change30d: 0,
    history: buildFlatHistory(price > 0 ? price : 1, 0),
    externalUrl: result.externalUrl,
    live: result.success,
    blocked: result.blocked,
    scrapeError: result.error,
    viaFetcher: result.viaFetcher,
    sampleSize: result.sampleSize,
    scrapedAt: result.scrapedAt,
  };
}

function sealedRegion(language: CatalogLanguage): MarketRegion {
  return language === "IT" ? "IT" : "INTL";
}

function gradedLanguage(language: CatalogLanguage): "JP" | "EN" {
  return language === "JP" ? "JP" : "EN";
}

function catalogLanguage(language: CatalogLanguage): ProductLanguage {
  if (language === "JP" || language === "IT" || language === "EN") {
    return language;
  }
  return "EN";
}

async function buildSealedProducts(): Promise<SealedProduct[]> {
  const catalog = getCatalogByKind("sealed");

  return Promise.all(
    catalog.map(async (item) => {
      const region = sealedRegion(item.language);
      const result = await scrapeForRegion(item, region);
      const markets: MarketQuote[] = result
        ? [scrapeToQuote(result, region)]
        : [];

      return {
        id: item.id,
        category: "sealed" as const,
        name: item.name,
        set: item.set,
        setCode: item.setCode,
        type: item.sealedType!,
        language: item.language as "IT" | "EN" | "JP",
        imageUrl: item.imageUrl,
        markets,
        tcgplayerProductId: item.scrape.tcgplayerProductId,
      };
    })
  );
}

async function buildGradedCards(): Promise<GradedCard[]> {
  const catalog = getCatalogByKind("graded");

  return Promise.all(
    catalog.map(async (item) => {
      const company = (item.grading?.company ?? "PSA") as GradingCompany;
      const gradeNums = item.grading?.grades ?? [10];

      const grades: GradedPrice[] = await Promise.all(
        gradeNums.map(async (gradeNum) => {
          const [itResult, intlResult] = await Promise.all([
            scrapeForRegion(item, "IT", gradeNum),
            scrapeForRegion(item, "INTL", gradeNum),
          ]);

          const markets: MarketQuote[] = [];
          if (itResult) markets.push(scrapeToQuote(itResult, "IT"));
          if (intlResult) markets.push(scrapeToQuote(intlResult, "INTL"));

          return { company, grade: gradeNum, markets };
        })
      );

      return {
        id: item.id,
        category: "graded" as const,
        name: item.name,
        nameJa: item.language === "JP" ? item.nameLocal : undefined,
        set: item.set,
        setCode: item.setCode,
        cardNumber: item.cardNumber ?? "",
        language: gradedLanguage(item.language),
        imageUrl: item.imageUrl,
        grades,
        tcgdxCardId: item.scrape.tcgdxCardId,
      };
    })
  );
}

async function buildRawCards(): Promise<RawCard[]> {
  const catalog = getCatalogByKind("raw");

  return Promise.all(
    catalog.map(async (item) => {
      const [itResult, intlResult] = await Promise.all([
        scrapeForRegion(item, "IT"),
        scrapeForRegion(item, "INTL"),
      ]);

      const markets: MarketQuote[] = [];
      if (itResult) markets.push(scrapeToQuote(itResult, "IT"));
      if (intlResult) markets.push(scrapeToQuote(intlResult, "INTL"));

      return {
        id: item.id,
        category: "raw" as const,
        name: item.name,
        nameJa: item.language === "JP" ? item.nameLocal : undefined,
        set: item.set,
        setCode: item.setCode,
        cardNumber: item.cardNumber ?? "",
        language: catalogLanguage(item.language),
        imageUrl: item.imageUrl,
        markets,
        tcgdxCardId: item.scrape.tcgdxCardId,
      };
    })
  );
}

async function buildAccessoryProducts(): Promise<AccessoryProduct[]> {
  const catalog = getCatalogByKind("accessory");

  return Promise.all(
    catalog.map(async (item) => {
      const [itResult, intlResult] = await Promise.all([
        scrapeForRegion(item, "IT"),
        scrapeForRegion(item, "INTL"),
      ]);

      const markets: MarketQuote[] = [];
      if (itResult) markets.push(scrapeToQuote(itResult, "IT"));
      if (intlResult) markets.push(scrapeToQuote(intlResult, "INTL"));

      return {
        id: item.id,
        category: "accessory" as const,
        name: item.name,
        language: catalogLanguage(item.language),
        imageUrl: item.imageUrl,
        markets,
      };
    })
  );
}

function countLiveAndBlocked(data: {
  sealed: SealedProduct[];
  graded: GradedCard[];
  raw: RawCard[];
  accessory: AccessoryProduct[];
}): { liveCount: number; blockedCount: number } {
  let liveCount = 0;
  let blockedCount = 0;

  const tally = (m: MarketQuote) => {
    if (m.live) liveCount++;
    if (m.blocked) blockedCount++;
  };

  for (const p of data.sealed) {
    for (const m of p.markets) tally(m);
  }
  for (const c of data.graded) {
    for (const g of c.grades) {
      for (const m of g.markets) tally(m);
    }
  }
  for (const c of data.raw) {
    for (const m of c.markets) tally(m);
  }
  for (const p of data.accessory) {
    for (const m of p.markets) tally(m);
  }

  return { liveCount, blockedCount };
}

function gradedLabel(card: GradedCard, grade: GradedPrice): string {
  const name = card.nameJa ?? card.name;
  return `${name} ${grade.company} ${grade.grade}`;
}

function computeStats(
  sealed: SealedProduct[],
  graded: GradedCard[],
  raw: RawCard[],
  accessory: AccessoryProduct[],
  liveCount: number,
  blockedCount: number
): DashboardStats {
  const itChanges = [
    ...sealed
      .filter((p) => p.language === "IT")
      .map((p) => {
        const m = getSealedMarket(p, "IT");
        return m
          ? { name: p.name, change: m.change7d, region: "IT" as const }
          : null;
      }),
    ...graded.flatMap((c) =>
      c.grades.map((g) => {
        const m = getGradedMarket(g, "IT");
        return m
          ? { name: gradedLabel(c, g), change: m.change7d, region: "IT" as const }
          : null;
      })
    ),
    ...raw.map((c) => {
      const m = c.markets.find((q) => q.region === "IT");
      return m
        ? { name: `${c.name} raw`, change: m.change7d, region: "IT" as const }
        : null;
    }),
    ...accessory.map((p) => {
      const m = p.markets.find((q) => q.region === "IT");
      return m
        ? { name: p.name, change: m.change7d, region: "IT" as const }
        : null;
    }),
  ].filter(Boolean) as { name: string; change: number; region: MarketRegion }[];

  const intlChanges = [
    ...sealed
      .filter((p) => p.language !== "IT")
      .map((p) => {
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
              name: gradedLabel(c, g),
              change: m.change7d,
              region: "INTL" as const,
            }
          : null;
      })
    ),
    ...raw.map((c) => {
      const m = c.markets.find((q) => q.region === "INTL");
      return m
        ? { name: `${c.name} raw`, change: m.change7d, region: "INTL" as const }
        : null;
    }),
    ...accessory.map((p) => {
      const m = p.markets.find((q) => q.region === "INTL");
      return m
        ? { name: p.name, change: m.change7d, region: "INTL" as const }
        : null;
    }),
  ].filter(Boolean) as { name: string; change: number; region: MarketRegion }[];

  const allChanges = [...itChanges, ...intlChanges];
  const sorted = [...allChanges].sort((a, b) => b.change - a.change);
  const avg = (items: typeof allChanges) =>
    items.length
      ? Math.round(
          (items.reduce((s, i) => s + i.change, 0) / items.length) * 10
        ) / 10
      : 0;

  return {
    totalProducts: sealed.length + graded.length + raw.length + accessory.length,
    sealedCount: sealed.length,
    sealedItCount: sealed.filter((p) => p.language === "IT").length,
    sealedEnCount: sealed.filter((p) => p.language === "EN").length,
    sealedJpCount: sealed.filter((p) => p.language === "JP").length,
    gradedCount: graded.length,
    gradedJpCount: graded.filter((c) => c.language === "JP").length,
    gradedEnCount: graded.filter((c) => c.language === "EN").length,
    rawCount: raw.length,
    accessoryCount: accessory.length,
    avgChange7dIT: avg(itChanges),
    avgChange7dINTL: avg(intlChanges),
    topGainer: sorted[0] ?? null,
    topLoser: sorted[sorted.length - 1] ?? null,
    liveCount,
    blockedCount,
  };
}

function resolveDataSource(
  liveCount: number,
  blockedCount: number,
  totalQuotes: number
): DashboardData["dataSource"] {
  if (blockedCount > 0 && liveCount === 0) return "scrape_blocked";
  if (liveCount === 0) return "demo";
  if (liveCount >= totalQuotes) return "live";
  return "mixed";
}

function countQuotes(data: {
  sealed: SealedProduct[];
  graded: GradedCard[];
  raw: RawCard[];
  accessory: AccessoryProduct[];
}): number {
  return (
    data.sealed.reduce((n, p) => n + p.markets.length, 0) +
    data.graded.reduce(
      (n, c) => n + c.grades.reduce((m, g) => m + g.markets.length, 0),
      0
    ) +
    data.raw.reduce((n, c) => n + c.markets.length, 0) +
    data.accessory.reduce((n, p) => n + p.markets.length, 0)
  );
}

async function enrichImagesIfConfigured(
  data: DashboardData
): Promise<DashboardData> {
  if (!process.env.CARDTRADER_API_TOKEN?.trim()) return data;

  const { enrichDashboardImages } = await import(
    "./providers/cardtrader/enrich-images"
  );
  return enrichDashboardImages(data);
}

async function assembleDashboard(
  dataSourceOverride?: DashboardData["dataSource"]
): Promise<DashboardData> {
  const [sealed, graded, raw, accessory] = await Promise.all([
    buildSealedProducts(),
    buildGradedCards(),
    buildRawCards(),
    buildAccessoryProducts(),
  ]);

  const tallies = countLiveAndBlocked({ sealed, graded, raw, accessory });
  const totalQuotes = countQuotes({ sealed, graded, raw, accessory });

  const data: DashboardData = {
    stats: computeStats(
      sealed,
      graded,
      raw,
      accessory,
      tallies.liveCount,
      tallies.blockedCount
    ),
    sealed,
    graded,
    raw,
    accessory,
    lastUpdated: new Date().toISOString(),
    dataSource:
      dataSourceOverride ??
      resolveDataSource(tallies.liveCount, tallies.blockedCount, totalQuotes),
  };

  return enrichImagesIfConfigured(data);
}

/** Scrape live — usato dal cron locale */
export async function fetchDashboardDataLive(): Promise<DashboardData> {
  return assembleDashboard();
}

/** Legge snapshot se fresco, altrimenti scrape live */
export async function fetchDashboardData(): Promise<DashboardData> {
  const useSnapshot = process.env.SCRAPE_USE_SNAPSHOT !== "false";
  const maxAge = parseInt(process.env.SCRAPE_CACHE_TTL ?? "3600", 10);

  if (useSnapshot) {
    const snap = await loadSnapshot();
    if (snap && isSnapshotFresh(snap, maxAge)) {
      return enrichImagesIfConfigured({ ...snap, dataSource: "snapshot" });
    }
  }

  return fetchDashboardDataLive();
}

/** Cron: scrape + merge history + salva snapshot */
export async function refreshSnapshot(): Promise<DashboardData> {
  const prev = await loadSnapshot();
  const fresh = await fetchDashboardDataLive();
  const merged = mergeDashboardHistory(prev, fresh);
  await saveSnapshot(merged);
  return merged;
}
