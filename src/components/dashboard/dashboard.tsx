"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HeaderBadge, MarketSourcesBanner, StatsCards } from "./stats-cards";
import { CategoryTabs } from "./category-tabs";
import { SearchFilters } from "./search-filters";
import { DualMarketChart, PriceChart } from "./price-chart";
import { SealedTable, GradedTable } from "./product-table";
import {
  filterGradedCards,
  filterSealedProducts,
} from "@/lib/data-service";
import { getGradedMarket, getSealedMarket } from "@/lib/market-utils";
import type {
  DashboardData,
  MarketRegion,
  ProductCategory,
  ProductFilters,
  TimeRange,
} from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { RefreshCw, Clock } from "lucide-react";

const defaultFilters: ProductFilters = {
  category: "all",
  search: "",
  market: "compare",
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
  const [selectedGradeKey, setSelectedGradeKey] = useState<string | null>(null);
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
        const firstGrade = json.graded[0].grades[0];
        if (firstGrade) {
          setSelectedGradeKey(`${firstGrade.company}-${firstGrade.grade}`);
        }
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
  const selectedGrade = selectedGraded?.grades.find(
    (g) => `${g.company}-${g.grade}` === selectedGradeKey
  ) ?? selectedGraded?.grades[0];

  const showDualCharts =
    filters.market === "all" || filters.market === "compare";

  const chartRegion = (region: MarketRegion) =>
    filters.market === region ||
    filters.market === "all" ||
    filters.market === "compare";

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

  const sealedIt = selectedSealed ? getSealedMarket(selectedSealed, "IT") : undefined;
  const sealedIntl = selectedSealed
    ? getSealedMarket(selectedSealed, "INTL")
    : undefined;
  const gradedIt = selectedGrade
    ? getGradedMarket(selectedGrade, "IT")
    : undefined;
  const gradedIntl = selectedGrade
    ? getGradedMarket(selectedGrade, "INTL")
    : undefined;

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
              Confronta i prezzi tra mercato italiano (Cardmarket, eBay IT) e
              internazionale (TCGPlayer, eBay US) per prodotti sealed e carte gradate.
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

      <section className="mb-6">
        <MarketSourcesBanner />
      </section>

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
          {showSealed && selectedSealed && showDualCharts && (
            <DualMarketChart
              itQuote={sealedIt}
              intlQuote={sealedIntl}
              title={selectedSealed.name}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
          )}
          {showSealed && selectedSealed && !showDualCharts && chartRegion("IT") && sealedIt && (
            <PriceChart
              data={sealedIt.history}
              currency="EUR"
              title={`${selectedSealed.name} · 🇮🇹 ${sealedIt.sourceLabel}`}
              color="#4ade80"
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
          )}
          {showSealed && selectedSealed && !showDualCharts && filters.market === "INTL" && sealedIntl && (
            <PriceChart
              data={sealedIntl.history}
              currency="USD"
              title={`${selectedSealed.name} · 🌍 ${sealedIntl.sourceLabel}`}
              color="#fb923c"
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
          )}
          {showGraded && selectedGraded && selectedGrade && showDualCharts && (
            <DualMarketChart
              itQuote={gradedIt}
              intlQuote={gradedIntl}
              title={`${selectedGraded.name} · ${selectedGrade.company} ${selectedGrade.grade}`}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
          )}
          {showGraded && selectedGraded && selectedGrade && !showDualCharts && filters.market === "IT" && gradedIt && (
            <PriceChart
              data={gradedIt.history}
              currency="EUR"
              title={`${selectedGraded.name} · ${selectedGrade.company} ${selectedGrade.grade} · 🇮🇹`}
              color="#4ade80"
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
          )}
          {showGraded && selectedGraded && selectedGrade && !showDualCharts && filters.market === "INTL" && gradedIntl && (
            <PriceChart
              data={gradedIntl.history}
              currency="USD"
              title={`${selectedGraded.name} · ${selectedGrade.company} ${selectedGrade.grade} · 🌍`}
              color="#fb923c"
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
            marketFilter={filters.market}
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
            onSelect={(id) => {
              setSelectedGradedId(id);
              const card = data.graded.find((c) => c.id === id);
              const grade = card?.grades[0];
              if (grade) {
                setSelectedGradeKey(`${grade.company}-${grade.grade}`);
              }
            }}
            marketFilter={filters.market}
          />
        </section>
      )}

      <footer className="border-t border-zinc-800/80 pt-6 text-center text-xs text-zinc-600">
        Dati demo · IT: Cardmarket / eBay IT · INTL: TCGPlayer / eBay US ·
        Integrabile via API key (PkmnPrices, PokeTrace)
      </footer>
    </div>
  );
}
