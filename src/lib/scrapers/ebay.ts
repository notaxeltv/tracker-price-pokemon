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

const EBAY_IT = "https://www.ebay.it";

/** LH_PrefLoc=3 → articoli con provenienza Unione Europea */
const EU_LOCATION = "3";

type EbayMode = "sold" | "active";

function buildEbayEuUrl(searchTerm: string, mode: EbayMode): string {
  const params = new URLSearchParams({
    _nkw: searchTerm,
    LH_PrefLoc: EU_LOCATION,
    _sop: mode === "sold" ? "13" : "15",
    _ipg: "60",
  });

  if (mode === "sold") {
    params.set("LH_Sold", "1");
    params.set("LH_Complete", "1");
  }

  return `${EBAY_IT}/sch/i.html?${params}`;
}

function extractEuroPrices(html: string): number[] {
  const $ = cheerio.load(html);
  const prices: number[] = [];

  const pushPrice = (text: string) => {
    if (text.toLowerCase().includes(" to ")) return;
    const p = parseEuroPrice(text);
    if (p && p > 1 && p < 100000) prices.push(p);
  };

  $(".s-item__price, .s-card__price").each((_, el) => {
    pushPrice($(el).text().trim());
  });

  $('[class*="price"]').each((_, el) => {
    const t = $(el).text();
    if (t.includes("€")) pushPrice(t);
  });

  return prices;
}

async function scrapeEbayEuMode(
  query: ScrapeQuery,
  mode: EbayMode
): Promise<ScrapeResult> {
  const label =
    mode === "sold" ? "eBay EU · vendute" : "eBay EU · in vendita";

  if (!query.searchTerm) {
    return {
      source: "ebay_eu",
      success: false,
      price: null,
      currency: "EUR",
      label,
      scrapedAt: new Date().toISOString(),
      error: "searchTerm mancante",
    };
  }

  const key = cacheKey("ebay_eu", query.productId, `${mode}|${query.searchTerm}`);
  const cached = getCached(key);
  if (cached) return cached;

  const url = buildEbayEuUrl(query.searchTerm, mode);
  const config = DEFAULT_SCRAPER_CONFIG;

  try {
    const res = await politeFetch(url, config);
    const html = await res.text();

    if (!res.ok || detectBlocked(html) || html.includes("Something went wrong")) {
      return {
        source: "ebay_eu",
        success: false,
        price: null,
        currency: "EUR",
        label,
        externalUrl: url,
        scrapedAt: new Date().toISOString(),
        error: "eBay block — usa SCRAPE_USE_PLAYWRIGHT=true in locale",
        blocked: true,
      };
    }

    const prices = extractEuroPrices(html);
    const sample = mode === "sold" ? prices.slice(0, 10) : prices.slice(0, 20);
    const price =
      mode === "sold"
        ? median(sample)
        : sample.length
          ? Math.min(...sample)
          : null;

    const result: ScrapeResult = price
      ? {
          source: "ebay_eu",
          success: true,
          price: Math.round(price * 100) / 100,
          currency: "EUR",
          label,
          externalUrl: url,
          sampleSize: sample.length,
          scrapedAt: new Date().toISOString(),
        }
      : {
          source: "ebay_eu",
          success: false,
          price: null,
          currency: "EUR",
          label,
          externalUrl: url,
          scrapedAt: new Date().toISOString(),
          error:
            mode === "sold"
              ? "Nessuna vendita EU trovata"
              : "Nessun annuncio EU in vendita",
        };

    if (result.success) {
      setCached(key, result, config.cacheTtlSeconds);
    }

    return result;
  } catch (e) {
    return {
      source: "ebay_eu",
      success: false,
      price: null,
      currency: "EUR",
      label,
      scrapedAt: new Date().toISOString(),
      error: e instanceof Error ? e.message : "Errore scrape eBay EU",
    };
  }
}

async function scrapeEbayEu(query: ScrapeQuery): Promise<ScrapeResult> {
  const [sold, active] = await Promise.all([
    scrapeEbayEuMode(query, "sold"),
    scrapeEbayEuMode(query, "active"),
  ]);

  const primary = sold.success ? sold : active.success ? active : sold;

  return {
    ...primary,
    label: sold.success
      ? "eBay EU · vendute (UE)"
      : active.success
        ? "eBay EU · in vendita (UE)"
        : "eBay EU · vendute (UE)",
    activeListingPrice: active.success ? active.price ?? undefined : undefined,
    activeListingUrl: active.externalUrl,
    activeListingLabel: active.success ? active.label : undefined,
  };
}

/** @deprecated Usare ebay_eu — mantenuto per compatibilità snapshot */
export const ebayItScraper: Scraper = {
  id: "ebay_it",
  label: "eBay Italia",
  supports: ["graded", "raw", "sealed", "accessory"],
  scrape: (q) => scrapeEbayEu(q),
};

/** @deprecated Usare ebay_eu */
export const ebayUsScraper: Scraper = {
  id: "ebay_us",
  label: "eBay US",
  supports: ["graded", "raw", "sealed", "accessory"],
  scrape: (q) => scrapeEbayEu(q),
};

export const ebayEuScraper: Scraper = {
  id: "ebay_eu",
  label: "eBay EU",
  supports: ["graded", "raw", "sealed", "accessory"],
  scrape: scrapeEbayEu,
};
