/**
 * Architettura scraper estensibile — pronta per nuovi tipi di prodotto,
 * grading company, lingue e mercati senza refactor del core.
 */

export type ScraperSourceId =
  | "cardmarket"
  | "ebay_eu"
  | "ebay_it"
  | "ebay_us"
  | "tcgplayer"
  | "tcgdex";

export type ProductKind = "sealed" | "graded" | "raw" | "accessory";

export type CatalogLanguage = "JP" | "IT" | "EN" | "DE" | "FR" | "ANY";

export type GradingCompany = "PSA" | "BGS" | "CGC" | "ACE" | "TAG" | "ANY";

export interface ScrapeQuery {
  /** Identificativo interno catalogo */
  productId: string;
  kind: ProductKind;
  language?: CatalogLanguage;
  grading?: {
    company: GradingCompany;
    grade: number | string;
  };
  /** Termine di ricerca per eBay / Cardmarket search */
  searchTerm?: string;
  /** URL diretto prodotto Cardmarket */
  cardmarketUrl?: string;
  /** ID prodotto TCGPlayer */
  tcgplayerProductId?: number;
  /** ID carta TCGdex (es. SV2a-173) */
  tcgdxCardId?: string;
  /** ID prodotto Cardmarket (TCGdex pricing.cardmarket.idProduct) */
  cardmarketProductId?: number;
  /** Extra parametri per scraper futuri */
  meta?: Record<string, string | number | boolean>;
}

export interface ScrapeResult {
  source: ScraperSourceId;
  success: boolean;
  price: number | null;
  currency: "EUR" | "USD";
  label: string;
  externalUrl?: string;
  /** Prezzo min/medio da N listing se disponibile */
  sampleSize?: number;
  scrapedAt: string;
  error?: string;
  blocked?: boolean;
  /** true = dati da fetcher pubblico (TCGPlayer mpapi, TCGdex) */
  viaFetcher?: boolean;
  /** Prezzo minimo annunci attivi eBay EU (separato da vendute) */
  activeListingPrice?: number;
  activeListingUrl?: string;
  activeListingLabel?: string;
}

export interface Scraper {
  id: ScraperSourceId;
  label: string;
  supports: ProductKind[];
  scrape(query: ScrapeQuery): Promise<ScrapeResult>;
}

/** Definizione prodotto nel catalogo — estendibile */
export interface CatalogProduct {
  id: string;
  kind: ProductKind;
  name: string;
  nameLocal?: string;
  set: string;
  setCode: string;
  language: CatalogLanguage;
  imageUrl?: string;
  /** Sorgenti da interrogare (ordine = priorità display) */
  sources: ScraperSourceId[];
  sealedType?: "booster_box" | "etb" | "booster_bundle" | "collection_box" | "tin";
  cardNumber?: string;
  grading?: {
    company: GradingCompany;
    grades: number[];
  };
  scrape: {
    searchTerm?: string;
    cardmarketUrl?: string;
    cardmarketProductId?: number;
    tcgplayerProductId?: number;
    tcgdxCardId?: string;
    /** CardTrader — solo immagini (blueprint API) */
    cardtraderBlueprintId?: number;
    cardtraderExpansionId?: number;
    cardtraderNameIncludes?: string[];
  };
  /** Disabilita senza rimuovere dal catalogo */
  enabled?: boolean;
  tags?: string[];
}

export interface ScraperConfig {
  /** TTL cache in secondi */
  cacheTtlSeconds: number;
  /** Delay minimo tra richieste allo stesso host (ms) */
  requestDelayMs: number;
  /** Usa Playwright per bypass Cloudflare (locale) */
  usePlaywright: boolean;
  userAgent: string;
}

export const DEFAULT_SCRAPER_CONFIG: ScraperConfig = {
  cacheTtlSeconds: parseInt(process.env.SCRAPE_CACHE_TTL ?? "3600", 10),
  requestDelayMs: 1500,
  usePlaywright: process.env.SCRAPE_USE_PLAYWRIGHT === "true",
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
};
