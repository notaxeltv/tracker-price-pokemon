"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HeaderBadge, MarketSourcesBanner, StatsCards } from "./stats-cards";
import { CategoryTabs } from "./category-tabs";
import { SearchFilters } from "./search-filters";
import { DualMarketChart, PriceChart } from "./price-chart";
import { SealedTable, GradedTable, RawTable, AccessoryTable } from "./product-table";
import { PortfolioEditPanel } from "./portfolio-panel";
import {
  filterAccessoryProducts,
  filterGradedCards,
  filterRawCards,
  filterSealedProducts,
} from "@/lib/filters";
import { getGradedMarket, getSealedMarket } from "@/lib/market-utils";
import { computePortfolioSummary } from "@/lib/portfolio-summary";
import type {
  DashboardData,
  MarketRegion,
  PortfolioData,
  PortfolioEntry,
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
  sealedLanguage: "all",
  sortField: "change7d",
  sortDirection: "desc",
};

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioData>({
    entries: {},
    updatedAt: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>(defaultFilters);
  const [selectedSealedId, setSelectedSealedId] = useState<string | null>(null);
  const [selectedGradedId, setSelectedGradedId] = useState<string | null>(null);
  const [selectedRawId, setSelectedRawId] = useState<string | null>(null);
  const [selectedGradeKey, setSelectedGradeKey] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [portfolioEdit, setPortfolioEdit] = useState<{
    key: string;
    title: string;
    subtitle?: string;
  } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardRes, portfolioRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/portfolio"),
      ]);
      if (!dashboardRes.ok) throw new Error("Errore nel caricamento");
      const json: DashboardData = await dashboardRes.json();
      setData(json);

      if (portfolioRes.ok) {
        const portfolioJson: PortfolioData = await portfolioRes.json();
        setPortfolio(portfolioJson);
      }

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
      if (!selectedRawId && json.raw?.length > 0) {
        setSelectedRawId(json.raw[0].id);
      }
    } catch {
      setError("Impossibile caricare i dati. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  }, [selectedSealedId, selectedGradedId, selectedRawId]);

  const savePortfolioEntry = useCallback(
    async (key: string, entry: PortfolioEntry | null) => {
      const res = await fetch("/api/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, entry }),
      });
      if (!res.ok) throw new Error("Salvataggio fallito");
      const updated: PortfolioData = await res.json();
      setPortfolio(updated);
    },
    []
  );

  const openPortfolioEdit = useCallback(
    (key: string, title: string, subtitle?: string) => {
      setPortfolioEdit({ key, title, subtitle });
    },
    []
  );

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

  const filteredRaw = useMemo(
    () => (data ? filterRawCards(data.raw ?? [], filters) : []),
    [data, filters]
  );

  const filteredAccessory = useMemo(
    () => (data ? filterAccessoryProducts(data.accessory ?? [], filters) : []),
    [data, filters]
  );

  const filteredGraded = useMemo(
    () => (data ? filterGradedCards(data.graded, filters) : []),
    [data, filters]
  );

  const portfolioSummary = useMemo(
    () => (data ? computePortfolioSummary(data, portfolio) : null),
    [data, portfolio]
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
  const showRaw = activeCategory === "all" || activeCategory === "raw";
  const showAccessory = activeCategory === "all" || activeCategory === "accessory";

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
              Monitora carte <strong className="font-medium text-zinc-300">PSA/BGS/CGC</strong>, prodotti{" "}
              <strong className="font-medium text-zinc-300">sealed ITA/ENG/JP</strong>,{" "}
              <strong className="font-medium text-zinc-300">raw</strong> e accessori — scraping senza abbonamenti.
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
        <StatsCards stats={data.stats} portfolioSummary={portfolioSummary} />
      </section>

      <section className="mb-6 space-y-4">
        <CategoryTabs
          active={filters.category}
          onChange={(category) =>
            updateFilters({ category: category as ProductCategory | "all" })
          }
          sealedCount={data.sealed.length}
          gradedCount={data.graded.length}
          rawCount={data.raw?.length ?? 0}
          accessoryCount={data.accessory?.length ?? 0}
        />
        <SearchFilters
          filters={filters}
          onChange={updateFilters}
          showSealedLang={showSealed}
          showGradedFilters={showGraded}
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
            Sealed ITA & ENG
          </h2>
          <SealedTable
            products={filteredSealed}
            selectedId={selectedSealedId}
            onSelect={setSelectedSealedId}
            portfolio={portfolio.entries}
            onEditPortfolio={openPortfolioEdit}
          />
        </section>
      )}

      {showGraded && (
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-200">
            <span className="h-2 w-2 rounded-full bg-pokemon-yellow" />
            Carte gradate (PSA · BGS · CGC)
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
            portfolio={portfolio.entries}
            onEditPortfolio={openPortfolioEdit}
          />
        </section>
      )}

      {showRaw && (
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-200">
            <span className="h-2 w-2 rounded-full bg-violet-400" />
            Carte raw
          </h2>
          <RawTable
            cards={filteredRaw}
            selectedId={selectedRawId}
            onSelect={setSelectedRawId}
            portfolio={portfolio.entries}
            onEditPortfolio={openPortfolioEdit}
          />
        </section>
      )}

      {showAccessory && (
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-200">
            <span className="h-2 w-2 rounded-full bg-zinc-400" />
            Accessori
          </h2>
          <AccessoryTable
            products={filteredAccessory}
            portfolio={portfolio.entries}
            onEditPortfolio={openPortfolioEdit}
          />
        </section>
      )}

      <footer className="border-t border-zinc-800/80 pt-6 text-center text-xs text-zinc-600">
        Scraping Cardmarket · eBay · TCGPlayer — snapshot JSON · portfolio in data/portfolio.json ·{" "}
        {data.dataSource === "snapshot" && "dati da cron locale · "}
        {data.stats.blockedCount > 0 &&
          `${data.stats.blockedCount} sorgenti bloccate — npm run scrape in locale · `}
        Catalogo in src/lib/catalog/products.ts
      </footer>

      <PortfolioEditPanel
        open={portfolioEdit != null}
        title={portfolioEdit?.title ?? ""}
        subtitle={portfolioEdit?.subtitle}
        entryKey={portfolioEdit?.key ?? ""}
        initialEntry={
          portfolioEdit ? portfolio.entries[portfolioEdit.key] : undefined
        }
        onClose={() => setPortfolioEdit(null)}
        onSave={savePortfolioEntry}
      />
    </div>
  );
}
