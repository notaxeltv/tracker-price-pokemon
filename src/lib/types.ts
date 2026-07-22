export type ProductCategory = "sealed" | "graded";

/** Solo PSA attivo; BGS/CGC pronti nel catalogo */
export type GradingCompany = "PSA" | "BGS" | "CGC";

export type ProductLanguage = "JP" | "IT" | "EN";

export type SealedProductType =
  | "booster_box"
  | "etb"
  | "booster_bundle"
  | "collection_box"
  | "tin";

/** IT = mercato italiano/EU (Cardmarket) · INTL = mercato ENG/US (TCGPlayer/eBay) */
export type MarketRegion = "IT" | "INTL";

export type PriceSource = "cardmarket" | "tcgplayer" | "ebay";

export interface PricePoint {
  date: string;
  price: number;
}

export interface MarketQuote {
  region: MarketRegion;
  source: PriceSource;
  sourceLabel: string;
  price: number;
  currency: "EUR" | "USD";
  change24h: number;
  change7d: number;
  change30d: number;
  history: PricePoint[];
  externalUrl?: string;
  live?: boolean;
  blocked?: boolean;
  scrapeError?: string;
  viaFetcher?: boolean;
  sampleSize?: number;
  scrapedAt?: string;
}

export interface GradedPrice {
  company: GradingCompany;
  grade: number;
  markets: MarketQuote[];
}

export interface SealedProduct {
  id: string;
  category: "sealed";
  name: string;
  set: string;
  setCode: string;
  type: SealedProductType;
  /** Lingua/edizione del prodotto sealed */
  language: "IT" | "EN";
  imageUrl?: string;
  markets: MarketQuote[];
  tcgplayerProductId?: number;
}

export interface GradedCard {
  id: string;
  category: "graded";
  name: string;
  nameJa?: string;
  set: string;
  setCode: string;
  cardNumber: string;
  /** Carte gradate JP PSA */
  language: "JP";
  imageUrl?: string;
  grades: GradedPrice[];
  tcgdxCardId?: string;
  pkmnPricesCardId?: number;
}

export type Product = SealedProduct | GradedCard;

export interface DashboardStats {
  totalProducts: number;
  sealedCount: number;
  sealedItCount: number;
  sealedEnCount: number;
  gradedCount: number;
  avgChange7dIT: number;
  avgChange7dINTL: number;
  topGainer: { name: string; change: number; region: MarketRegion } | null;
  topLoser: { name: string; change: number; region: MarketRegion } | null;
  liveCount: number;
  blockedCount: number;
}

export interface DashboardData {
  stats: DashboardStats;
  sealed: SealedProduct[];
  graded: GradedCard[];
  lastUpdated: string;
  dataSource: "live" | "mixed" | "demo" | "scrape_blocked";
}

export type TimeRange = "7d" | "30d" | "90d" | "1y";

export type SortField = "name" | "price" | "change7d" | "change30d";
export type SortDirection = "asc" | "desc";

export type MarketFilter = "all" | "IT" | "INTL" | "compare";
export type SealedLanguageFilter = "all" | "IT" | "EN";

export interface ProductFilters {
  category: ProductCategory | "all";
  search: string;
  market: MarketFilter;
  sealedLanguage: SealedLanguageFilter;
  psaGrade?: number;
  sortField: SortField;
  sortDirection: SortDirection;
}
