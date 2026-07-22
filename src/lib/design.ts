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

const categoryIconClasses: Record<CategoryCardVariant, string> = {
  sealed: "text-pokemon-blue",
  graded: "text-brand-light",
  raw: "text-zinc-400",
  accessory: "text-zinc-500",
};

export function categoryCardClass(): string {
  return "category-card";
}

export function categoryIconClass(variant: CategoryCardVariant): string {
  return categoryIconClasses[variant];
}
