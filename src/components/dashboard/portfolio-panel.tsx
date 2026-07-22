"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { emptyPortfolioEntry } from "@/lib/portfolio";
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

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const purchase = parseAmount(purchasePrice);
      const teca = parseAmount(plexiglassCost);

      if (!purchase && !hasPlexiglassCase) {
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
        hasPlexiglassCase,
        plexiglassCost: hasPlexiglassCase ? teca : undefined,
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
  const previewTotal =
    previewPurchase != null
      ? previewPurchase +
        (hasPlexiglassCase && previewTeca != null ? previewTeca : 0)
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden
      />
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
              <p className="mt-1.5 text-xs text-zinc-500">
                Se non specifichi il costo, il totale investito usa solo il
                prezzo di acquisto (teca già compresa).
              </p>
            </label>
          )}

          {previewTotal != null && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 px-3 py-2.5 text-sm">
              <span className="text-zinc-500">Totale investito: </span>
              <span className="font-semibold text-zinc-100">
                {formatPrice(previewTotal)}
              </span>
              {hasPlexiglassCase && previewTeca == null && (
                <span className="mt-1 block text-xs text-zinc-500">
                  Teca inclusa nel prezzo di acquisto
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

interface PortfolioCostCellProps {
  entry?: PortfolioEntry;
  marketPrice?: number;
  onEdit: () => void;
}

export function PortfolioCostCell({
  entry,
  marketPrice,
  onEdit,
}: PortfolioCostCellProps) {
  const total =
    entry?.purchasePrice != null && entry.purchasePrice > 0
      ? entry.purchasePrice +
        (entry.hasPlexiglassCase &&
        entry.plexiglassCost != null &&
        entry.plexiglassCost > 0
          ? entry.plexiglassCost
          : 0)
      : null;

  const gainLoss =
    total != null && marketPrice != null && marketPrice > 0
      ? marketPrice - total
      : null;

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="text-right transition-colors hover:text-pokemon-yellow"
      >
        {total != null ? (
          <span className="font-medium text-zinc-200">{formatPrice(total)}</span>
        ) : (
          <span className="text-xs text-zinc-500 underline decoration-dotted underline-offset-2">
            Inserisci
          </span>
        )}
      </button>
      {gainLoss != null && (
        <span
          className={cn(
            "text-xs font-medium",
            gainLoss >= 0 ? "text-emerald-400" : "text-red-400"
          )}
        >
          {gainLoss >= 0 ? "+" : ""}
          {formatPrice(gainLoss)}
        </span>
      )}
    </div>
  );
}
