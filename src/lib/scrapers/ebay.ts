import * as cheerio from "cheerio";
import type { Scraper, ScrapeQuery, ScrapeResult } from "./types";
import { DEFAULT_SCRAPER_CONFIG } from "./types";
import { cacheKey, getCached, setCached } from "./cache";
import {
  detectBlocked,
  median,
  parseUsdPrice,
  parseEuroPrice,
  politeFetch,
} from "./http";

type EbayHost = "ebay_it" | "ebay_us";

function buildEbayUrl(host: EbayHost, searchTerm: string): string {
  const base = host === "ebay_it" ? "https://www.ebay.it" : "https://www.ebay.com";
  const params = new URLSearchParams({
    _nkw: searchTerm,
    LH_Sold: "1",
    LH_Complete: "1",
    _sop: "13",
    _ipg: "60",
  });
  return `${base}/sch/i.html?${params}`;
}

async function scrapeEbaySold(
  host: EbayHost,
  query: ScrapeQuery
): Promise<ScrapeResult> {
  const source = host;
  const currency = host === "ebay_it" ? "EUR" : "USD";
  const label = host === "ebay_it" ? "eBay IT · vendute" : "eBay US · vendute";

  if (!query.searchTerm) {
    return {
      source,
      success: false,
      price: null,
      currency,
      label,
      scrapedAt: new Date().toISOString(),
      error: "searchTerm mancante",
    };
  }

  const key = cacheKey(source, query.productId, query.searchTerm);
  const cached = getCached(key);
  if (cached) return cached;

  const url = buildEbayUrl(host, query.searchTerm);
  const config = DEFAULT_SCRAPER_CONFIG;

  try {
    const res = await politeFetch(url, config);
    const html = await res.text();

    if (!res.ok || detectBlocked(html) || html.includes("Something went wrong")) {
      const result: ScrapeResult = {
        source,
        success: false,
        price: null,
        currency,
        label,
        externalUrl: url,
        scrapedAt: new Date().toISOString(),
        error: "eBay block o errore — prova SCRAPE_USE_PLAYWRIGHT=true in locale",
        blocked: true,
      };
      return result;
    }

    const $ = cheerio.load(html);
    const prices: number[] = [];

    $(".s-item__price, .s-card__price").each((_, el) => {
      const t = $(el).text().trim();
      if (t.toLowerCase().includes("to ")) return; // range "EUR 10 to 20"
      const p =
        currency === "EUR" ? parseEuroPrice(t) : parseUsdPrice(t.replace("$", ""));
      if (p && p > 1 && p < 100000) prices.push(p);
    });

    // Nuovo layout eBay
    $('[class*="price"]').each((_, el) => {
      const t = $(el).text();
      if (t.includes("€") || t.includes("$")) {
        const p =
          currency === "EUR" ? parseEuroPrice(t) : parseUsdPrice(t);
        if (p && p > 1 && p < 100000) prices.push(p);
      }
    });

    const top = prices.slice(0, 10);
    const med = median(top);

    const result: ScrapeResult = med
      ? {
          source,
          success: true,
          price: Math.round(med * 100) / 100,
          currency,
          label,
          externalUrl: url,
          sampleSize: top.length,
          scrapedAt: new Date().toISOString(),
        }
      : {
          source,
          success: false,
          price: null,
          currency,
          label,
          externalUrl: url,
          scrapedAt: new Date().toISOString(),
          error: "Nessuna vendita trovata nel HTML",
        };

    if (result.success) {
      setCached(key, result, config.cacheTtlSeconds);
    }

    return result;
  } catch (e) {
    return {
      source,
      success: false,
      price: null,
      currency,
      label,
      scrapedAt: new Date().toISOString(),
      error: e instanceof Error ? e.message : "Errore scrape eBay",
    };
  }
}

export const ebayItScraper: Scraper = {
  id: "ebay_it",
  label: "eBay Italia",
  supports: ["graded", "raw", "sealed"],
  scrape: (q) => scrapeEbaySold("ebay_it", q),
};

export const ebayUsScraper: Scraper = {
  id: "ebay_us",
  label: "eBay US",
  supports: ["graded", "raw", "sealed"],
  scrape: (q) => scrapeEbaySold("ebay_us", q),
};
