export type ProductCategory = "sealed" | "graded" | "raw" | "accessory";

export type GradingCompany = "PSA" | "BGS" | "CGC" | "ACE" | "TAG";

export type ProductLanguage = "JP" | "IT" | "EN";

export type SealedProductType =
  | "booster_box"
  | "etb"
  | "booster_bundle"
  | "collection_box"
  | "tin";

/** IT = Cardmarket EU · INTL = eBay EU (provenienza UE) */
export type MarketRegion = "IT" | "INTL";

export type PriceSource = "cardmarket" | "ebay";

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
  /** Prezzo min annunci eBay EU attivi (separato da vendute) */
  activeListingPrice?: number;
  activeListingUrl?: string;
  activeListingLabel?: string;
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
  language: "IT" | "EN" | "JP";
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
  /** Lingua carta gradata */
  language: "JP" | "EN";
  imageUrl?: string;
  grades: GradedPrice[];
  tcgdxCardId?: string;
  pkmnPricesCardId?: number;
}

export interface RawCard {
  id: string;
  category: "raw";
  name: string;
  nameJa?: string;
  set: string;
  setCode: string;
  cardNumber: string;
  language: ProductLanguage;
  imageUrl?: string;
  markets: MarketQuote[];
  tcgdxCardId?: string;
}

export interface AccessoryProduct {
  id: string;
  category: "accessory";
  name: string;
  language: ProductLanguage;
  imageUrl?: string;
  markets: MarketQuote[];
}

export type Product = SealedProduct | GradedCard | RawCard | AccessoryProduct;

export interface DashboardStats {
  totalProducts: number;
  sealedCount: number;
  sealedItCount: number;
  sealedEnCount: number;
  sealedJpCount: number;
  gradedCount: number;
  gradedJpCount: number;
  gradedEnCount: number;
  rawCount: number;
  accessoryCount: number;
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
  raw: RawCard[];
  accessory: AccessoryProduct[];
  lastUpdated: string;
  dataSource: "live" | "mixed" | "demo" | "scrape_blocked" | "snapshot";
}

export type TimeRange = "7d" | "30d" | "90d" | "1y";

export type SortField = "name" | "price" | "change7d" | "change30d";
export type SortDirection = "asc" | "desc";

export type MarketFilter = "all" | "IT" | "INTL" | "compare";
export type SealedLanguageFilter = "all" | "IT" | "EN" | "JP";
export type GradingCompanyFilter = "all" | GradingCompany;

export interface ProductFilters {
  category: ProductCategory | "all";
  search: string;
  market: MarketFilter;
  sealedLanguage: SealedLanguageFilter;
  gradingCompany?: GradingCompanyFilter;
  grade?: number;
  sortField: SortField;
  sortDirection: SortDirection;
  /** Mostra solo prodotti con dati portfolio */
  portfolioOnly?: boolean;
}

/** Dati portfolio manuali — separati dallo snapshot prezzi di mercato. */
export interface PortfolioEntry {
  purchasePrice?: number;
  purchaseDate?: string;
  notes?: string;
  hasPlexiglassCase?: boolean;
  plexiglassCost?: number;
  /** Prezzo di vendita effettivo */
  soldPrice?: number;
  soldDate?: string;
}

export interface PortfolioData {
  entries: Record<string, PortfolioEntry>;
  updatedAt: string;
}

export interface PortfolioSummary {
  trackedCount: number;
  soldCount: number;
  totalInvested: number;
  totalMarketValue: number;
  unrealizedGainLoss: number;
  realizedGainLoss: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
}
