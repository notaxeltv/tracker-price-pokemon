import type { MarketQuote, MarketRegion, PriceSource } from "./types";

function generateHistory(
  basePrice: number,
  days: number,
  volatility: number,
  trend: number
): { date: string; price: number }[] {
  const points: { date: string; price: number }[] = [];
  let price = basePrice * (1 - trend);

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const noise = (Math.sin(i * 0.3) + Math.cos(i * 0.17)) * volatility;
    price = Math.max(
      basePrice * 0.5,
      price * (1 + trend / days + noise * 0.02)
    );
    points.push({
      date: date.toISOString().split("T")[0],
      price: Math.round(price * 100) / 100,
    });
  }

  return points;
}

function gradedHistory(
  basePrice: number,
  days: number,
  trend: number
): { date: string; price: number }[] {
  return generateHistory(basePrice, days, basePrice * 0.08, trend);
}

function marketQuote(
  region: MarketRegion,
  source: PriceSource,
  sourceLabel: string,
  price: number,
  currency: "EUR" | "USD",
  change24h: number,
  change7d: number,
  change30d: number,
  trend: number,
  externalUrl?: string
): MarketQuote {
  return {
    region,
    source,
    sourceLabel,
    price,
    currency,
    change24h,
    change7d,
    change30d,
    history: generateHistory(price, 365, price * 0.05, trend),
    externalUrl,
  };
}

function itSealed(
  price: number,
  change24h: number,
  change7d: number,
  change30d: number,
  trend: number,
  slug: string
): MarketQuote {
  return marketQuote(
    "IT",
    "cardmarket",
    "Cardmarket IT",
    price,
    "EUR",
    change24h,
    change7d,
    change30d,
    trend,
    `https://www.cardmarket.com/it/Pokemon/Products/${slug}`
  );
}

function intlSealedTcg(
  price: number,
  change24h: number,
  change7d: number,
  change30d: number,
  trend: number
): MarketQuote {
  return marketQuote(
    "INTL",
    "tcgplayer",
    "TCGPlayer",
    price,
    "USD",
    change24h,
    change7d,
    change30d,
    trend,
    "https://www.tcgplayer.com/search/pokemon/product"
  );
}

function itGradedEbay(
  price: number,
  change24h: number,
  change7d: number,
  change30d: number,
  trend: number
): MarketQuote {
  return marketQuote(
    "IT",
    "ebay",
    "eBay IT (vendute)",
    price,
    "EUR",
    change24h,
    change7d,
    change30d,
    trend,
    "https://www.ebay.it/sch/i.html?_nkw=pokemon+psa"
  );
}

function intlGradedEbay(
  price: number,
  change24h: number,
  change7d: number,
  change30d: number,
  trend: number
): MarketQuote {
  return marketQuote(
    "INTL",
    "ebay",
    "eBay US (vendute)",
    price,
    "USD",
    change24h,
    change7d,
    change30d,
    trend,
    "https://www.ebay.com/sch/i.html?_nkw=pokemon+psa"
  );
}

export const SEALED_PRODUCTS = [
  {
    id: "sealed-151-bb",
    category: "sealed" as const,
    name: "151 Booster Box",
    set: "Scarlet & Violet — 151",
    setCode: "MEW",
    type: "booster_box" as const,
    imageUrl: "https://images.pokemontcg.io/sv3pt5/logo.png",
    markets: [
      itSealed(289.99, 1.2, 4.8, 12.3, 0.123, "Booster-Boxes/151"),
      intlSealedTcg(312.0, 2.0, 5.5, 14.0, 0.14),
    ],
  },
  {
    id: "sealed-151-etb",
    category: "sealed" as const,
    name: "151 Elite Trainer Box",
    set: "Scarlet & Violet — 151",
    setCode: "MEW",
    type: "etb" as const,
    imageUrl: "https://images.pokemontcg.io/sv3pt5/logo.png",
    markets: [
      itSealed(74.5, -0.5, 2.1, 8.7, 0.087, "Elite-Trainer-Boxes/151"),
      intlSealedTcg(89.99, 0.8, 3.4, 10.2, 0.102),
    ],
  },
  {
    id: "sealed-evolving-bb",
    category: "sealed" as const,
    name: "Evolving Skies Booster Box",
    set: "Sword & Shield — Evolving Skies",
    setCode: "EVS",
    type: "booster_box" as const,
    imageUrl: "https://images.pokemontcg.io/swsh7/logo.png",
    markets: [
      itSealed(620.0, 2.1, 6.4, 9.8, 0.098, "Booster-Boxes/Evolving-Skies"),
      intlSealedTcg(745.0, 1.8, 5.9, 8.5, 0.085),
    ],
  },
  {
    id: "sealed-prismatic-bb",
    category: "sealed" as const,
    name: "Prismatic Evolutions Booster Box",
    set: "Scarlet & Violet — Prismatic Evolutions",
    setCode: "PRE",
    type: "booster_box" as const,
    markets: [
      itSealed(178.0, 2.8, 7.5, 20.5, 0.205, "Booster-Boxes/Prismatic-Evolutions"),
      intlSealedTcg(195.0, 3.5, 8.2, 22.1, 0.221),
    ],
  },
  {
    id: "sealed-crown-etb",
    category: "sealed" as const,
    name: "Crown Zenith Elite Trainer Box",
    set: "Sword & Shield — Crown Zenith",
    setCode: "CRZ",
    type: "etb" as const,
    imageUrl: "https://images.pokemontcg.io/swsh12pt5/logo.png",
    markets: [
      itSealed(89.0, -0.8, 3.2, 15.6, 0.156, "Elite-Trainer-Boxes/Crown-Zenith"),
      intlSealedTcg(98.5, -0.3, 2.8, 13.2, 0.132),
    ],
  },
  {
    id: "sealed-paldea-bb",
    category: "sealed" as const,
    name: "Paldea Evolved Booster Box",
    set: "Scarlet & Violet — Paldea Evolved",
    setCode: "PAL",
    type: "booster_box" as const,
    imageUrl: "https://images.pokemontcg.io/sv2/logo.png",
    markets: [
      itSealed(118.0, 0.0, -1.4, -3.2, -0.032, "Booster-Boxes/Paldea-Evolved"),
      intlSealedTcg(125.0, 0.2, -0.8, -2.1, -0.021),
    ],
  },
];

