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

/** IT = Cardmarket (min listing EU) · INTL = eBay EU (vendute/in vendita, provenienza UE) */
export async function scrapeForRegion(
  product: CatalogProduct,
  region: "IT" | "INTL",
  grade?: number
): Promise<ScrapeResult | null> {
  const query = catalogToQuery(product, grade);

  if (region === "IT") {
    if (!product.sources.includes("cardmarket")) return null;
    const scraper = getScraper("cardmarket");
    return scraper ? scraper.scrape(query) : null;
  }

  const ebaySources: ScraperSourceId[] = ["ebay_eu", "ebay_it", "ebay_us"];
  const ebayId = ebaySources.find((s) => product.sources.includes(s));
  if (!ebayId) return null;

  const scraper = getScraper(ebayId);
  return scraper ? scraper.scrape(query) : null;
}
