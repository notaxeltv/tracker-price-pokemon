import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency: "EUR" | "USD" = "EUR"): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function getChangeColor(value: number): string {
  if (value > 0) return "text-emerald-400";
  if (value < 0) return "text-red-400";
  return "text-zinc-400";
}

export function getSealedTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    booster_box: "Booster Box",
    etb: "Elite Trainer Box",
    booster_bundle: "Booster Bundle",
    collection_box: "Collection Box",
    tin: "Tin",
  };
  return labels[type] ?? type;
}

export function getMarketRegionLabel(region: "IT" | "INTL"): string {
  return region === "IT" ? "Italia" : "Internazionale";
}

export function getMarketRegionShort(region: "IT" | "INTL"): string {
  return region === "IT" ? "IT 🇮🇹" : "INTL 🌍";
}

export function filterHistoryByRange(
  history: { date: string; price: number }[],
  range: "7d" | "30d" | "90d" | "1y"
): { date: string; price: number }[] {
  const days: Record<string, number> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "1y": 365,
  };
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days[range]);
  return history.filter((p) => new Date(p.date) >= cutoff);
}
