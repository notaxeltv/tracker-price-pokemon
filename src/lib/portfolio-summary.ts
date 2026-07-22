import type { DashboardData, PortfolioData, PortfolioSummary } from "./types";
import { getGradedMarket, getSealedMarket } from "./market-utils";
import { getGainLoss, getTotalCost } from "./portfolio";

export function computePortfolioSummary(
  data: DashboardData,
  portfolio: PortfolioData
): PortfolioSummary {
  let trackedCount = 0;
  let totalInvested = 0;
  let totalMarketValue = 0;

  for (const [key, entry] of Object.entries(portfolio.entries)) {
    const invested = getTotalCost(entry);
    if (invested == null) continue;

    const marketPrice = resolveMarketPrice(data, key);
    if (marketPrice == null || marketPrice <= 0) continue;

    trackedCount++;
    totalInvested += invested;
    totalMarketValue += marketPrice;
  }

  const totalGainLoss = totalMarketValue - totalInvested;
  const totalGainLossPercent =
    totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  return {
    trackedCount,
    totalInvested,
    totalMarketValue,
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
      sealed.language === "IT"
        ? getSealedMarket(sealed, "IT")
        : getSealedMarket(sealed, "INTL");
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

export { getGainLoss, getTotalCost };
