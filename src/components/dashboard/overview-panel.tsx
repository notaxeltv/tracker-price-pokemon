"use client";

import { cn, formatPercent, formatPrice, getChangeColor } from "@/lib/utils";
import { getDisplayGainLoss } from "@/lib/portfolio";
import type { DashboardData, PortfolioData, PortfolioSummary } from "@/lib/types";
import type { AppView } from "@/lib/types";
import { buildPortfolioRows } from "@/lib/portfolio-resolve";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

interface OverviewPanelProps {
  data: DashboardData;
  portfolio: PortfolioData;
  portfolioSummary: PortfolioSummary | null;
  alertCount: number;
  onNavigate: (view: AppView) => void;
}

export function OverviewPanel({
  data,
  portfolio,
  portfolioSummary,
  alertCount,
  onNavigate,
}: OverviewPanelProps) {
  const rows = buildPortfolioRows(data, portfolio.entries).slice(0, 5);
  const hasPortfolio = portfolioSummary && portfolioSummary.trackedCount > 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {hasPortfolio ? (
          <>
            <MetricCard
              label="Investito"
              value={formatPrice(portfolioSummary.totalInvested)}
              sub={`${portfolioSummary.trackedCount} voci`}
              icon={Wallet}
              accent="violet"
            />
            <MetricCard
              label="P/L totale"
              value={formatPrice(portfolioSummary.totalGainLoss)}
              sub={formatPercent(portfolioSummary.totalGainLossPercent)}
              icon={
                portfolioSummary.totalGainLoss >= 0 ? TrendingUp : TrendingDown
              }
              accent={portfolioSummary.totalGainLoss >= 0 ? "emerald" : "red"}
              valueClass={getChangeColor(portfolioSummary.totalGainLossPercent)}
            />
          </>
        ) : (
          <MetricCard
            label="Portfolio"
            value="Vuoto"
            sub="Registra il primo acquisto dal Mercato"
            icon={Wallet}
            accent="zinc"
          />
        )}
        <MetricCard
          label="Prodotti monitorati"
          value={String(data.stats.totalProducts)}
          sub={`${data.stats.liveCount} live · ${data.stats.blockedCount} bloccati`}
          icon={BarChart3}
          accent="blue"
        />
        <MetricCard
          label="Alert attivi"
          value={String(alertCount)}
          sub={alertCount > 0 ? "Controlla il Portfolio" : "Nessun alert"}
          icon={AlertTriangle}
          accent={alertCount > 0 ? "amber" : "zinc"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-100">Mercato EU — 7 giorni</h2>
            <button
              type="button"
              onClick={() => onNavigate("market")}
              className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200"
            >
              Apri mercato
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-3">
              <p className="text-xs text-zinc-500">Cardmarket</p>
              <p className={cn("mt-1 text-xl font-semibold", getChangeColor(data.stats.avgChange7dIT))}>
                {formatPercent(data.stats.avgChange7dIT)}
              </p>
            </div>
            <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-3">
              <p className="text-xs text-zinc-500">eBay EU</p>
              <p className={cn("mt-1 text-xl font-semibold", getChangeColor(data.stats.avgChange7dINTL))}>
                {formatPercent(data.stats.avgChange7dINTL)}
              </p>
            </div>
          </div>
          {(data.stats.topGainer || data.stats.topLoser) && (
            <div className="mt-3 space-y-2 text-xs">
              {data.stats.topGainer && (
                <p className="text-emerald-400">
                  ↑ {data.stats.topGainer.name} · {formatPercent(data.stats.topGainer.change)}
                </p>
              )}
              {data.stats.topLoser && (
                <p className="text-red-400">
                  ↓ {data.stats.topLoser.name} · {formatPercent(data.stats.topLoser.change)}
                </p>
              )}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-100">Le tue voci</h2>
            <button
              type="button"
              onClick={() => onNavigate("portfolio")}
              className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200"
            >
              Vedi tutto
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          {rows.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Nessuna voce nel portfolio. Vai su Mercato e clicca Acquisto su un prodotto.
            </p>
          ) : (
            <ul className="space-y-2">
              {rows.map((row) => {
                const pl = getDisplayGainLoss(row.entry, row.marketPrice);
                return (
                  <li
                    key={row.key}
                    className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-800/30 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-200">
                        {row.title}
                      </p>
                      {row.subtitle && (
                        <p className="truncate text-xs text-zinc-500">{row.subtitle}</p>
                      )}
                    </div>
                    {pl && (
                      <span
                        className={cn(
                          "shrink-0 text-sm font-medium",
                          pl.amount >= 0 ? "text-emerald-400" : "text-red-400"
                        )}
                      >
                        {pl.amount >= 0 ? "+" : ""}
                        {formatPrice(pl.amount)}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  valueClass,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof Wallet;
  accent: "violet" | "emerald" | "red" | "blue" | "amber" | "zinc";
  valueClass?: string;
}) {
  const accents = {
    violet: "from-violet-500/15 to-violet-600/5 border-violet-500/20",
    emerald: "from-emerald-500/15 to-emerald-600/5 border-emerald-500/20",
    red: "from-red-500/15 to-red-600/5 border-red-500/20",
    blue: "from-blue-500/15 to-blue-600/5 border-blue-500/20",
    amber: "from-amber-500/15 to-amber-600/5 border-amber-500/20",
    zinc: "from-zinc-800/40 to-zinc-900/20 border-zinc-800",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border bg-gradient-to-br p-4",
        accents[accent]
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-zinc-500">{label}</p>
          <p className={cn("mt-1 text-2xl font-semibold text-zinc-50", valueClass)}>
            {value}
          </p>
          <p className="mt-1 text-xs text-zinc-500">{sub}</p>
        </div>
        <Icon className="h-5 w-5 shrink-0 text-zinc-500" />
      </div>
    </div>
  );
}
