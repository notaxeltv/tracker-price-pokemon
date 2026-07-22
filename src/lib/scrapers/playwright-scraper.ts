import type { ScrapeQuery, ScrapeResult } from "./types";
import { languageDisplayLabel } from "./cardmarket-language";
import { resolveMinPriceFromHtml } from "./cardmarket-parse";
import { detectBlocked } from "./http";

function ok(
  price: number,
  url: string,
  sampleSize: number,
  query: ScrapeQuery
): ScrapeResult {
  const lang = languageDisplayLabel(query.language);
  return {
    source: "cardmarket",
    success: true,
    price: Math.round(price * 100) / 100,
    currency: "EUR",
    label: `Cardmarket · min ${lang}`,
    externalUrl: url,
    sampleSize,
    scrapedAt: new Date().toISOString(),
  };
}

export async function scrapeCardmarketWithPlaywright(
  url: string,
  query: ScrapeQuery
): Promise<ScrapeResult | null> {
  try {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2500);
    const html = await page.content();
    await browser.close();

    if (detectBlocked(html)) return null;

    const resolved = resolveMinPriceFromHtml(html, query);
    if (!resolved) return null;
    return ok(resolved.price, url, resolved.sampleSize, query);
  } catch {
    return null;
  }
}
