import type {
  GradedCard,
  GradedPrice,
  MarketQuote,
  MarketRegion,
  SealedProduct,
} from "./types";

export function getMarketQuote(
  markets: MarketQuote[],
  region: MarketRegion
): MarketQuote | undefined {
  return markets.find((m) => m.region === region);
}

export function getSealedMarket(
  product: SealedProduct,
  region: MarketRegion
): MarketQuote | undefined {
  return getMarketQuote(product.markets, region);
}

export function getGradedMarket(
  grade: GradedPrice,
  region: MarketRegion
): MarketQuote | undefined {
  return getMarketQuote(grade.markets, region);
}

export function getPrimaryMarketQuote(
  markets: MarketQuote[],
  preferred: MarketRegion = "IT"
): MarketQuote {
  return (
    getMarketQuote(markets, preferred) ??
    getMarketQuote(markets, preferred === "IT" ? "INTL" : "IT") ??
    markets[0]
  );
}

export function getAllMarketQuotesFromGraded(card: GradedCard): MarketQuote[] {
  return card.grades.flatMap((g) => g.markets);
}

export function getMaxPriceForRegion(
  card: GradedCard,
  region: MarketRegion
): number {
  return Math.max(
    ...card.grades.map(
      (g) => getGradedMarket(g, region)?.price ?? 0
    )
  );
}

export function getMaxChange7dForRegion(
  card: GradedCard,
  region: MarketRegion
): number {
  return Math.max(
    ...card.grades.map(
      (g) => getGradedMarket(g, region)?.change7d ?? -Infinity
    )
  );
}
