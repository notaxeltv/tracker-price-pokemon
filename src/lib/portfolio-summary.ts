import type { DashboardData, PortfolioData, PortfolioSummary } from "./types";
import { getGradedMarket, getSealedMarket } from "./market-utils";
import {
  getRealizedGainLoss,
  getQuantity,
  getTotalCost,
  getUnrealizedGainLoss,
  isSold,
} from "./portfolio";

export function computePortfolioSummary(
  data: DashboardData,
  portfolio: PortfolioData
): PortfolioSummary {
  let trackedCount = 0;
  let soldCount = 0;
  let totalInvested = 0;
  let totalMarketValue = 0;
  let unrealizedGainLoss = 0;
  let realizedGainLoss = 0;

  for (const [key, entry] of Object.entries(portfolio.entries)) {
    const invested = getTotalCost(entry);
    if (invested == null) continue;

    trackedCount++;
    totalInvested += invested;

    if (isSold(entry)) {
      soldCount++;
      const realized = getRealizedGainLoss(entry);
      if (realized) realizedGainLoss += realized.amount;
      continue;
    }

    const marketPrice = resolveMarketPrice(data, key);
    if (marketPrice == null || marketPrice <= 0) continue;

    totalMarketValue += marketPrice * getQuantity(entry);
    const unrealized = getUnrealizedGainLoss(marketPrice, entry);
    if (unrealized) unrealizedGainLoss += unrealized.amount;
  }

  const totalGainLoss = unrealizedGainLoss + realizedGainLoss;
  const totalGainLossPercent =
    totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  return {
    trackedCount,
    soldCount,
    totalInvested,
    totalMarketValue,
    unrealizedGainLoss,
    realizedGainLoss,
    totalGainLoss,
    totalGainLossPercent,
  };
}

function resolveMarketPrice(data: DashboardData, key: string): number | null {
  const colon = key.indexOf(":");
  const productId = colon === -1 ? key : key.slice(0, colon);
  const gradeKey = colon === -1 ? undefined : key.slice(colon + 1);

  const sealed = data.sealed.find((p) => p.id === productId);
  if (sealed) {
    const quote =
      getSealedMarket(sealed, "IT") ?? getSealedMarket(sealed, "INTL");
    return quote?.price ?? null;
  }

  const graded = data.graded.find((c) => c.id === productId);
  if (graded && gradeKey) {
    const grade = graded.grades.find((g) => `${g.company}-${g.grade}` === gradeKey);
    if (grade) {
      const quote =
        getGradedMarket(grade, "IT") ?? getGradedMarket(grade, "INTL");
      return quote?.price ?? null;
    }
  }

  const raw = data.raw.find((c) => c.id === productId);
  if (raw) {
    const quote =
      raw.markets.find((m) => m.region === "IT") ??
      raw.markets.find((m) => m.region === "INTL");
    return quote?.price ?? null;
  }

  const accessory = data.accessory.find((p) => p.id === productId);
  if (accessory) {
    const quote =
      accessory.markets.find((m) => m.region === "IT") ??
      accessory.markets.find((m) => m.region === "INTL");
    return quote?.price ?? null;
  }

  return null;
}

export function resolveQuotePriceForKey(
  data: DashboardData,
  key: string
): number | null {
  return resolveMarketPrice(data, key);
}

export { getTotalCost };
