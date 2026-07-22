export type ProductCategory = "sealed" | "graded";

export type GradingCompany = "PSA" | "BGS" | "CGC";

export type SealedProductType =
  | "booster_box"
  | "etb"
  | "booster_bundle"
  | "collection_box"
  | "tin";

export interface PricePoint {
  date: string;
  price: number;
}

export interface GradedPrice {
  company: GradingCompany;
  grade: number;
  price: number;
  change24h: number;
  change7d: number;
  change30d: number;
  history: PricePoint[];
}

export interface SealedProduct {
  id: string;
  category: "sealed";
  name: string;
  set: string;
  setCode: string;
  type: SealedProductType;
  imageUrl?: string;
  price: number;
  currency: "EUR" | "USD";
  change24h: number;
  change7d: number;
  change30d: number;
  history: PricePoint[];
  market: "EU" | "US";
}

export interface GradedCard {
  id: string;
  category: "graded";
  name: string;
  set: string;
  setCode: string;
  cardNumber: string;
  imageUrl?: string;
  grades: GradedPrice[];
  market: "EU" | "US";
}

export type Product = SealedProduct | GradedCard;

export interface DashboardStats {
  totalProducts: number;
  sealedCount: number;
  gradedCount: number;
  avgChange7d: number;
  topGainer: { name: string; change: number } | null;
  topLoser: { name: string; change: number } | null;
}

export interface DashboardData {
  stats: DashboardStats;
  sealed: SealedProduct[];
  graded: GradedCard[];
  lastUpdated: string;
}

export type TimeRange = "7d" | "30d" | "90d" | "1y";

export type SortField = "name" | "price" | "change7d" | "change30d";
export type SortDirection = "asc" | "desc";

export interface ProductFilters {
  category: ProductCategory | "all";
  search: string;
  market: "all" | "EU" | "US";
  gradingCompany?: GradingCompany;
  sortField: SortField;
  sortDirection: SortDirection;
}
