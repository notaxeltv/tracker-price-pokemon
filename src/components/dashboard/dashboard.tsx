"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HeaderBadge, StatsCards } from "./stats-cards";
import { CategoryTabs } from "./category-tabs";
import { SearchFilters } from "./search-filters";
import { PriceChart } from "./price-chart";
import { SealedTable, GradedTable } from "./product-table";
import {
  filterGradedCards,
  filterSealedProducts,
} from "@/lib/data-service";
import type {
  DashboardData,
  ProductCategory,
  ProductFilters,
  TimeRange,
} from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";
import { RefreshCw, Clock } from "lucide-react";

const defaultFilters: ProductFilters = {
  category: "all",
  search: "",
  market: "all",
  sortField: "change7d",
  sortDirection: "desc",
};

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>(defaultFilters);
  const [selectedSealedId, setSelectedSealedId] = useState<string | null>(null);
  const [selectedGradedId, setSelectedGradedId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Errore nel caricamento");
      const json: DashboardData = await res.json();
      setData(json);
      if (!selectedSealedId && json.sealed.length > 0) {
        setSelectedSealedId(json.sealed[0].id);
      }
      if (!selectedGradedId && json.graded.length > 0) {
        setSelectedGradedId(json.graded[0].id);
      }
    } catch {
      setError("Impossibile caricare i dati. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  }, [selectedSealedId, selectedGradedId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateFilters = (partial: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const filteredSealed = useMemo(
    () => (data ? filterSealedProducts(data.sealed, filters) : []),
    [data, filters]
  );

  const filteredGraded = useMemo(
    () => (data ? filterGradedCards(data.graded, filters) : []),
    [data, filters]
  );

  const selectedSealed = data?.sealed.find((p) => p.id === selectedSealedId);
  const selectedGraded = data?.graded.find((c) => c.id === selectedGradedId);
  const topGradedGrade = selectedGraded
    ? [...selectedGraded.grades].sort((a, b) => b.price - a.price)[0]
    : null;

  const activeCategory = filters.category;
  const showSealed = activeCategory === "all" || activeCategory === "sealed";
  const showGraded = activeCategory === "all" || activeCategory === "graded";

  if (loading && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <RefreshCw className="h-8 w-8 animate-spin text-pokemon-yellow" />
          <p>Caricamento dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">{error ?? "Errore sconosciuto"}</p>
          <button
            onClick={loadData}
            className="mt-4 rounded-xl bg-pokemon-yellow px-4 py-2 text-sm font-medium text-zinc-900"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <HeaderBadge />
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
              Dashboard Prezzi Pokémon
            </h1>
            <p className="mt-2 max-w-2xl text-zinc-400">
              Monitora i prezzi di prodotti sealed e carte gradate (PSA, BGS, CGC)
              sui mercati EU e US.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Clock className="h-3.5 w-3.5" />
              Aggiornato: {formatDate(data.lastUpdated.split("T")[0])}
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Aggiorna
            </button>
          </div>
        </div>
      </header>

      <section className="mb-8">
        <StatsCards stats={data.stats} />
      </section>

      <section className="mb-6 space-y-4">
        <CategoryTabs
          active={filters.category}
          onChange={(category) =>
            updateFilters({ category: category as ProductCategory | "all" })
          }
          sealedCount={data.sealed.length}
          gradedCount={data.graded.length}
        />
        <SearchFilters
          filters={filters}
          onChange={updateFilters}
          showGradingFilter={showGraded}
        />
      </section>

      {(showSealed || showGraded) && (
        <section className="mb-8 grid gap-6 lg:grid-cols-2">
          {showSealed && selectedSealed && (
            <PriceChart
              data={selectedSealed.history}
              currency={selectedSealed.currency}
              title={`${selectedSealed.name} — ${formatPrice(selectedSealed.price, selectedSealed.currency)}`}
              color="#3b4cca"
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
          )}
          {showGraded && selectedGraded && topGradedGrade && (
            <PriceChart
              data={topGradedGrade.history}
              currency={selectedGraded.market === "EU" ? "EUR" : "USD"}
              title={`${selectedGraded.name} ${topGradedGrade.company} ${topGradedGrade.grade} — ${formatPrice(topGradedGrade.price, selectedGraded.market === "EU" ? "EUR" : "USD")}`}
              color="#ffcb05"
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
          )}
        </section>
      )}

      {showSealed && (
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-200">
            <span className="h-2 w-2 rounded-full bg-pokemon-blue" />
            Prodotti Sealed
          </h2>
          <SealedTable
            products={filteredSealed}
            selectedId={selectedSealedId}
            onSelect={setSelectedSealedId}
          />
        </section>
      )}

      {showGraded && (
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-200">
            <span className="h-2 w-2 rounded-full bg-pokemon-yellow" />
            Carte Gradate
          </h2>
          <GradedTable
            cards={filteredGraded}
            selectedId={selectedGradedId}
            onSelect={setSelectedGradedId}
          />
        </section>
      )}

      <footer className="border-t border-zinc-800/80 pt-6 text-center text-xs text-zinc-600">
        Dati demo · Integrabile con PkmnPrices, PokeTrace o TCG Price Lookup via API key
      </footer>
    </div>
  );
}
