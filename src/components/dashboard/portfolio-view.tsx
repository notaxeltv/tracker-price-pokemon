"use client";

import { cn, formatPercent, formatPrice } from "@/lib/utils";
import { downloadPortfolioExport } from "@/lib/portfolio-export";
import { buildPortfolioRows } from "@/lib/portfolio-resolve";
import {
  getDisplayGainLoss,
  getPriceAlertStatus,
  getQuantity,
  getTotalCost,
  isSold,
} from "@/lib/portfolio";
import {
  PlexiglassBadge,
  PortfolioMetaBadges,
  PriceAlertBadge,
  SoldBadge,
} from "./portfolio-panel";
import type { DashboardData, PortfolioData } from "@/lib/types";
import { Download, FileSpreadsheet, FolderOpen } from "lucide-react";

interface PortfolioViewProps {
  data: DashboardData;
  portfolio: PortfolioData;
  onEdit: (key: string, title: string, subtitle?: string) => void;
  onSold: (key: string, title: string, subtitle?: string) => void;
}

export function PortfolioView({
  data,
  portfolio,
  onEdit,
  onSold,
}: PortfolioViewProps) {
  const rows = buildPortfolioRows(data, portfolio.entries);

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-12 text-center">
        <FolderOpen className="mx-auto mb-3 h-10 w-10 text-zinc-600" />
        <p className="text-zinc-400">Nessuna voce nel portfolio.</p>
        <p className="mt-1 text-sm text-zinc-500">
          Registra un acquisto dalla tabella prodotti oppure attiva il filtro
          &quot;Solo portfolio&quot;.
        </p>
      </div>
    );
  }

  const alertCount = rows.filter(
    (r) => !isSold(r.entry) && getPriceAlertStatus(r.entry, r.marketPrice) != null
  ).length;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-200">
            <span className="h-2 w-2 rounded-full bg-violet-400" />
            Il tuo portfolio
            <span className="text-sm font-normal text-zinc-500">
              ({rows.length} voci)
            </span>
          </h2>
          {alertCount > 0 && (
            <p className="mt-1 text-sm text-amber-400">
              {alertCount} alert prezzo attivi
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => downloadPortfolioExport(data, portfolio, "csv")}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => downloadPortfolioExport(data, portfolio, "json")}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
          >
            <Download className="h-4 w-4" />
            Export JSON
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3 font-medium">Prodotto</th>
                <th className="px-4 py-3 font-medium text-right">Qty</th>
                <th className="px-4 py-3 font-medium text-right">Investito</th>
                <th className="px-4 py-3 font-medium text-right">Mercato</th>
                <th className="px-4 py-3 font-medium text-right">P/L</th>
                <th className="px-4 py-3 font-medium">Stato</th>
                <th className="px-4 py-3 font-medium text-right">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const pl = getDisplayGainLoss(row.entry, row.marketPrice);
                const total = getTotalCost(row.entry);
                const qty = getQuantity(row.entry);
                const marketValue =
                  row.marketPrice != null && !isSold(row.entry)
                    ? row.marketPrice * qty
                    : null;

                return (
                  <tr
                    key={row.key}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-100">{row.title}</p>
                      {row.subtitle && (
                        <p className="text-xs text-zinc-500">{row.subtitle}</p>
                      )}
                      <div className="mt-1 flex flex-wrap gap-1">
                        <PlexiglassBadge entry={row.entry} />
                        <SoldBadge entry={row.entry} />
                        <PriceAlertBadge
                          entry={row.entry}
                          marketPrice={row.marketPrice}
                        />
                      </div>
                      <PortfolioMetaBadges
                        entry={row.entry}
                        marketPrice={row.marketPrice}
                      />
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-300">{qty}</td>
                    <td className="px-4 py-3 text-right font-medium text-zinc-200">
                      {total != null ? formatPrice(total) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-300">
                      {isSold(row.entry) ? (
                        <span className="text-emerald-400">
                          {formatPrice(row.entry.soldPrice!)}
                        </span>
                      ) : marketValue != null ? (
                        formatPrice(marketValue)
                      ) : (
                        "—"
                      )}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right font-medium",
                        pl && pl.amount >= 0 ? "text-emerald-400" : "text-red-400"
                      )}
                    >
                      {pl ? (
                        <>
                          {pl.amount >= 0 ? "+" : ""}
                          {formatPrice(pl.amount)}
                          <span className="ml-1 text-xs text-zinc-500">
                            ({formatPercent(pl.percent)})
                          </span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-xs font-medium",
                          isSold(row.entry)
                            ? "bg-emerald-500/10 text-emerald-300"
                            : "bg-violet-500/10 text-violet-300"
                        )}
                      >
                        {isSold(row.entry) ? "Venduto" : "In portfolio"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(row.key, row.title, row.subtitle)}
                          className="rounded-lg border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                        >
                          Acquisto
                        </button>
                        {!isSold(row.entry) && total != null && (
                          <button
                            type="button"
                            onClick={() => onSold(row.key, row.title, row.subtitle)}
                            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300 hover:bg-emerald-500/20"
                          >
                            Vendi
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
