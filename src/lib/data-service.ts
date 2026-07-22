import type {
  DashboardData,
  DashboardStats,
  GradedCard,
  GradedPrice,
  MarketQuote,
  MarketRegion,
  ProductFilters,
  SealedProduct,
} from "./types";
import {
  buildFlatHistory,
  extractTcgdexPricing,
  fetchPkmnPricesCardEbayPsa,
  fetchTcgPlayerMarketPrice,
  fetchTcgdexCard,
  searchPkmnPricesJpCard,
} from "./providers/live-data";
import {
  WATCHLIST_PSA_JP,
  WATCHLIST_SEALED_EN,
  WATCHLIST_SEALED_IT,
} from "./watchlist";
import {
  getGradedMarket,
  getMaxChange7dForRegion,
  getMaxPriceForRegion,
  getPrimaryMarketQuote,
  getSealedMarket,
} from "./market-utils";

function pctChange(current: number, previous: number): number {
  if (!previous) return 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function quote(
  region: MarketRegion,
  source: MarketQuote["source"],
  sourceLabel: string,
  price: number,
  currency: "EUR" | "USD",
  change7d: number,
  change30d: number,
  externalUrl?: string,
  live = false
): MarketQuote {
  return {
    region,
    source,
    sourceLabel,
    price,
    currency,
    change24h: Math.round(change7d * 0.3 * 10) / 10,
    change7d,
    change30d,
    history: buildFlatHistory(price, change30d),
    externalUrl,
    live,
  };
}

async function buildSealedEn(): Promise<SealedProduct[]> {
  const results = await Promise.all(
    WATCHLIST_SEALED_EN.map(async (item) => {
      const livePrice = await fetchTcgPlayerMarketPrice(item.tcgplayerProductId);
      const price = livePrice ?? 0;

      const markets: MarketQuote[] = [];
      if (price > 0) {
        markets.push(
          quote(
            "INTL",
            "tcgplayer",
            "TCGPlayer · live",
            price,
            "USD",
            0,
            0,
            `https://www.tcgplayer.com/product/${item.tcgplayerProductId}`,
            true
          )
        );
      }

      return {
        id: item.id,
        category: "sealed" as const,
        name: item.name,
        set: item.set,
        setCode: item.setCode,
        type: item.type,
        language: item.language,
        imageUrl: item.imageUrl,
        markets,
        tcgplayerProductId: item.tcgplayerProductId,
      };
    })
  );
  return results.filter((p) => p.markets.length > 0);
}

async function buildSealedIt(): Promise<SealedProduct[]> {
  return WATCHLIST_SEALED_IT.map((item) => ({
    id: item.id,
    category: "sealed" as const,
    name: item.name,
    set: item.set,
    setCode: item.setCode,
    type: item.type,
    language: item.language,
    imageUrl: item.imageUrl,
    markets: [
      quote(
        "IT",
        "cardmarket",
        "Cardmarket IT · stima",
        item.fallbackPriceEur,
        "EUR",
        2.1,
        5.5,
        `https://www.cardmarket.com/it/Pokemon/Products/${item.cardmarketSlug}`,
        false
      ),
    ],
  }));
}

async function buildGradedJp(): Promise<GradedCard[]> {
  const results = await Promise.all(
    WATCHLIST_PSA_JP.map(async (item) => {
      const tcgCard = await fetchTcgdexCard(item.tcgdxCardId, "ja");
      const pricing = tcgCard ? extractTcgdexPricing(tcgCard) : null;

      let pkmnId: number | undefined;
      if (process.env.PKMNPRICES_API_KEY) {
        pkmnId =
          (await searchPkmnPricesJpCard(item.nameJa ?? item.name)) ?? undefined;
      }

      const grades: GradedPrice[] = [];

      for (const grade of item.grades) {
        const markets: MarketQuote[] = [];

        const ebayLive =
          pkmnId != null
            ? await fetchPkmnPricesCardEbayPsa(pkmnId, grade)
            : null;

        if (ebayLive) {
          markets.push(
            quote(
              "INTL",
              "ebay",
              `eBay PSA ${grade} · live`,
              ebayLive.priceUsd,
              "USD",
              0,
              0,
              "https://www.ebay.com/sch/i.html?_nkw=pokemon+psa+japanese",
              true
            )
          );
        } else {
          const usdBase =
            grade === 10 ? item.fallbackPsa10Usd : item.fallbackPsa10Usd * 0.45;
          const eurBase =
            grade === 10 ? item.fallbackPsa10Eur : item.fallbackPsa10Eur * 0.45;

          markets.push(
            quote(
              "IT",
              "ebay",
              `eBay IT PSA ${grade} · stima`,
              eurBase,
              "EUR",
              pricing?.change7d ?? 1.5,
              pricing?.change30d ?? 4.2,
              "https://www.ebay.it/sch/i.html?_nkw=pokemon+psa+giapponese",
              false
            ),
            quote(
              "INTL",
              "ebay",
              `eBay US PSA ${grade} · stima`,
              usdBase,
              "USD",
              pricing?.change7d ?? 1.5,
              pricing?.change30d ?? 4.2,
              "https://www.ebay.com/sch/i.html?_nkw=pokemon+psa+japanese",
              false
            )
          );
        }

        grades.push({ company: "PSA", grade, markets });
      }

      return {
        id: item.id,
        category: "graded" as const,
        name: item.name,
        nameJa: item.nameJa,
        set: item.set,
        setCode: item.setCode,
        cardNumber: item.cardNumber,
        language: "JP" as const,
        imageUrl: item.imageUrl ?? tcgCard?.image,
        grades,
        tcgdxCardId: item.tcgdxCardId,
        pkmnPricesCardId: pkmnId,
      };
    })
  );

  return results;
}

function countLive(data: { sealed: SealedProduct[]; graded: GradedCard[] }): number {
  let n = 0;
  for (const p of data.sealed) {
    for (const m of p.markets) if (m.live) n++;
  }
  for (const c of data.graded) {
    for (const g of c.grades) {
      for (const m of g.markets) if (m.live) n++;
    }
  }
  return n;
}

function computeStats(
  sealed: SealedProduct[],
  graded: GradedCard[],
  liveCount: number
): DashboardStats {
  const itChanges = [
    ...sealed
      .filter((p) => p.language === "IT")
      .map((p) => {
        const m = getSealedMarket(p, "IT");
        return m ? { name: p.name, change: m.change7d, region: "IT" as const } : null;
      }),
    ...graded.flatMap((c) =>
      c.grades.map((g) => {
        const m = getGradedMarket(g, "IT");
        return m
          ? { name: `${c.nameJa ?? c.name} PSA ${g.grade}`, change: m.change7d, region: "IT" as const }
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
  };
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const [sealedEn, sealedIt, graded] = await Promise.all([
    buildSealedEn(),
    buildSealedIt(),
    buildGradedJp(),
  ]);

  const sealed = [...sealedEn, ...sealedIt];
  const liveCount = countLive({ sealed, graded });

  return {
    stats: computeStats(sealed, graded, liveCount),
    sealed,
    graded,
    lastUpdated: new Date().toISOString(),
    dataSource: liveCount > 0 ? (liveCount > 5 ? "live" : "mixed") : "demo",
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
  filters: ProductFilters
): GradedCard[] {
  let result = cards.map((c) => ({
    ...c,
    grades: filters.psaGrade
      ? c.grades.filter((g) => g.grade === filters.psaGrade)
      : c.grades,
  }));

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

export function getSpreadPercent(
  itPrice: number,
  intlPriceUsd: number,
  eurUsdRate = 0.92
): number {
  const intlInEur = intlPriceUsd * eurUsdRate;
  if (itPrice === 0) return 0;
  return Math.round(((itPrice - intlInEur) / itPrice) * 1000) / 10;
}
