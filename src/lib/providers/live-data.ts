import type { PricePoint } from "../types";

const TCGPLAYER_PRICE = "https://mpapi.tcgplayer.com/v2/product";

interface TcgPlayerPricePoint {
  printingType: string;
  marketPrice: number | null;
  listedMedianPrice: number | null;
}

export async function fetchTcgPlayerMarketPrice(
  productId: number
): Promise<number | null> {
  try {
    const res = await fetch(`${TCGPLAYER_PRICE}/${productId}/pricepoints`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data: TcgPlayerPricePoint[] = await res.json();
    const withPrice = data.filter((p) => p.marketPrice != null && p.marketPrice > 0);
    if (!withPrice.length) {
      const listed = data.find((p) => p.listedMedianPrice != null);
      return listed?.listedMedianPrice ?? null;
    }
    return Math.max(...withPrice.map((p) => p.marketPrice!));
  } catch {
    return null;
  }
}

interface TcgdexPricing {
  cardmarket?: {
    trend?: number;
    avg7?: number;
    avg30?: number;
    avg1?: number;
    low?: number;
    updated?: string;
  };
  tcgplayer?: Record<
    string,
    { marketPrice?: number; lowPrice?: number; midPrice?: number }
  >;
}

interface TcgdexVariant {
  type: string;
  pricing?: TcgdexPricing;
}

interface TcgdexCard {
  id: string;
  name: string;
  image?: string;
  localId?: string;
  variants_detailed?: TcgdexVariant[];
}

export async function fetchTcgdexCard(
  cardId: string,
  lang: "ja" | "en" = "ja"
): Promise<TcgdexCard | null> {
  try {
    const res = await fetch(`https://api.tcgdex.net/v2/${lang}/cards/${cardId}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export function extractTcgdexPricing(card: TcgdexCard): {
  eurTrend: number | null;
  usdMarket: number | null;
  change7d: number;
  change30d: number;
} {
  const variant =
    card.variants_detailed?.find((v) => v.pricing) ??
    card.variants_detailed?.[0];
  const cm = variant?.pricing?.cardmarket;
  const tp = variant?.pricing?.tcgplayer;

  const eurTrend = cm?.trend ?? cm?.avg7 ?? null;
  const usdMarket =
    tp?.holofoil?.marketPrice ??
    tp?.normal?.marketPrice ??
    tp?.reverse?.marketPrice ??
    tp?.["reverse-holofoil"]?.marketPrice ??
    null;

  const change7d =
    cm?.avg7 && cm?.trend
      ? Math.round(((cm.trend - cm.avg7) / cm.avg7) * 1000) / 10
      : 0;
  const change30d =
    cm?.avg30 && cm?.trend
      ? Math.round(((cm.trend - cm.avg30) / cm.avg30) * 1000) / 10
      : 0;

  return { eurTrend, usdMarket, change7d, change30d };
}

export function buildFlatHistory(
  currentPrice: number,
  change30d: number
): PricePoint[] {
  const points: PricePoint[] = [];
  const trend = change30d / 100;
  let price = currentPrice / (1 + trend * 0.5);

  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    price = price * (1 + trend / 30);
    points.push({
      date: date.toISOString().split("T")[0],
      price: Math.round(price * 100) / 100,
    });
  }
  points[points.length - 1].price = currentPrice;
  return points;
}

const PKMNPRICES_BASE = "https://api.pkmnprices.com/v1";

export async function fetchPkmnPricesCardEbayPsa(
  cardId: number,
  grade: number
): Promise<{ priceUsd: number; count: number } | null> {
  const apiKey = process.env.PKMNPRICES_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `${PKMNPRICES_BASE}/cards/${cardId}/listings/ebay?grader=PSA&grade=${grade}&limit=10&sort=date_desc`;
    const res = await fetch(url, {
      headers: { "X-API-Key": apiKey },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const sales = json.data as { price: number }[];
    if (!sales?.length) return null;
    const avg =
      sales.reduce((s, x) => s + x.price, 0) / Math.min(sales.length, 5);
    return { priceUsd: Math.round(avg * 100) / 100, count: sales.length };
  } catch {
    return null;
  }
}

export async function searchPkmnPricesJpCard(
  name: string
): Promise<number | null> {
  const apiKey = process.env.PKMNPRICES_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `${PKMNPRICES_BASE}/cards?name=${encodeURIComponent(name)}&language=Japanese&per_page=3`,
      { headers: { "X-API-Key": apiKey }, next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.[0]?.id ?? null;
  } catch {
    return null;
  }
}

export async function fetchPkmnPricesSealed(
  productId: number
): Promise<{ usd: number | null; eur: number | null }> {
  const apiKey = process.env.PKMNPRICES_API_KEY;
  if (!apiKey) return { usd: null, eur: null };

  try {
    const [usdRes, eurRes] = await Promise.all([
      fetch(`${PKMNPRICES_BASE}/sealed/${productId}`, {
        headers: { "X-API-Key": apiKey },
        next: { revalidate: 3600 },
      }),
      fetch(`${PKMNPRICES_BASE}/sealed/${productId}?currency=eur`, {
        headers: { "X-API-Key": apiKey },
        next: { revalidate: 3600 },
      }),
    ]);
    const parse = async (res: Response) => {
      if (!res.ok) return null;
      const j = await res.json();
      return j.prices?.[0]?.market_price ?? null;
    };
    return { usd: await parse(usdRes), eur: await parse(eurRes) };
  } catch {
    return { usd: null, eur: null };
  }
}
