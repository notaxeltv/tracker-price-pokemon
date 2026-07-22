import "server-only";

import { getCatalogByKind } from "./catalog/products";
import {
  getGradedMarket,
  getSealedMarket,
} from "./market-utils";
import { buildFlatHistory } from "./scrapers/http";
import { scrapeForRegion } from "./scrapers/orchestrator";
import type { ScrapeResult, ScraperSourceId } from "./scrapers/types";
import type {
  DashboardData,
  DashboardStats,
  GradedCard,
  GradedPrice,
  GradingCompany,
  MarketQuote,
  MarketRegion,
  PriceSource,
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

async function buildSealedProducts(): Promise<SealedProduct[]> {
  const catalog = getCatalogByKind("sealed");

  return Promise.all(
    catalog.map(async (item) => {
      const region: MarketRegion = item.language === "IT" ? "IT" : "INTL";
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
        language: item.language as "IT" | "EN",
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
        nameJa: item.nameLocal,
        set: item.set,
        setCode: item.setCode,
        cardNumber: item.cardNumber ?? "",
        language: "JP" as const,
        imageUrl: item.imageUrl,
        grades,
        tcgdxCardId: item.scrape.tcgdxCardId,
      };
    })
  );
}

function countLiveAndBlocked(data: {
  sealed: SealedProduct[];
  graded: GradedCard[];
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

  return { liveCount, blockedCount };
}

function computeStats(
  sealed: SealedProduct[],
  graded: GradedCard[],
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
          ? {
              name: `${c.nameJa ?? c.name} PSA ${g.grade}`,
              change: m.change7d,
              region: "IT" as const,
            }
          : null;
      })
    ),
  ].filter(Boolean) as { name: string; change: number; region: MarketRegion }[];

  const intlChanges = [
    ...sealed
      .filter((p) => p.language === "EN")
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
              name: `${c.nameJa ?? c.name} PSA ${g.grade}`,
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
          (items.reduce((s, i) => s + i.change, 0) / items.length) * 10
        ) / 10
      : 0;

  return {
    totalProducts: sealed.length + graded.length,
    sealedCount: sealed.length,
    sealedItCount: sealed.filter((p) => p.language === "IT").length,
    sealedEnCount: sealed.filter((p) => p.language === "EN").length,
    gradedCount: graded.length,
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

export async function fetchDashboardData(): Promise<DashboardData> {
  const [sealed, graded] = await Promise.all([
    buildSealedProducts(),
    buildGradedCards(),
  ]);

  const { liveCount, blockedCount } = countLiveAndBlocked({ sealed, graded });
  const totalQuotes =
    sealed.reduce((n, p) => n + p.markets.length, 0) +
    graded.reduce((n, c) => n + c.grades.reduce((m, g) => m + g.markets.length, 0), 0);

  return {
    stats: computeStats(sealed, graded, liveCount, blockedCount),
    sealed,
    graded,
    lastUpdated: new Date().toISOString(),
    dataSource: resolveDataSource(liveCount, blockedCount, totalQuotes),
  };
}
