import { cn } from "./utils";

export type AccentTone =
  | "violet"
  | "emerald"
  | "red"
  | "blue"
  | "amber"
  | "zinc";

const accentClasses: Record<AccentTone, string> = {
  violet: "accent-violet",
  emerald: "accent-emerald",
  red: "accent-red",
  blue: "accent-blue",
  amber: "accent-amber",
  zinc: "accent-zinc",
};

export function accentClass(accent: AccentTone): string {
  return accentClasses[accent];
}

export function metricCardClass(accent: AccentTone, extra?: string): string {
  return cn("card-metric", accentClass(accent), extra);
}

export type CategoryCardVariant = "sealed" | "graded" | "raw" | "accessory";

const categoryCardClasses: Record<CategoryCardVariant, string> = {
  sealed: "category-card-sealed",
  graded: "category-card-graded",
  raw: "category-card-raw",
  accessory: "category-card-accessory",
};

export function categoryCardClass(variant: CategoryCardVariant): string {
  return categoryCardClasses[variant];
}
