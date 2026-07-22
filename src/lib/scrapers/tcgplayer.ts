import type { Scraper, ScrapeQuery, ScrapeResult } from "./types";
import { DEFAULT_SCRAPER_CONFIG } from "./types";
import { cacheKey, getCached, setCached } from "./cache";

const TCGPLAYER_PRICE = "https://mpapi.tcgplayer.com/v2/product";

export const tcgplayerScraper: Scraper = {
  id: "tcgplayer",
  label: "TCGPlayer",
  supports: ["sealed", "raw"],
  async scrape(query: ScrapeQuery): Promise<ScrapeResult> {
    const label = "TCGPlayer · mpapi";
    if (!query.tcgplayerProductId) {
      return {
        source: "tcgplayer",
        success: false,
        price: null,
        currency: "USD",
        label,
        scrapedAt: new Date().toISOString(),
        error: "tcgplayerProductId mancante",
      };
    }

    const key = cacheKey("tcgplayer", query.productId, String(query.tcgplayerProductId));
    const cached = getCached(key);
    if (cached) return cached;

    try {
      const res = await fetch(
        `${TCGPLAYER_PRICE}/${query.tcgplayerProductId}/pricepoints`,
        { next: { revalidate: DEFAULT_SCRAPER_CONFIG.cacheTtlSeconds } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { marketPrice: number | null; listedMedianPrice: number | null }[] =
        await res.json();
      const prices = data
        .map((p) => p.marketPrice ?? p.listedMedianPrice)
        .filter((p): p is number => p != null && p > 0);
      const price = prices.length ? Math.max(...prices) : null;

      const result: ScrapeResult = price
        ? {
            source: "tcgplayer",
            success: true,
            price,
            currency: "USD",
            label,
            externalUrl: `https://www.tcgplayer.com/product/${query.tcgplayerProductId}`,
            sampleSize: prices.length,
            scrapedAt: new Date().toISOString(),
            viaFetcher: true,
          }
        : {
            source: "tcgplayer",
            success: false,
            price: null,
            currency: "USD",
            label,
            scrapedAt: new Date().toISOString(),
            error: "Prezzo non disponibile",
          };

      if (result.success) {
        setCached(key, result, DEFAULT_SCRAPER_CONFIG.cacheTtlSeconds);
      }
      return result;
    } catch (e) {
      return {
        source: "tcgplayer",
        success: false,
        price: null,
        currency: "USD",
        label,
        scrapedAt: new Date().toISOString(),
        error: e instanceof Error ? e.message : "Errore TCGPlayer",
      };
    }
  },
};
