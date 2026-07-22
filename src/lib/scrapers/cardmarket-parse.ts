import * as cheerio from "cheerio";
import type { ScrapeQuery } from "./types";
import { parseEuroPrice } from "./http";
import {
  filterListingsByQuery,
  minimumListingPrice,
  type CardmarketListing,
} from "./cardmarket-language";

export function extractCardmarketListings(html: string): CardmarketListing[] {
  const $ = cheerio.load(html);
  const listings: CardmarketListing[] = [];
  const seen = new Set<string>();

  const pushListing = (price: number | null, context: string) => {
    if (!price || price <= 0 || price >= 50000) return;
    const key = `${price}:${context.slice(0, 80)}`;
    if (seen.has(key)) return;
    seen.add(key);
    listings.push({ price, context: context.replace(/\s+/g, " ").trim() });
  };

  // Righe listing Cardmarket (articoli in vendita)
  $("div.article-row, tr.article-row, .row.article, article.offer").each(
    (_, row) => {
      const $row = $(row);
      const context = $row.text();
      const priceText =
        $row.find(".col-price, [data-price], .price-container").first().text() ||
        context;
      pushListing(parseEuroPrice(priceText), context);
    }
  );

  // Tabella prezzi prodotto sealed / singles
  if (listings.length === 0) {
    $("[data-price], .col-price, .price-container").each((_, el) => {
      const $el = $(el);
      const row = $el.closest("tr, div.row, article, .article-row");
      pushListing(parseEuroPrice($el.text()), row.text() || $el.text());
    });
  }

  // JSON-LD (solo se non abbiamo già listing granulari)
  if (listings.length === 0) {
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html() ?? "");
        const offers = json.offers ?? json.Offer;
        const list = Array.isArray(offers) ? offers : offers ? [offers] : [];
        for (const o of list) {
          const p = parseFloat(o.price ?? o.lowPrice ?? "");
          if (!Number.isNaN(p) && p > 0) {
            pushListing(p, JSON.stringify(o));
          }
        }
      } catch {
        /* ignore */
      }
    });
  }

  return listings;
}

export function resolveMinPriceFromHtml(
  html: string,
  query: ScrapeQuery
): { price: number; sampleSize: number } | null {
  const all = extractCardmarketListings(html);
  const filtered = filterListingsByQuery(all, query);

  // Graded/raw: richiedi match lingua (+ grading se presente)
  const pool =
    query.grading || query.kind === "graded"
      ? filtered
      : filtered.length > 0
        ? filtered
        : filterListingsByQuery(all, { ...query, grading: undefined });

  const min = minimumListingPrice(pool);
  if (min == null) return null;
  return { price: min, sampleSize: pool.length };
}
