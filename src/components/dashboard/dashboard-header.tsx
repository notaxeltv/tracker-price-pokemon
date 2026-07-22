"use client";

import { useEffect, useRef, useState } from "react";
import { SnapshotStatusBadge } from "./snapshot-status-badge";
import type { DashboardData } from "@/lib/types";
import { MoreHorizontal, Plus, RefreshCw, Settings2 } from "lucide-react";

interface DashboardHeaderProps {
  data: DashboardData;
  scraping: boolean;
  loading: boolean;
  scrapeMessage: string | null;
  onRefresh: () => void;
  onAddProduct: () => void;
  onManageCatalog: () => void;
}

export function DashboardHeader({
  data,
  scraping,
  loading,
  scrapeMessage,
  onRefresh,
  onAddProduct,
  onManageCatalog,
}: DashboardHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  return (
    <header className="mb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
            Pokémon Price Tracker
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Cardmarket EU · eBay EU · portfolio personale
          </p>
          <div className="mt-3">
            <SnapshotStatusBadge data={data} scraping={scraping} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading || scraping}
            className="inline-flex items-center gap-2 rounded-xl bg-pokemon-yellow px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading || scraping ? "animate-spin" : ""}`}
            />
            {scraping ? "Aggiornamento…" : "Aggiorna prezzi"}
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700"
              aria-label="Altre azioni"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 py-1 shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    onAddProduct();
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-zinc-200 hover:bg-zinc-800"
                >
                  <Plus className="h-4 w-4" />
                  Aggiungi prodotto
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onManageCatalog();
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-zinc-200 hover:bg-zinc-800"
                >
                  <Settings2 className="h-4 w-4" />
                  Gestisci catalogo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {scrapeMessage && (
        <p className="mt-3 text-xs text-pokemon-yellow">{scrapeMessage}</p>
      )}
    </header>
  );
}
