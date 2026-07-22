import { formatDate, formatPrice } from "./utils";
import { buildPortfolioRows } from "./portfolio-resolve";
import {
  getDisplayGainLoss,
  getPriceAlertStatus,
  getQuantity,
  getTotalCost,
  isSold,
} from "./portfolio";
import type { DashboardData, PortfolioData } from "./types";

export interface ExportRow {
  key: string;
  prodotto: string;
  set: string;
  categoria: string;
  quantita: number;
  prezzoAcquistoUnitario: number | "";
  costoTotale: number | "";
  dataAcquisto: string;
  note: string;
  prezzoMercatoUnitario: number | "";
  valoreMercato: number | "";
  pl: number | "";
  plPercent: string;
  stato: string;
  prezzoVendita: number | "";
  dataVendita: string;
  alertSopra: number | "";
  alertSotto: number | "";
  alertAttivo: string;
}

function buildExportRows(
  data: DashboardData,
  portfolio: PortfolioData
): ExportRow[] {
  return buildPortfolioRows(data, portfolio.entries).map((row) => {
    const qty = getQuantity(row.entry);
    const totalCost = getTotalCost(row.entry);
    const pl = getDisplayGainLoss(row.entry, row.marketPrice);
    const alert = getPriceAlertStatus(row.entry, row.marketPrice);

    return {
      key: row.key,
      prodotto: row.title,
      set: row.subtitle ?? "",
      categoria: row.category,
      quantita: qty,
      prezzoAcquistoUnitario: row.entry.purchasePrice ?? "",
      costoTotale: totalCost ?? "",
      dataAcquisto: row.entry.purchaseDate ?? "",
      note: row.entry.notes ?? "",
      prezzoMercatoUnitario: row.marketPrice ?? "",
      valoreMercato:
        row.marketPrice != null && !isSold(row.entry)
          ? row.marketPrice * qty
          : "",
      pl: pl?.amount ?? "",
      plPercent: pl ? `${pl.percent.toFixed(1)}%` : "",
      stato: isSold(row.entry) ? "Venduto" : "In portfolio",
      prezzoVendita: row.entry.soldPrice ?? "",
      dataVendita: row.entry.soldDate ?? "",
      alertSopra: row.entry.alertAbove ?? "",
      alertSotto: row.entry.alertBelow ?? "",
      alertAttivo:
        alert === "above"
          ? "Sopra soglia"
          : alert === "below"
            ? "Sotto soglia"
            : "",
    };
  });
}

function escapeCsv(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function portfolioToCsv(
  data: DashboardData,
  portfolio: PortfolioData
): string {
  const rows = buildExportRows(data, portfolio);
  const headers: (keyof ExportRow)[] = [
    "key",
    "prodotto",
    "set",
    "categoria",
    "quantita",
    "prezzoAcquistoUnitario",
    "costoTotale",
    "dataAcquisto",
    "note",
    "prezzoMercatoUnitario",
    "valoreMercato",
    "pl",
    "plPercent",
    "stato",
    "prezzoVendita",
    "dataVendita",
    "alertSopra",
    "alertSotto",
    "alertAttivo",
  ];

  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((h) => escapeCsv(row[h] ?? "")).join(",")
    ),
  ];
  return lines.join("\n");
}

export function portfolioToJson(
  data: DashboardData,
  portfolio: PortfolioData
): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      summary: {
        entries: buildExportRows(data, portfolio).length,
      },
      rows: buildExportRows(data, portfolio),
      raw: portfolio,
    },
    null,
    2
  );
}

export function downloadPortfolioExport(
  data: DashboardData,
  portfolio: PortfolioData,
  format: "csv" | "json"
): void {
  const content =
    format === "csv"
      ? portfolioToCsv(data, portfolio)
      : portfolioToJson(data, portfolio);
  const mime =
    format === "csv" ? "text/csv;charset=utf-8" : "application/json";
  const ext = format;
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `portfolio-pokemon-${new Date().toISOString().split("T")[0]}.${ext}`;
  link.click();
  URL.revokeObjectURL(url);
}

export function formatPortfolioSummaryLine(
  data: DashboardData,
  portfolio: PortfolioData
): string {
  const rows = buildExportRows(data, portfolio);
  const invested = rows.reduce(
    (sum, r) => sum + (typeof r.costoTotale === "number" ? r.costoTotale : 0),
    0
  );
  return `${rows.length} voci · investito ${formatPrice(invested)} · export ${formatDate(new Date().toISOString().split("T")[0])}`;
}
