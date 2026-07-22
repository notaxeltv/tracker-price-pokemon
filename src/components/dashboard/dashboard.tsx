"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HeaderBadge, MarketSourcesBanner, StatsCards } from "./stats-cards";
import { CategoryTabs } from "./category-tabs";
import { SearchFilters } from "./search-filters";
import { DualMarketChart, PriceChart } from "./price-chart";
import { SealedTable, GradedTable, RawTable, AccessoryTable } from "./product-table";
import { PortfolioEditPanel, SoldEditPanel } from "./portfolio-panel";
import { AddProductPanel } from "./add-product-panel";
import { SnapshotStatusBadge } from "./snapshot-status-badge";
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
import { getTotalCost } from "@/lib/portfolio";
import { RefreshCw, Plus } from "lucide-react";
import type { ChartReferenceLine } from "./price-chart";

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
  const [scraping, setScraping] = useState(false);
  const [scrapeMessage, setScrapeMessage] = useState<string | null>(null);
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
  const [soldEdit, setSoldEdit] = useState<{
    key: string;
    title: string;
    subtitle?: string;
  } | null>(null);
  const [addProductOpen, setAddProductOpen] = useState(false);

  const snapshotMaxAgeMs = 3600 * 1000;

  const isSnapshotStale = (lastUpdated: string) =>
    Date.now() - new Date(lastUpdated).getTime() > snapshotMaxAgeMs;

  const fetchSnapshot = useCallback(async (): Promise<DashboardData | null> => {
    const res = await fetch("/api/dashboard?fast=1");
    if (!res.ok) return null;
    return res.json() as Promise<DashboardData>;
  }, []);

  const runPriceScrape = useCallback(async (force = false) => {
    setScraping(true);
    setScrapeMessage("Aggiornamento prezzi Cardmarket + eBay EU…");
    try {
      const url = force ? "/api/scrape/refresh?force=1" : "/api/scrape/refresh";
      const res = await fetch(url, { method: "POST" });
      if (!res.ok) throw new Error("Scrape fallito");
      const meta = (await res.json()) as {
        skipped?: boolean;
        message?: string;
        liveCount?: number;
        blockedCount?: number;
      };
      if (meta.skipped) {
        setScrapeMessage(meta.message ?? "Dati già aggiornati");
      } else {
        setScrapeMessage(
          meta.blockedCount
            ? `Completato · ${meta.liveCount ?? 0} live · ${meta.blockedCount} bloccati`
            : `Prezzi aggiornati · ${meta.liveCount ?? 0} live`
        );
      }
      return await fetchSnapshot();
    } finally {
      setScraping(false);
      window.setTimeout(() => setScrapeMessage(null), 4000);
    }
  }, [fetchSnapshot]);

  const loadData = useCallback(
    async (options?: { forceRefresh?: boolean }) => {
      setLoading(true);
      setError(null);
      try {
        const [portfolioRes, snap] = await Promise.all([
          fetch("/api/portfolio"),
          fetchSnapshot(),
        ]);

        if (portfolioRes.ok) {
          const portfolioJson: PortfolioData = await portfolioRes.json();
          setPortfolio(portfolioJson);
        }

        const forceRefresh = options?.forceRefresh === true;
        const needsScrape =
          forceRefresh ||
          !snap ||
          isSnapshotStale(snap.lastUpdated) ||
          (snap.stats.liveCount === 0 && snap.stats.blockedCount > 0);

        if (snap && !forceRefresh) {
          setData(snap);
          if (!selectedSealedId && snap.sealed.length > 0) {
            setSelectedSealedId(snap.sealed[0].id);
          }
          if (!selectedGradedId && snap.graded.length > 0) {
            setSelectedGradedId(snap.graded[0].id);
            const firstGrade = snap.graded[0].grades[0];
            if (firstGrade) {
              setSelectedGradeKey(`${firstGrade.company}-${firstGrade.grade}`);
            }
          }
          if (!selectedRawId && snap.raw?.length > 0) {
            setSelectedRawId(snap.raw[0].id);
          }
          setLoading(false);
        }

        if (needsScrape) {
          const fresh = await runPriceScrape(forceRefresh);
          if (fresh) {
            setData(fresh);
            if (!selectedSealedId && fresh.sealed.length > 0) {
              setSelectedSealedId(fresh.sealed[0].id);
            }
            if (!selectedGradedId && fresh.graded.length > 0) {
              setSelectedGradedId(fresh.graded[0].id);
              const firstGrade = fresh.graded[0].grades[0];
              if (firstGrade) {
                setSelectedGradeKey(`${firstGrade.company}-${firstGrade.grade}`);
              }
            }
            if (!selectedRawId && fresh.raw?.length > 0) {
              setSelectedRawId(fresh.raw[0].id);
            }
          }
        }
      } catch {
        setError("Impossibile caricare i dati. Riprova più tardi.");
      } finally {
        setLoading(false);
      }
    },
    [
      fetchSnapshot,
      runPriceScrape,
      selectedGradedId,
      selectedRawId,
      selectedSealedId,
    ]
  );

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

  const openSoldEdit = useCallback(
    (key: string, title: string, subtitle?: string) => {
      setSoldEdit({ key, title, subtitle });
    },
    []
  );

  const buildReferenceLines = useCallback(
    (entryKey: string): ChartReferenceLine[] => {
      const entry = portfolio.entries[entryKey];
      const cost = entry ? getTotalCost(entry) : null;
      if (cost == null) return [];
      return [
        {
          value: cost,
          label: `Acquisto ${cost.toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}`,
          color: "#a78bfa",
        },
      ];
    },
    [portfolio.entries]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateFilters = (partial: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const filteredSealed = useMemo(
    () =>
      data
        ? filterSealedProducts(data.sealed, filters, portfolio.entries)
        : [],
    [data, filters, portfolio.entries]
  );

  const filteredRaw = useMemo(
    () =>
      data ? filterRawCards(data.raw ?? [], filters, portfolio.entries) : [],
    [data, filters, portfolio.entries]
  );

  const filteredAccessory = useMemo(
    () =>
      data
        ? filterAccessoryProducts(data.accessory ?? [], filters, portfolio.entries)
        : [],
    [data, filters, portfolio.entries]
  );

  const filteredGraded = useMemo(
    () =>
      data ? filterGradedCards(data.graded, filters, portfolio.entries) : [],
    [data, filters, portfolio.entries]
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

  const gradedChartKey =
    selectedGradedId && selectedGradeKey
      ? `${selectedGradedId}:${selectedGradeKey}`
      : null;
  const sealedChartRefs = buildReferenceLines(selectedSealedId ?? "");
  const gradedChartRefs = buildReferenceLines(gradedChartKey ?? "");

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
            onClick={() => loadData({ forceRefresh: true })}
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
              Monitora prezzi <strong className="font-medium text-zinc-300">Cardmarket</strong> (min listing EU) e{" "}
              <strong className="font-medium text-zinc-300">eBay EU</strong> (vendute / in vendita, provenienza UE).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SnapshotStatusBadge data={data} scraping={scraping} />
            <button
              onClick={() => setAddProductOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-700"
            >
              <Plus className="h-4 w-4" />
              Aggiungi prodotto
            </button>
            <button
              onClick={() => loadData({ forceRefresh: true })}
              disabled={loading || scraping}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-700 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading || scraping ? "animate-spin" : ""}`}
              />
              {scraping ? "Scraping…" : "Aggiorna prezzi"}
            </button>
          </div>
          {scrapeMessage && (
            <p className="mt-2 text-xs text-pokemon-yellow">{scrapeMessage}</p>
          )}
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
              referenceLines={sealedChartRefs}
            />
          )}
          {showSealed && selectedSealed && !showDualCharts && chartRegion("IT") && sealedIt && (
            <PriceChart
              data={sealedIt.history}
              currency="EUR"
              title={`${selectedSealed.name} · Cardmarket`}
              color="#4ade80"
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              referenceLines={sealedChartRefs}
            />
          )}
          {showSealed && selectedSealed && !showDualCharts && filters.market === "INTL" && sealedIntl && (
            <PriceChart
              data={sealedIntl.history}
              currency="EUR"
              title={`${selectedSealed.name} · eBay EU`}
              color="#fb923c"
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              referenceLines={sealedChartRefs}
            />
          )}
          {showGraded && selectedGraded && selectedGrade && showDualCharts && (
            <DualMarketChart
              itQuote={gradedIt}
              intlQuote={gradedIntl}
              title={`${selectedGraded.name} · ${selectedGrade.company} ${selectedGrade.grade}`}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              referenceLines={gradedChartRefs}
            />
          )}
          {showGraded && selectedGraded && selectedGrade && !showDualCharts && filters.market === "IT" && gradedIt && (
            <PriceChart
              data={gradedIt.history}
              currency="EUR"
              title={`${selectedGraded.name} · ${selectedGrade.company} ${selectedGrade.grade} · Cardmarket`}
              color="#4ade80"
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              referenceLines={gradedChartRefs}
            />
          )}
          {showGraded && selectedGraded && selectedGrade && !showDualCharts && filters.market === "INTL" && gradedIntl && (
            <PriceChart
              data={gradedIntl.history}
              currency="EUR"
              title={`${selectedGraded.name} · ${selectedGrade.company} ${selectedGrade.grade} · eBay EU`}
              color="#fb923c"
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              referenceLines={gradedChartRefs}
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
            onSoldPortfolio={openSoldEdit}
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
            onSoldPortfolio={openSoldEdit}
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
            onSoldPortfolio={openSoldEdit}
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
            onSoldPortfolio={openSoldEdit}
          />
        </section>
      )}

      <footer className="border-t border-zinc-800/80 pt-6 text-center text-xs text-zinc-600">
        Cardmarket · eBay EU — snapshot JSON · portfolio in data/portfolio.json ·
        catalogo utente in data/user-catalog.json ·{" "}
        {data.dataSource === "snapshot" && "dati da cron locale · "}
        {data.stats.blockedCount > 0 &&
          `${data.stats.blockedCount} sorgenti bloccate — npm run scrape in locale · `}
        Catalogo built-in + user-catalog.json
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

      <SoldEditPanel
        open={soldEdit != null}
        title={soldEdit?.title ?? ""}
        subtitle={soldEdit?.subtitle}
        entryKey={soldEdit?.key ?? ""}
        initialEntry={soldEdit ? portfolio.entries[soldEdit.key] : undefined}
        onClose={() => setSoldEdit(null)}
        onSave={savePortfolioEntry}
      />

      <AddProductPanel
        open={addProductOpen}
        onClose={() => setAddProductOpen(false)}
        onAdded={() => loadData({ forceRefresh: true })}
      />
    </div>
  );
}
