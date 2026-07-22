import * as cheerio from "cheerio";
import type { Scraper, ScrapeQuery, ScrapeResult } from "./types";
import { DEFAULT_SCRAPER_CONFIG } from "./types";
import { cacheKey, getCached, setCached } from "./cache";
import {
  detectBlocked,
  median,
  parseEuroPrice,
  politeFetch,
} from "./http";

function fail(
  source: "cardmarket",
  label: string,
  error: string,
  blocked = false
): ScrapeResult {
  return {
    source,
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
  viaFetcher = false
): ScrapeResult {
  return {
    source: "cardmarket",
    success: true,
    price: Math.round(price * 100) / 100,
    currency: "EUR",
    label: viaFetcher ? "TCGdex → Cardmarket" : "Cardmarket · scrape",
    externalUrl: url,
    sampleSize,
    scrapedAt: new Date().toISOString(),
    viaFetcher,
  };
}

async function scrapeCardmarketHtml(url: string): Promise<ScrapeResult> {
  const config = DEFAULT_SCRAPER_CONFIG;
  const res = await politeFetch(url, config);
  const html = await res.text();

  if (!res.ok || detectBlocked(html)) {
    return fail(
      "cardmarket",
      "Cardmarket · scrape",
      detectBlocked(html)
        ? "Cloudflare block — usa SCRAPE_USE_PLAYWRIGHT=true in locale"
        : `HTTP ${res.status}`,
      detectBlocked(html)
    );
  }

  const $ = cheerio.load(html);
  const prices: number[] = [];

  // Listing rows — selettori comuni Cardmarket (aggiornabili)
  $('[data-price], .price-container, .col-price').each((_, el) => {
    const t = $(el).text();
    const p = parseEuroPrice(t);
    if (p && p > 0 && p < 50000) prices.push(p);
  });

  // Price guide / trend in pagina prodotto
  $('[class*="price"], [class*="Price"]').each((_, el) => {
    const t = $(el).text();
    if (t.includes("€") || t.includes("EUR")) {
      const p = parseEuroPrice(t);
      if ( p && p > 1 && p < 50000) prices.push(p);
    }
  });

  // JSON-LD Offer
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() ?? "");
      const offers = json.offers ?? json.Offer;
      const list = Array.isArray(offers) ? offers : offers ? [offers] : [];
      for (const o of list) {
        const p = parseFloat(o.price ?? o.lowPrice ?? "");
        if (!Number.isNaN(p) && p > 0) prices.push(p);
      }
    } catch {
      /* ignore */
    }
  });

  const med = median(prices);
  if (med == null) {
    return fail(
      "cardmarket",
      "Cardmarket · scrape",
      "Nessun prezzo trovato nel HTML — layout cambiato?"
    );
  }

  return ok(med, url, prices.length);
}

async function scrapeViaTcgdex(query: ScrapeQuery): Promise<ScrapeResult | null> {
  if (!query.tcgdxCardId) return null;
  try {
    const res = await fetch(
      `https://api.tcgdex.net/v2/ja/cards/${query.tcgdxCardId}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) {
      const en = await fetch(
        `https://api.tcgdex.net/v2/en/cards/${query.tcgdxCardId}`
      );
      if (!en.ok) return null;
      const card = await en.json();
      const cm =
        card.variants_detailed?.find(
          (v: { pricing?: { cardmarket?: { trend?: number } } }) =>
            v.pricing?.cardmarket
        )?.pricing?.cardmarket;
      if (!cm?.trend) return null;
      return ok(
        cm.trend,
        `https://www.cardmarket.com/it/Pokemon/Cards`,
        1,
        true
      );
    }
    const card = await res.json();
    const cm =
      card.variants_detailed?.find(
        (v: { pricing?: { cardmarket?: { trend?: number } } }) =>
          v.pricing?.cardmarket
      )?.pricing?.cardmarket;
    if (!cm?.trend) return null;
    return ok(cm.trend, query.cardmarketUrl ?? "https://www.cardmarket.com/it/Pokemon", 1, true);
  } catch {
    return null;
  }
}

async function scrapeWithPlaywright(url: string): Promise<ScrapeResult | null> {
  if (!DEFAULT_SCRAPER_CONFIG.usePlaywright) return null;
  try {
    const { scrapeCardmarketWithPlaywright } = await import(
      "./playwright-scraper"
    );
    return scrapeCardmarketWithPlaywright(url);
  } catch {
    return null;
  }
}

export const cardmarketScraper: Scraper = {
  id: "cardmarket",
  label: "Cardmarket",
  supports: ["sealed", "graded", "raw", "accessory"],
  async scrape(query: ScrapeQuery): Promise<ScrapeResult> {
    const key = cacheKey("cardmarket", query.productId, query.cardmarketUrl ?? "");
    const cached = getCached(key);
    if (cached) return cached;

    const url =
      query.cardmarketUrl ??
      (query.searchTerm
        ? `https://www.cardmarket.com/it/Pokemon/Products/Singles?searchString=${encodeURIComponent(query.searchTerm)}`
        : null);

    let result: ScrapeResult;

    if (url) {
      result = await scrapeCardmarketHtml(url);
      if (!result.success && DEFAULT_SCRAPER_CONFIG.usePlaywright) {
        const pw = await scrapeWithPlaywright(url);
        if (pw) result = pw;
      }
    } else {
      result = fail("cardmarket", "Cardmarket · scrape", "URL o searchTerm mancante");
    }

    // Fallback TCGdex per carte (prezzi Cardmarket aggregati, non scrape)
    if (!result.success && query.kind !== "sealed" && query.tcgdxCardId) {
      const tcg = await scrapeViaTcgdex(query);
      if (tcg) result = tcg;
    }

    if (result.success) {
      setCached(key, result, DEFAULT_SCRAPER_CONFIG.cacheTtlSeconds);
    }

    return result;
  },
};
