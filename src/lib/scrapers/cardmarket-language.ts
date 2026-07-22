import type { CatalogLanguage, ScrapeQuery } from "./types";

/** Pattern per lingua listing Cardmarket (colonna lingua + titolo) */
const LANGUAGE_MATCHERS: Record<CatalogLanguage, RegExp[]> = {
  JP: [/japanese/i, /giapponese/i, /japan/i, /\bjp\b/i, /日本語/],
  IT: [/italian/i, /italiano/i, /italia/i, /\bit\b/i],
  EN: [/english/i, /inglese/i, /\ben\b/i],
  DE: [/german/i, /tedesco/i, /deutsch/i, /\bde\b/i],
  FR: [/french/i, /francese/i, /français/i, /\bfr\b/i],
  ANY: [],
};

export function languageDisplayLabel(language?: CatalogLanguage): string {
  const map: Record<CatalogLanguage, string> = {
    JP: "JP",
    IT: "IT",
    EN: "EN",
    DE: "DE",
    FR: "FR",
    ANY: "EU",
  };
  return language ? map[language] ?? language : "EU";
}

export function matchesListingLanguage(
  text: string,
  language?: CatalogLanguage
): boolean {
  if (!language || language === "ANY") return true;
  const patterns = LANGUAGE_MATCHERS[language];
  return patterns.some((p) => p.test(text));
}

export function matchesGradingListing(
  text: string,
  grading?: ScrapeQuery["grading"]
): boolean {
  if (!grading) return true;
  const t = text.toLowerCase();
  const company = grading.company.toLowerCase();
  const grade = String(grading.grade);
  return t.includes(company) && t.includes(grade);
}

export interface CardmarketListing {
  price: number;
  context: string;
}

export function filterListingsByQuery(
  listings: CardmarketListing[],
  query: ScrapeQuery
): CardmarketListing[] {
  return listings.filter(
    (row) =>
      matchesListingLanguage(row.context, query.language) &&
      matchesGradingListing(row.context, query.grading)
  );
}

export function minimumListingPrice(
  listings: CardmarketListing[]
): number | null {
  if (!listings.length) return null;
  return Math.min(...listings.map((l) => l.price));
}