export const GRADED_CARDS = [
  {
    id: "graded-charizard-151",
    category: "graded" as const,
    name: "Charizard ex",
    set: "Scarlet & Violet — 151",
    setCode: "MEW",
    cardNumber: "199/165",
    imageUrl: "https://images.pokemontcg.io/sv3pt5/199_hires.png",
    grades: [
      {
        company: "PSA" as const,
        grade: 10,
        markets: [
          itGradedEbay(425.0, 1.5, 5.2, 18.4, 0.184),
          intlGradedEbay(468.0, 1.8, 5.8, 19.2, 0.192),
        ],
      },
      {
        company: "PSA" as const,
        grade: 9,
        markets: [
          itGradedEbay(185.0, 0.8, 3.1, 9.2, 0.092),
          intlGradedEbay(198.0, 1.0, 3.5, 10.0, 0.1),
        ],
      },
      {
        company: "BGS" as const,
        grade: 10,
        markets: [
          itGradedEbay(510.0, 2.0, 6.8, 21.0, 0.21),
          intlGradedEbay(545.0, 2.2, 7.1, 22.5, 0.225),
        ],
      },
    ],
  },
  {
    id: "graded-umbreon-vmax",
    category: "graded" as const,
    name: "Umbreon VMAX (Alt Art)",
    set: "Sword & Shield — Evolving Skies",
    setCode: "EVS",
    cardNumber: "215/203",
    imageUrl: "https://images.pokemontcg.io/swsh7/215_hires.png",
    grades: [
      {
        company: "PSA" as const,
        grade: 10,
        markets: [
          itGradedEbay(1680.0, 0.7, 3.5, 6.8, 0.068),
          intlGradedEbay(1850.0, 0.9, 4.1, 7.3, 0.073),
        ],
      },
      {
        company: "BGS" as const,
        grade: 10,
        markets: [
          itGradedEbay(2050.0, 0.9, 4.2, 7.5, 0.075),
          intlGradedEbay(2200.0, 1.1, 5.0, 8.5, 0.085),
        ],
      },
    ],
  },
  {
    id: "graded-mew-ex",
    category: "graded" as const,
    name: "Mew ex (Alt Art)",
    set: "Scarlet & Violet — 151",
    setCode: "MEW",
    cardNumber: "205/165",
    imageUrl: "https://images.pokemontcg.io/sv3pt5/205_hires.png",
    grades: [
      {
        company: "PSA" as const,
        grade: 10,
        markets: [
          itGradedEbay(275.0, 2.3, 7.5, 19.8, 0.198),
          intlGradedEbay(298.0, 2.6, 8.0, 20.5, 0.205),
        ],
      },
      {
        company: "CGC" as const,
        grade: 10,
        markets: [
          itGradedEbay(210.0, 1.8, 6.2, 16.5, 0.165),
          intlGradedEbay(225.0, 2.0, 6.8, 17.2, 0.172),
        ],
      },
    ],
  },
  {
    id: "graded-pikachu-151",
    category: "graded" as const,
    name: "Pikachu",
    set: "Scarlet & Violet — 151",
    setCode: "MEW",
    cardNumber: "173/165",
    imageUrl: "https://images.pokemontcg.io/sv3pt5/173_hires.png",
    grades: [
      {
        company: "PSA" as const,
        grade: 10,
        markets: [
          itGradedEbay(95.0, -0.5, 2.8, 11.5, 0.115),
          intlGradedEbay(105.0, -0.2, 3.2, 12.0, 0.12),
        ],
      },
    ],
  },
  {
    id: "graded-giratina-vstar",
    category: "graded" as const,
    name: "Giratina VSTAR (Alt Art)",
    set: "Sword & Shield — Lost Origin",
    setCode: "LOR",
    cardNumber: "186/196",
    imageUrl: "https://images.pokemontcg.io/swsh11/186_hires.png",
    grades: [
      {
        company: "PSA" as const,
        grade: 10,
        markets: [
          itGradedEbay(380.0, -1.2, -3.5, -8.2, -0.082),
          intlGradedEbay(395.0, -1.0, -3.0, -7.5, -0.075),
        ],
      },
    ],
  },
  {
    id: "graded-lugia-v",
    category: "graded" as const,
    name: "Lugia V (Alt Art)",
    set: "Sword & Shield — Silver Tempest",
    setCode: "SIT",
    cardNumber: "186/195",
    imageUrl: "https://images.pokemontcg.io/swsh12/186_hires.png",
    grades: [
      {
        company: "PSA" as const,
        grade: 10,
        markets: [
          itGradedEbay(485.0, 0.3, 2.5, 9.5, 0.095),
          intlGradedEbay(520.0, 0.4, 2.9, 10.1, 0.101),
        ],
      },
    ],
  },
];

// Re-export for backward compat in scripts if needed
export { generateHistory, gradedHistory };
