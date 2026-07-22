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
import { Button } from "@/components/ui/button";
import { EmptyState, TableShell } from "@/components/ui/card";

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
      <EmptyState>
        <FolderOpen className="mx-auto mb-3 h-10 w-10 text-zinc-600" />
        <p className="text-zinc-400">Nessuna voce nel portfolio.</p>
        <p className="mt-1 text-sm text-zinc-500">
          Vai su Mercato, seleziona una categoria e clicca Acquisto su un prodotto.
        </p>
      </EmptyState>
    );
  }

  const alertCount = rows.filter(
    (r) => !isSold(r.entry) && getPriceAlertStatus(r.entry, r.marketPrice) != null
  ).length;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {alertCount > 0 && (
            <p className="text-sm text-amber-400">
              {alertCount} alert prezzo attivi
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => downloadPortfolioExport(data, portfolio, "csv")}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="secondary"
            onClick={() => downloadPortfolioExport(data, portfolio, "json")}
          >
            <Download className="h-4 w-4" />
            Export JSON
          </Button>
        </div>
      </div>

      <TableShell>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="table-head">
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
                  <tr key={row.key} className="table-row">
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
                          "badge",
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
                        <Button
                          variant="ghost"
                          className="px-2.5 py-1 text-xs"
                          onClick={() => onEdit(row.key, row.title, row.subtitle)}
                        >
                          Acquisto
                        </Button>
                        {!isSold(row.entry) && total != null && (
                          <Button
                            variant="success"
                            onClick={() => onSold(row.key, row.title, row.subtitle)}
                          >
                            Vendi
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </TableShell>
    </section>
  );
}
