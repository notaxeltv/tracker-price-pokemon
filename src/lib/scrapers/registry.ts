import type { Scraper, ScraperSourceId } from "./types";
import { cardmarketScraper } from "./cardmarket";
import { ebayEuScraper, ebayItScraper, ebayUsScraper } from "./ebay";

const scrapers: Scraper[] = [
  cardmarketScraper,
  ebayEuScraper,
  ebayItScraper,
  ebayUsScraper,
];

const byId = new Map<ScraperSourceId, Scraper>(
  scrapers.map((s) => [s.id, s])
);

export function getScraper(id: ScraperSourceId): Scraper | undefined {
  return byId.get(id);
}

export function getAllScrapers(): Scraper[] {
  return [...scrapers];
}

export function registerScraper(scraper: Scraper): void {
  byId.set(scraper.id, scraper);
  const idx = scrapers.findIndex((s) => s.id === scraper.id);
  if (idx >= 0) scrapers[idx] = scraper;
  else scrapers.push(scraper);
}

export { scrapers };
