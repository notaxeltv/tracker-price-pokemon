import type { CatalogProduct, ScrapeQuery, ScrapeResult, ScraperSourceId } from "./types";
import { getScraper } from "./registry";

export function catalogToQuery(product: CatalogProduct, grade?: number): ScrapeQuery {
  const g = grade ?? product.grading?.grades[0];
  const company = product.grading?.company ?? "PSA";

  let searchTerm = product.scrape.searchTerm;
  if (product.kind === "graded" && g) {
    const langToken =
      product.language === "JP"
        ? "japanese"
        : product.language === "IT"
          ? "italiano"
          : product.language.toLowerCase();
    if (searchTerm) {
      searchTerm = searchTerm
        .replace(/\bpsa\s*\d+/i, `${company} ${g}`)
        .replace(/\bbgs\s*\d+/i, `${company} ${g}`)
        .replace(/\bcgc\s*\d+/i, `${company} ${g}`);
    } else {
      searchTerm =
        `pokemon ${product.name} ${product.cardNumber ?? ""} ${company} ${g} ${langToken}`.trim();
    }
  }

  return {
    productId: product.id,
    kind: product.kind,
    language: product.language,
    grading:
      product.kind === "graded" && g
        ? { company, grade: g }
        : undefined,
    searchTerm,
    cardmarketUrl: product.scrape.cardmarketUrl,
    tcgplayerProductId: product.scrape.tcgplayerProductId,
    tcgdxCardId: product.scrape.tcgdxCardId,
    meta: product.scrape.cardmarketProductId
      ? { cardmarketProductId: product.scrape.cardmarketProductId }
      : undefined,
  };
}

export async function scrapeProductSources(
  product: CatalogProduct,
  sources?: ScraperSourceId[],
  grade?: number
): Promise<ScrapeResult[]> {
  const query = catalogToQuery(product, grade);
  const ids = sources ?? product.sources;
  const results: ScrapeResult[] = [];

  for (const id of ids) {
    const scraper = getScraper(id);
    if (!scraper || !scraper.supports.includes(product.kind)) continue;
    results.push(await scraper.scrape(query));
  }

  return results;
}

export async function scrapeForRegion(
  product: CatalogProduct,
  region: "IT" | "INTL",
  grade?: number
): Promise<ScrapeResult | null> {
  const query = catalogToQuery(product, grade);

  // Mercato IT/EU: sempre Cardmarket min nella lingua del prodotto
  if (region === "IT" && product.sources.includes("cardmarket")) {
    const scraper = getScraper("cardmarket");
    if (scraper) return scraper.scrape(query);
  }

  const sourceMap: Record<string, ScraperSourceId[]> = {
    IT: ["ebay_it"],
    INTL: ["tcgplayer", "ebay_us"],
  };
  const preferred = sourceMap[region].filter((s) => product.sources.includes(s));
  let lastFailed: ScrapeResult | null = null;

  for (const id of preferred) {
    const scraper = getScraper(id);
    if (!scraper) continue;
    const result = await scraper.scrape(query);
    if (result.success && result.price != null) return result;
    lastFailed = result;
  }

  return lastFailed;
}
