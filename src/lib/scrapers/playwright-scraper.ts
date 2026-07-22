import type { ScrapeQuery, ScrapeResult } from "./types";
import { languageDisplayLabel } from "./cardmarket-language";
import { resolveMinPriceFromHtml } from "./cardmarket-parse";
import { detectBlocked, median, parseEuroPrice } from "./http";
import * as cheerio from "cheerio";

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

function extractEuroPrices(html: string): number[] {
  const $ = cheerio.load(html);
  const prices: number[] = [];

  const pushPrice = (text: string) => {
    if (text.toLowerCase().includes(" to ")) return;
    const p = parseEuroPrice(text);
    if (p && p > 1 && p < 100000) prices.push(p);
  };

  $(".s-item__price, .s-card__price").each((_, el) => {
    pushPrice($(el).text().trim());
  });

  return prices;
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

export async function scrapeEbayEuWithPlaywright(
  url: string,
  mode: "sold" | "active"
): Promise<ScrapeResult | null> {
  try {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(3000);
    const html = await page.content();
    await browser.close();

    if (detectBlocked(html)) return null;

    const prices = extractEuroPrices(html);
    const sample = mode === "sold" ? prices.slice(0, 10) : prices.slice(0, 20);
    const price =
      mode === "sold"
        ? median(sample)
        : sample.length
          ? Math.min(...sample)
          : null;

    if (!price) return null;

    const label =
      mode === "sold" ? "eBay EU · vendute" : "eBay EU · in vendita";

    return {
      source: "ebay_eu",
      success: true,
      price: Math.round(price * 100) / 100,
      currency: "EUR",
      label,
      externalUrl: url,
      sampleSize: sample.length,
      scrapedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
