"use client";

import { cn, formatPercent, formatPrice, getChangeColor } from "@/lib/utils";
import { metricCardClass } from "@/lib/design";
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
import type { AccentTone } from "@/lib/design";

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
        <section className="card-padded">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="heading-section">Mercato EU — 7 giorni</h2>
            <button
              type="button"
              onClick={() => onNavigate("market")}
              className="text-link"
            >
              Apri mercato
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="stat-box-it">
              <p className="text-xs text-market-it">Cardmarket</p>
              <p className={cn("mt-1 text-xl font-semibold", getChangeColor(data.stats.avgChange7dIT))}>
                {formatPercent(data.stats.avgChange7dIT)}
              </p>
            </div>
            <div className="stat-box-intl">
              <p className="text-xs text-market-intl">eBay EU</p>
              <p className={cn("mt-1 text-xl font-semibold", getChangeColor(data.stats.avgChange7dINTL))}>
                {formatPercent(data.stats.avgChange7dINTL)}
              </p>
            </div>
          </div>
          {(data.stats.topGainer || data.stats.topLoser) && (
            <div className="mt-3 space-y-2 text-xs">
              {data.stats.topGainer && (
                <p className="text-market-it">
                  ↑ {data.stats.topGainer.name} · {formatPercent(data.stats.topGainer.change)}
                </p>
              )}
              {data.stats.topLoser && (
                <p className="text-pokemon-red/90">
                  ↓ {data.stats.topLoser.name} · {formatPercent(data.stats.topLoser.change)}
                </p>
              )}
            </div>
          )}
        </section>

        <section className="card-padded">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="heading-section">Le tue voci</h2>
            <button
              type="button"
              onClick={() => onNavigate("portfolio")}
              className="text-link"
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
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-zinc-800/30 px-3 py-2.5"
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
                          pl.amount >= 0 ? "text-market-it" : "text-pokemon-red/90"
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
  accent: AccentTone;
  valueClass?: string;
}) {
  return (
    <div className={metricCardClass(accent)}>
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
