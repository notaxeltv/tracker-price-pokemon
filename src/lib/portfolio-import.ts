import type { PortfolioEntry } from "./types";

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

function parseNum(value: string): number | undefined {
  const trimmed = value.trim().replace(",", ".");
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
}

function rowToEntry(row: Record<string, string>): PortfolioEntry | null {
  const purchase = parseNum(row.prezzoAcquistoUnitario ?? row.prezzoacquistounitario ?? "");
  const sold = parseNum(row.prezzoVendita ?? row.prezzovendita ?? "");
  const alertAbove = parseNum(row.alertSopra ?? row.alertsopra ?? "");
  const alertBelow = parseNum(row.alertSotto ?? row.alertsotto ?? "");
  const qty = parseNum(row.quantita ?? row.qty ?? "");
  const plexiglass = parseNum(row.costoTeca ?? row.teca ?? "");

  const entry: PortfolioEntry = {
    purchasePrice: purchase,
    purchaseDate: row.dataAcquisto?.trim() || row.dataacquisto?.trim() || undefined,
    notes: row.note?.trim() || undefined,
    quantity: qty != null && qty >= 1 ? Math.floor(qty) : undefined,
    soldPrice: sold,
    soldDate: row.dataVendita?.trim() || row.datavendita?.trim() || undefined,
    alertAbove,
    alertBelow,
    hasPlexiglassCase: Boolean(plexiglass),
  };

  if (plexiglass != null && plexiglass > 0) {
    entry.plexiglassCost = plexiglass;
  }

  const hasContent =
    (entry.purchasePrice != null && entry.purchasePrice > 0) ||
    (entry.soldPrice != null && entry.soldPrice > 0) ||
    Boolean(entry.hasPlexiglassCase);

  return hasContent ? entry : null;
}

export function parsePortfolioCsv(csv: string): {
  entries: Record<string, PortfolioEntry>;
  errors: string[];
} {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) {
    return { entries: {}, errors: ["CSV vuoto o senza righe dati"] };
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const keyIdx = headers.indexOf("key");
  if (keyIdx < 0) {
    return { entries: {}, errors: ["Colonna 'key' obbligatoria"] };
  }

  const entries: Record<string, PortfolioEntry> = {};
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx]?.trim() ?? "";
    });

    const key = cols[keyIdx]?.trim();
    if (!key) {
      errors.push(`Riga ${i + 1}: key mancante`);
      continue;
    }

    const entry = rowToEntry(row);
    if (!entry) {
      errors.push(`Riga ${i + 1} (${key}): nessun dato acquisto/vendita`);
      continue;
    }

    entries[key] = entry;
  }

  return { entries, errors };
}

export const PORTFOLIO_CSV_TEMPLATE = `key,prodotto,set,categoria,quantita,prezzoAcquistoUnitario,costoTotale,dataAcquisto,note,alertSopra,alertSotto
sealed-example-id,Nome prodotto,Set,sealed,1,49.90,,2026-01-15,,100,40`;
