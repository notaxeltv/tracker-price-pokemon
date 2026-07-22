import * as cheerio from "cheerio";
import type { ScrapeResult } from "./types";
import { detectBlocked, median, parseEuroPrice } from "./http";

function ok(
  price: number,
  url: string,
  sampleSize: number
): ScrapeResult {
  return {
    source: "cardmarket",
    success: true,
    price: Math.round(price * 100) / 100,
    currency: "EUR",
    label: "Cardmarket · Playwright",
    externalUrl: url,
    sampleSize,
    scrapedAt: new Date().toISOString(),
  };
}

export async function scrapeCardmarketWithPlaywright(
  url: string
): Promise<ScrapeResult | null> {
  try {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);
    const html = await page.content();
    await browser.close();

    if (detectBlocked(html)) return null;

    const $ = cheerio.load(html);
    const prices: number[] = [];
    $(".col-price, [data-price]").each((_, el) => {
      const p = parseEuroPrice($(el).text());
      if (p && p > 0) prices.push(p);
    });

    const med = median(prices);
    if (med == null) return null;
    return ok(med, url, prices.length);
  } catch {
    return null;
  }
}
