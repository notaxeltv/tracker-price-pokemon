import type { ScraperConfig } from "./types";

const lastRequest = new Map<string, number>();

export async function politeFetch(
  url: string,
  config: ScraperConfig,
  init?: RequestInit
): Promise<Response> {
  const host = new URL(url).host;
  const last = lastRequest.get(host) ?? 0;
  const wait = config.requestDelayMs - (Date.now() - last);
  if (wait > 0) await sleep(wait);

  lastRequest.set(host, Date.now());

  return fetch(url, {
    ...init,
    headers: {
      "User-Agent": config.userAgent,
      Accept: "text/html,application/json,*/*",
      "Accept-Language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
      ...(init?.headers ?? {}),
    },
    signal: AbortSignal.timeout(20000),
  });
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function detectBlocked(html: string): boolean {
  const lower = html.toLowerCase();
  return (
    lower.includes("cloudflare") &&
    (lower.includes("blocked") || lower.includes("attention required"))
  );
}

export function parseEuroPrice(text: string): number | null {
  const cleaned = text.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const m = cleaned.match(/([\d.]+)/);
  return m ? parseFloat(m[1]) : null;
}

export function parseUsdPrice(text: string): number | null {
  const cleaned = text.replace(/[^0-9.,]/g, "").replace(",", "");
  const m = cleaned.match(/([\d.]+)/);
  return m ? parseFloat(m[1]) : null;
}

export function buildFlatHistory(
  currentPrice: number,
  change30d: number,
  days = 30
): { date: string; price: number }[] {
  const points: { date: string; price: number }[] = [];
  const trend = change30d / 100;
  let price = currentPrice / (1 + trend * 0.5);

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    price = price * (1 + trend / days);
    points.push({
      date: date.toISOString().split("T")[0],
      price: Math.round(price * 100) / 100,
    });
  }
  if (points.length) points[points.length - 1].price = currentPrice;
  return points;
}

export function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function minimum(values: number[]): number | null {
  if (!values.length) return null;
  return Math.min(...values);
}
