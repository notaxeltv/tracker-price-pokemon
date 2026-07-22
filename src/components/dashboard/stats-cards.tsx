"use client";

import { cn, formatPercent, formatPrice, getChangeColor, getMarketRegionLabel } from "@/lib/utils";
import type { DashboardStats, PortfolioSummary } from "@/lib/types";
import {
  Package,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Globe,
  Wallet,
} from "lucide-react";

interface StatsCardsProps {
  stats: DashboardStats;
  portfolioSummary?: PortfolioSummary | null;
}

export function StatsCards({ stats, portfolioSummary }: StatsCardsProps) {
  const portfolioCards =
    portfolioSummary && portfolioSummary.trackedCount > 0
      ? [
          {
            label: "Portfolio — investito",
            value: formatPrice(portfolioSummary.totalInvested),
            sub: `${portfolioSummary.trackedCount} voci con prezzo acquisto`,
            icon: Wallet,
            accent: "from-violet-500/20 to-violet-600/5",
            iconColor: "text-violet-400",
          },
          {
            label: "Portfolio — valore mercato",
            value: formatPrice(portfolioSummary.totalMarketValue),
            sub: "Confronto vs prezzi live/snapshot",
            icon: BarChart3,
            accent: "from-indigo-500/20 to-indigo-600/5",
            iconColor: "text-indigo-400",
          },
          {
            label: "Portfolio — P/L totale",
            value: formatPrice(portfolioSummary.totalGainLoss),
            sub: formatPercent(portfolioSummary.totalGainLossPercent),
            icon: portfolioSummary.totalGainLoss >= 0 ? TrendingUp : TrendingDown,
            accent:
              portfolioSummary.totalGainLoss >= 0
                ? "from-emerald-500/20 to-emerald-600/5"
                : "from-red-500/20 to-red-600/5",
            iconColor: getChangeColor(portfolioSummary.totalGainLossPercent),
            valueColor: getChangeColor(portfolioSummary.totalGainLossPercent),
          },
        ]
      : [];

  const cards = [
    {
      label: "Prodotti monitorati",
      value: stats.totalProducts.toString(),
      sub: `${stats.sealedItCount} ITA · ${stats.sealedEnCount} ENG · ${stats.sealedJpCount} JP · ${stats.gradedJpCount} PSA JP · ${stats.gradedEnCount} grad. EN · ${stats.rawCount} raw · ${stats.liveCount} live`,
      icon: Package,
      accent: "from-blue-500/20 to-blue-600/5",
      iconColor: "text-blue-400",
    },
    {
      label: "Var. media 7g — Italia",
      value: formatPercent(stats.avgChange7dIT),
      sub: "Cardmarket IT / eBay IT",
      icon: BarChart3,
      accent: "from-green-500/20 to-green-600/5",
      iconColor: getChangeColor(stats.avgChange7dIT),
      valueColor: getChangeColor(stats.avgChange7dIT),
    },
    {
      label: "Var. media 7g — Internazionale",
      value: formatPercent(stats.avgChange7dINTL),
      sub: "TCGPlayer / eBay US",
      icon: Globe,
      accent: "from-orange-500/20 to-orange-600/5",
      iconColor: getChangeColor(stats.avgChange7dINTL),
      valueColor: getChangeColor(stats.avgChange7dINTL),
    },
    {
      label: "Top gainers 7g",
      value: stats.topGainer?.name ?? "—",
      sub: stats.topGainer
        ? `${formatPercent(stats.topGainer.change)} · ${getMarketRegionLabel(stats.topGainer.region)}`
        : "Nessun dato",
      icon: TrendingUp,
      accent: "from-emerald-500/20 to-emerald-600/5",
      iconColor: "text-emerald-400",
      valueColor: "text-emerald-400",
      compact: true,
    },
    {
      label: "Top losers 7g",
      value: stats.topLoser?.name ?? "—",
      sub: stats.topLoser
        ? `${formatPercent(stats.topLoser.change)} · ${getMarketRegionLabel(stats.topLoser.region)}`
        : "Nessun dato",
      icon: TrendingDown,
      accent: "from-red-500/20 to-red-600/5",
      iconColor: "text-red-400",
      valueColor: "text-red-400",
      compact: true,
    },
  ];

  return (
    <div className="space-y-4">
      {portfolioCards.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {portfolioCards.map((card) => (
            <div
              key={card.label}
              className={cn(
                "relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-sm",
                `bg-gradient-to-br ${card.accent}`
              )}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-400">{card.label}</p>
                  <p
                    className={cn(
                      "mt-1 text-2xl font-semibold tracking-tight text-zinc-50",
                      card.valueColor
                    )}
                  >
                    {card.value}
                  </p>
                  <p className={cn("mt-1 text-xs", card.valueColor ?? "text-zinc-500")}>
                    {card.sub}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800/80",
                    card.iconColor
                  )}
                >
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
        <div
          key={card.label}
          className={cn(
            "relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-sm",
            `bg-gradient-to-br ${card.accent}`
          )}
        >
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-400">{card.label}</p>
              <p
                className={cn(
                  "mt-1 font-semibold tracking-tight text-zinc-50",
                  card.compact ? "truncate text-base" : "text-2xl",
                  card.valueColor
                )}
                title={card.value}
              >
                {card.value}
              </p>
              <p className={cn("mt-1 text-xs", card.valueColor ?? "text-zinc-500")}>
                {card.sub}
              </p>
            </div>
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800/80",
                card.iconColor
              )}
            >
              <card.icon className="h-5 w-5" />
            </div>
          </div>
        </div>
        ))}
      </div>
    </div>
  );
}

export function HeaderBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
      <Globe className="h-3.5 w-3.5" />
      PSA JP · BGS/CGC · Sealed · Raw
    </div>
  );
}

export function MarketSourcesBanner() {
  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-200">Il tuo portfolio</p>
          <p className="mt-1 text-xs text-zinc-500">
            Prezzo acquisto manuale · teca plexiglass opzionale · P/L vs mercato
          </p>
        </div>
          <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/5 px-3 py-2">
            <span className="font-medium text-violet-300">🇯🇵 PSA JP</span>
            <span className="text-zinc-500">eBay · Cardmarket</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2">
            <span className="font-medium text-amber-300">🏆 BGS/CGC EN</span>
            <span className="text-zinc-500">eBay · Cardmarket</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 px-3 py-2">
            <span className="font-medium text-green-400">🇮🇹 Sealed ITA</span>
            <span className="text-zinc-500">Cardmarket scrape</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/5 px-3 py-2">
            <span className="font-medium text-blue-400">🇬🇧 Sealed ENG</span>
            <span className="text-zinc-500">TCGPlayer live</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-pink-500/20 bg-pink-500/5 px-3 py-2">
            <span className="font-medium text-pink-300">📦 Sealed JP · Raw</span>
            <span className="text-zinc-500">eBay · TCGPlayer</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 px-3 py-2">
            <span className="font-medium text-zinc-300">⏱ Cron</span>
            <span className="text-zinc-500">npm run scrape</span>
          </div>
        </div>
      </div>
    </div>
  );
}
