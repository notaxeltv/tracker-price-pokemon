"use client";

import { cn, formatPercent, getChangeColor } from "@/lib/utils";
import type { DashboardStats } from "@/lib/types";
import {
  Package,
  Award,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react";

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "Prodotti monitorati",
      value: stats.totalProducts.toString(),
      sub: `${stats.sealedCount} sealed · ${stats.gradedCount} gradate`,
      icon: Package,
      accent: "from-blue-500/20 to-blue-600/5",
      iconColor: "text-blue-400",
    },
    {
      label: "Variazione media 7g",
      value: formatPercent(stats.avgChange7d),
      sub: "Su tutti i prodotti",
      icon: BarChart3,
      accent: "from-yellow-500/20 to-yellow-600/5",
      iconColor: getChangeColor(stats.avgChange7d),
      valueColor: getChangeColor(stats.avgChange7d),
    },
    {
      label: "Top gainers 7g",
      value: stats.topGainer?.name ?? "—",
      sub: stats.topGainer
        ? formatPercent(stats.topGainer.change)
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
      sub: stats.topLoser ? formatPercent(stats.topLoser.change) : "Nessun dato",
      icon: TrendingDown,
      accent: "from-red-500/20 to-red-600/5",
      iconColor: "text-red-400",
      valueColor: "text-red-400",
      compact: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                  card.compact ? "truncate text-lg" : "text-2xl",
                  card.valueColor
                )}
                title={card.value}
              >
                {card.value}
              </p>
              <p className={cn("mt-1 text-sm", card.valueColor ?? "text-zinc-500")}>
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
  );
}

export function HeaderBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
      <Award className="h-3.5 w-3.5" />
      Pokémon TCG Price Tracker
    </div>
  );
}
