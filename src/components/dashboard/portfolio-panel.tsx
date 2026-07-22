"use client";

import { useEffect, useState } from "react";
import { X, Tag } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import {
  emptyPortfolioEntry,
  getDisplayGainLoss,
  getQuantity,
  getTotalCost,
  getPriceAlertStatus,
  isSold,
} from "@/lib/portfolio";
import { formatDate } from "@/lib/utils";
import type { PortfolioEntry } from "@/lib/types";

interface PortfolioEditPanelProps {
  open: boolean;
  title: string;
  subtitle?: string;
  entryKey: string;
  initialEntry?: PortfolioEntry;
  onClose: () => void;
  onSave: (key: string, entry: PortfolioEntry | null) => Promise<void>;
}

export function PortfolioEditPanel({
  open,
  title,
  subtitle,
  entryKey,
  initialEntry,
  onClose,
  onSave,
}: PortfolioEditPanelProps) {
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [alertAbove, setAlertAbove] = useState("");
  const [alertBelow, setAlertBelow] = useState("");
  const [hasPlexiglassCase, setHasPlexiglassCase] = useState(false);
  const [plexiglassCost, setPlexiglassCost] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const entry = initialEntry ?? emptyPortfolioEntry();
    setPurchasePrice(
      entry.purchasePrice != null && entry.purchasePrice > 0
        ? String(entry.purchasePrice)
        : ""
    );
    setPurchaseDate(entry.purchaseDate ?? "");
    setNotes(entry.notes ?? "");
    setQuantity(String(entry.quantity ?? 1));
    setAlertAbove(
      entry.alertAbove != null && entry.alertAbove > 0
        ? String(entry.alertAbove)
        : ""
    );
    setAlertBelow(
      entry.alertBelow != null && entry.alertBelow > 0
        ? String(entry.alertBelow)
        : ""
    );
    setHasPlexiglassCase(Boolean(entry.hasPlexiglassCase));
    setPlexiglassCost(
      entry.plexiglassCost != null && entry.plexiglassCost > 0
        ? String(entry.plexiglassCost)
        : ""
    );
    setError(null);
  }, [open, initialEntry, entryKey]);

  if (!open) return null;

  const parseAmount = (value: string): number | undefined => {
    const trimmed = value.trim().replace(",", ".");
    if (!trimmed) return undefined;
    const num = Number(trimmed);
    return Number.isFinite(num) && num > 0 ? num : undefined;
  };

  const parseQty = (value: string): number | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return 1;
    const num = Number(trimmed);
    return Number.isFinite(num) && num >= 1 ? Math.floor(num) : undefined;
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const purchase = parseAmount(purchasePrice);
      const teca = parseAmount(plexiglassCost);
      const qty = parseQty(quantity) ?? 1;
      const alertHigh = parseAmount(alertAbove);
      const alertLow = parseAmount(alertBelow);

      if (!purchase && !hasPlexiglassCase && !initialEntry?.soldPrice) {
        await onSave(entryKey, null);
        onClose();
        return;
      }

      if (!purchase && hasPlexiglassCase) {
        setError("Inserisci il prezzo di acquisto oppure disattiva la teca.");
        return;
      }

      await onSave(entryKey, {
        purchasePrice: purchase,
        purchaseDate: purchaseDate.trim() || undefined,
        notes: notes.trim() || undefined,
        quantity: qty > 1 ? qty : undefined,
        hasPlexiglassCase,
        plexiglassCost: hasPlexiglassCase ? teca : undefined,
        soldPrice: initialEntry?.soldPrice,
        soldDate: initialEntry?.soldDate,
        alertAbove: alertHigh,
        alertBelow: alertLow,
      });
      onClose();
    } catch {
      setError("Salvataggio non riuscito. Riprova.");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(entryKey, null);
      onClose();
    } catch {
      setError("Impossibile rimuovere i dati.");
    } finally {
      setSaving(false);
    }
  };

  const previewPurchase = parseAmount(purchasePrice);
  const previewTeca = parseAmount(plexiglassCost);
  const previewQty = parseQty(quantity) ?? 1;
  const previewUnit =
    previewPurchase != null
      ? previewPurchase +
        (hasPlexiglassCase && previewTeca != null ? previewTeca : 0)
      : null;
  const previewTotal =
    previewUnit != null ? previewUnit * previewQty : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-zinc-100">{title}</h3>
            {subtitle && (
              <p className="mt-0.5 text-sm text-zinc-500">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
            aria-label="Chiudi"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-300">
              Prezzo di acquisto (€)
            </span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="es. 740,00"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-2.5 text-sm text-zinc-100 outline-none ring-pokemon-yellow/40 placeholder:text-zinc-600 focus:border-pokemon-yellow/50 focus:ring-2"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-300">
              Data acquisto
            </span>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-pokemon-yellow/50 focus:ring-2"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-300">
              Quantità
            </span>
            <input
              type="number"
              min={1}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-pokemon-yellow/50 focus:ring-2"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-300">
              Note
            </span>
            <textarea
              rows={2}
              placeholder="Es. acquistato da collezionista, con certificato…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-pokemon-yellow/50 focus:ring-2"
            />
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-800/40 p-3">
            <input
              type="checkbox"
              checked={hasPlexiglassCase}
              onChange={(e) => setHasPlexiglassCase(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-pokemon-yellow focus:ring-pokemon-yellow/40"
            />
            <span>
              <span className="block text-sm font-medium text-zinc-200">
                Teca in plexiglass
              </span>
              <span className="mt-0.5 block text-xs text-zinc-500">
                Mostra un&apos;etichetta sulla riga prodotto
              </span>
            </span>
          </label>

          {hasPlexiglassCase && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-300">
                Costo teca (€) — opzionale
              </span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Lascia vuoto se già incluso nel prezzo"
                value={plexiglassCost}
                onChange={(e) => setPlexiglassCost(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-2.5 text-sm text-zinc-100 outline-none ring-pokemon-yellow/40 placeholder:text-zinc-600 focus:border-pokemon-yellow/50 focus:ring-2"
              />
            </label>
          )}

          <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">
              Alert prezzo (unitario €)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="mb-1 block text-zinc-500">Sopra</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Target vendita"
                  value={alertAbove}
                  onChange={(e) => setAlertAbove(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-2 text-sm text-zinc-100"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-zinc-500">Sotto</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Stop loss"
                  value={alertBelow}
                  onChange={(e) => setAlertBelow(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-2 text-sm text-zinc-100"
                />
              </label>
            </div>
          </div>

          {previewTotal != null && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 px-3 py-2.5 text-sm">
              <span className="text-zinc-500">Totale investito: </span>
              <span className="font-semibold text-zinc-100">
                {formatPrice(previewTotal)}
              </span>
              {previewQty > 1 && previewUnit != null && (
                <span className="mt-1 block text-xs text-zinc-500">
                  {previewQty}× {formatPrice(previewUnit)} cad.
                </span>
              )}
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-xl bg-pokemon-yellow px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Salvataggio…" : "Salva"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={saving}
            className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 disabled:opacity-50"
          >
            Rimuovi
          </button>
        </div>
      </div>
    </div>
  );
}

interface SoldEditPanelProps {
  open: boolean;
  title: string;
  subtitle?: string;
  entryKey: string;
  initialEntry?: PortfolioEntry;
  onClose: () => void;
  onSave: (key: string, entry: PortfolioEntry | null) => Promise<void>;
}

export function SoldEditPanel({
  open,
  title,
  subtitle,
  entryKey,
  initialEntry,
  onClose,
  onSave,
}: SoldEditPanelProps) {
  const [soldPrice, setSoldPrice] = useState("");
  const [soldDate, setSoldDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const entry = initialEntry ?? emptyPortfolioEntry();
    setSoldPrice(
      entry.soldPrice != null && entry.soldPrice > 0
        ? String(entry.soldPrice)
        : ""
    );
    setSoldDate(entry.soldDate ?? new Date().toISOString().split("T")[0]);
    setError(null);
  }, [open, initialEntry, entryKey]);

  if (!open) return null;

  const parseAmount = (value: string): number | undefined => {
    const trimmed = value.trim().replace(",", ".");
    if (!trimmed) return undefined;
    const num = Number(trimmed);
    return Number.isFinite(num) && num > 0 ? num : undefined;
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const price = parseAmount(soldPrice);
      if (!price) {
        setError("Inserisci il prezzo di vendita.");
        return;
      }

      const base = initialEntry ?? emptyPortfolioEntry();
      if (!base.purchasePrice || base.purchasePrice <= 0) {
        setError("Prima registra il prezzo di acquisto.");
        return;
      }

      await onSave(entryKey, {
        ...base,
        soldPrice: price,
        soldDate: soldDate.trim() || undefined,
      });
      onClose();
    } catch {
      setError("Salvataggio non riuscito.");
    } finally {
      setSaving(false);
    }
  };

  const handleUnsell = async () => {
    if (!initialEntry) return;
    setSaving(true);
    try {
      await onSave(entryKey, {
        ...initialEntry,
        soldPrice: undefined,
        soldDate: undefined,
      });
      onClose();
    } catch {
      setError("Impossibile annullare la vendita.");
    } finally {
      setSaving(false);
    }
  };

  const cost = initialEntry ? getTotalCost(initialEntry) : null;
  const previewPrice = parseAmount(soldPrice);
  const previewPl =
    cost != null && previewPrice != null ? previewPrice - cost : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 font-semibold text-zinc-100">
              <Tag className="h-4 w-4 text-emerald-400" />
              Registra vendita
            </h3>
            <p className="mt-0.5 text-sm text-zinc-400">{title}</p>
            {subtitle && (
              <p className="text-xs text-zinc-500">{subtitle}</p>
            )}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        {cost != null && (
          <p className="mb-4 text-sm text-zinc-500">
            Costo totale acquisto:{" "}
            <span className="font-medium text-zinc-300">{formatPrice(cost)}</span>
          </p>
        )}

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-300">
              Prezzo di vendita (€)
            </span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="es. 850,00"
              value={soldPrice}
              onChange={(e) => setSoldPrice(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-emerald-500/50 focus:ring-2"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-300">
              Data vendita
            </span>
            <input
              type="date"
              value={soldDate}
              onChange={(e) => setSoldDate(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-emerald-500/50 focus:ring-2"
            />
          </label>

          {previewPl != null && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 px-3 py-2.5 text-sm">
              <span className="text-zinc-500">P/L realizzato: </span>
              <span
                className={cn(
                  "font-semibold",
                  previewPl >= 0 ? "text-emerald-400" : "text-red-400"
                )}
              >
                {previewPl >= 0 ? "+" : ""}
                {formatPrice(previewPl)}
              </span>
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {saving ? "Salvataggio…" : "Conferma vendita"}
          </button>
          {isSold(initialEntry ?? emptyPortfolioEntry()) && (
            <button
              type="button"
              onClick={handleUnsell}
              disabled={saving}
              className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm text-zinc-400 hover:bg-zinc-800 disabled:opacity-50"
            >
              Annulla vendita
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface PlexiglassBadgeProps {
  entry?: PortfolioEntry;
  className?: string;
}

export function PlexiglassBadge({ entry, className }: PlexiglassBadgeProps) {
  if (!entry?.hasPlexiglassCase) return null;

  const label =
    entry.plexiglassCost != null && entry.plexiglassCost > 0
      ? `Teca plexiglass · ${formatPrice(entry.plexiglassCost)}`
      : "Teca plexiglass · inclusa";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-medium text-cyan-300",
        className
      )}
    >
      {label}
    </span>
  );
}

interface SoldBadgeProps {
  entry?: PortfolioEntry;
  className?: string;
}

export function SoldBadge({ entry, className }: SoldBadgeProps) {
  if (!entry || !isSold(entry)) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300",
        className
      )}
    >
      Venduto · {formatPrice(entry.soldPrice!)}
    </span>
  );
}

interface PriceAlertBadgeProps {
  entry?: PortfolioEntry;
  marketPrice?: number;
  className?: string;
}

export function PriceAlertBadge({
  entry,
  marketPrice,
  className,
}: PriceAlertBadgeProps) {
  if (!entry) return null;
  const status = getPriceAlertStatus(entry, marketPrice);
  if (!status) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium",
        status === "above"
          ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
          : "border-red-500/30 bg-red-500/10 text-red-300",
        className
      )}
    >
      {status === "above" ? "▲ Target raggiunto" : "▼ Sotto soglia"}
    </span>
  );
}

interface PortfolioMetaBadgesProps {
  entry?: PortfolioEntry;
  marketPrice?: number;
  className?: string;
}

export function PortfolioMetaBadges({
  entry,
  marketPrice,
  className,
}: PortfolioMetaBadgesProps) {
  if (!entry) return null;

  const qty = getQuantity(entry);
  const hasMeta =
    entry.purchaseDate ||
    entry.notes ||
    qty > 1 ||
    getPriceAlertStatus(entry, marketPrice);

  if (!hasMeta) return null;

  return (
    <div className={cn("mt-1 space-y-0.5", className)}>
      {(entry.purchaseDate || qty > 1) && (
        <p className="text-[11px] text-zinc-500">
          {entry.purchaseDate && (
            <span>Acq. {formatDate(entry.purchaseDate)}</span>
          )}
          {entry.purchaseDate && qty > 1 && " · "}
          {qty > 1 && <span>{qty} copie</span>}
        </p>
      )}
      {entry.notes && (
        <p className="line-clamp-2 text-[11px] italic text-zinc-500">{entry.notes}</p>
      )}
      <PriceAlertBadge entry={entry} marketPrice={marketPrice} />
    </div>
  );
}

interface PortfolioCostCellProps {
  entry?: PortfolioEntry;
  marketPrice?: number;
  onEdit: () => void;
  onSold?: () => void;
}

export function PortfolioCostCell({
  entry,
  marketPrice,
  onEdit,
  onSold,
}: PortfolioCostCellProps) {
  const total = entry ? getTotalCost(entry) : null;
  const qty = entry ? getQuantity(entry) : 1;
  const pl = getDisplayGainLoss(entry, marketPrice);
  const sold = entry && isSold(entry);

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="text-right transition-colors hover:text-pokemon-yellow"
        >
          {total != null ? (
            <span className="font-medium text-zinc-200">
              {formatPrice(total)}
              {qty > 1 && (
                <span className="ml-1 text-xs font-normal text-zinc-500">
                  ({qty}×)
                </span>
              )}
            </span>
          ) : (
            <span className="text-xs text-zinc-500 underline decoration-dotted underline-offset-2">
              Acquisto
            </span>
          )}
        </button>
        {onSold && total != null && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSold();
            }}
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-colors",
              sold
                ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
            )}
            title={sold ? "Modifica vendita" : "Registra vendita"}
          >
            {sold ? "Venduto" : "Vendi"}
          </button>
        )}
      </div>
      {pl != null && (
        <span
          className={cn(
            "text-xs font-medium",
            pl.amount >= 0 ? "text-emerald-400" : "text-red-400"
          )}
        >
          {pl.kind === "realized" ? "Realizzato " : ""}
          {pl.amount >= 0 ? "+" : ""}
          {formatPrice(pl.amount)}
        </span>
      )}
    </div>
  );
}
