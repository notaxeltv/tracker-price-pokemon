import type { Scraper, ScrapeQuery, ScrapeResult } from "./types";
import { DEFAULT_SCRAPER_CONFIG } from "./types";
import { cacheKey, getCached, setCached } from "./cache";
import {
  languageDisplayLabel,
} from "./cardmarket-language";
import { resolveMinPriceFromHtml } from "./cardmarket-parse";
import { detectBlocked, politeFetch } from "./http";

function fail(
  label: string,
  error: string,
  blocked = false
): ScrapeResult {
  return {
    source: "cardmarket",
    success: false,
    price: null,
    currency: "EUR",
    label,
    scrapedAt: new Date().toISOString(),
    error,
    blocked,
  };
}

function ok(
  price: number,
  url: string,
  sampleSize: number,
  query: ScrapeQuery,
  viaFetcher = false
): ScrapeResult {
  const lang = languageDisplayLabel(query.language);
  const label = viaFetcher
    ? `Cardmarket · min ${lang} (TCGdex)`
    : `Cardmarket · min ${lang}`;

  return {
    source: "cardmarket",
    success: true,
    price: Math.round(price * 100) / 100,
    currency: "EUR",
    label,
    externalUrl: url,
    sampleSize,
    scrapedAt: new Date().toISOString(),
    viaFetcher,
  };
}

function buildSearchTerm(query: ScrapeQuery): string {
  if (query.searchTerm) return query.searchTerm;
  const parts = ["pokemon"];
  if (query.grading) {
    parts.push(query.grading.company, String(query.grading.grade));
  }
  if (query.language === "JP") parts.push("japanese");
  if (query.language === "IT") parts.push("italiano");
  if (query.language === "EN") parts.push("english");
  return parts.join(" ");
}

export function buildCardmarketUrl(query: ScrapeQuery): string | null {
  if (query.cardmarketUrl) return query.cardmarketUrl;

  const idProduct = query.meta?.cardmarketProductId;
  if (idProduct) {
    return `https://www.cardmarket.com/it/Pokemon/Products/Singles?idProduct=${idProduct}`;
  }

  const term = buildSearchTerm(query);
  if (!term.trim()) return null;

  const params = new URLSearchParams({
    searchString: term,
    sellerCountry: "13", // Italia — mercato EU
  });

  return `https://www.cardmarket.com/it/Pokemon/Products/Singles?${params}`;
}

async function scrapeCardmarketHtml(
  url: string,
  query: ScrapeQuery
): Promise<ScrapeResult> {
  const config = DEFAULT_SCRAPER_CONFIG;
  const label = `Cardmarket · min ${languageDisplayLabel(query.language)}`;
  const res = await politeFetch(url, config);
  const html = await res.text();

  if (!res.ok || detectBlocked(html)) {
    return fail(
      label,
      detectBlocked(html)
        ? "Cloudflare block — usa SCRAPE_USE_PLAYWRIGHT=true in locale"
        : `HTTP ${res.status}`,
      detectBlocked(html)
    );
  }

  const resolved = resolveMinPriceFromHtml(html, query);
  if (!resolved) {
    return fail(
      label,
      query.grading
        ? `Nessun listing ${query.grading.company} ${query.grading.grade} in lingua ${languageDisplayLabel(query.language)}`
        : `Nessun listing in lingua ${languageDisplayLabel(query.language)}`
    );
  }

  return ok(resolved.price, url, resolved.sampleSize, query);
}

interface TcgdexCardmarket {
  low?: number;
  trend?: number;
  avg?: number;
  idProduct?: number;
}

async function scrapeViaTcgdex(query: ScrapeQuery): Promise<ScrapeResult | null> {
  if (!query.tcgdxCardId) return null;

  const locales = query.language === "JP" ? ["ja", "en"] : ["en", "it"];
  const label = `Cardmarket · min ${languageDisplayLabel(query.language)}`;

  for (const locale of locales) {
    try {
      const res = await fetch(
        `https://api.tcgdex.net/v2/${locale}/cards/${query.tcgdxCardId}`,
        { next: { revalidate: 3600 } }
      );
      if (!res.ok) continue;

      const card = await res.json();
      const cm: TcgdexCardmarket | undefined = card.pricing?.cardmarket;
      if (!cm) continue;

      // Graded: TCGdex non ha min PSA — non usare fallback raw
      if (query.grading) continue;

      const price = cm.low ?? cm.avg;
      if (price == null || price <= 0) continue;

      const url =
        query.cardmarketUrl ??
        (cm.idProduct
          ? `https://www.cardmarket.com/it/Pokemon/Products/Singles?idProduct=${cm.idProduct}`
          : "https://www.cardmarket.com/it/Pokemon/Products/Singles");

      return ok(price, url, 1, query, true);
    } catch {
      continue;
    }
  }

  return null;
}

async function scrapeWithPlaywright(
  url: string,
  query: ScrapeQuery
): Promise<ScrapeResult | null> {
  if (!DEFAULT_SCRAPER_CONFIG.usePlaywright) return null;
  try {
    const { scrapeCardmarketWithPlaywright } = await import(
      "./playwright-scraper"
    );
    return scrapeCardmarketWithPlaywright(url, query);
  } catch {
    return null;
  }
}

function cacheExtra(query: ScrapeQuery): string {
  return [
    query.cardmarketUrl ?? "",
    query.language ?? "",
    query.grading ? `${query.grading.company}-${query.grading.grade}` : "",
    query.searchTerm ?? "",
  ].join("|");
}

export const cardmarketScraper: Scraper = {
  id: "cardmarket",
  label: "Cardmarket",
  supports: ["sealed", "graded", "raw", "accessory"],
  async scrape(query: ScrapeQuery): Promise<ScrapeResult> {
    const key = cacheKey("cardmarket", query.productId, cacheExtra(query));
    const cached = getCached(key);
    if (cached) return cached;

    const url = buildCardmarketUrl(query);
    let result: ScrapeResult;

    if (url) {
      result = await scrapeCardmarketHtml(url, query);
      if (!result.success && DEFAULT_SCRAPER_CONFIG.usePlaywright) {
        const pw = await scrapeWithPlaywright(url, query);
        if (pw) result = pw;
      }
    } else {
      result = fail(
        `Cardmarket · min ${languageDisplayLabel(query.language)}`,
        "URL o searchTerm mancante"
      );
    }

    // Fallback TCGdex solo per raw/sealed (min low, non trend)
    if (
      !result.success &&
      !query.grading &&
      query.kind !== "sealed" &&
      query.tcgdxCardId
    ) {
      const tcg = await scrapeViaTcgdex(query);
      if (tcg) result = tcg;
    }

    if (result.success) {
      setCached(key, result, DEFAULT_SCRAPER_CONFIG.cacheTtlSeconds);
    }

    return result;
  },
};
