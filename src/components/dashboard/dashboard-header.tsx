"use client";

import { useEffect, useRef, useState } from "react";
import { SnapshotStatusBadge } from "./snapshot-status-badge";
import type { DashboardData } from "@/lib/types";
import { MoreHorizontal, Plus, RefreshCw, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
          <h1 className="heading-page">Pokémon Price Tracker</h1>
          <p className="text-subtle mt-1">
            Cardmarket EU · eBay EU · portfolio personale
          </p>
          <div className="mt-3">
            <SnapshotStatusBadge data={data} scraping={scraping} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            onClick={onRefresh}
            disabled={loading || scraping}
          >
            <RefreshCw
              className={`h-4 w-4 ${loading || scraping ? "animate-spin" : ""}`}
            />
            {scraping ? "Aggiornamento…" : "Aggiorna prezzi"}
          </Button>

          <div className="relative" ref={menuRef}>
            <Button
              variant="icon"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Altre azioni"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
            {menuOpen && (
              <div className="dropdown-menu">
                <button
                  type="button"
                  onClick={() => {
                    onAddProduct();
                    setMenuOpen(false);
                  }}
                  className="dropdown-item"
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
                  className="dropdown-item"
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
        <p className="mt-3 text-xs text-brand-light">{scrapeMessage}</p>
      )}
    </header>
  );
}
