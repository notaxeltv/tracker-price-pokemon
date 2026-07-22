"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardHeader } from "./dashboard-header";
import { MainNav } from "./main-nav";
import { OverviewPanel } from "./overview-panel";
import { CategoryTabs } from "./category-tabs";
import { CategoryHub } from "./category-hub";
import { SearchFilters } from "./search-filters";
import { DualMarketChart, PriceChart } from "./price-chart";
import { SealedTable, GradedTable, RawTable, AccessoryTable } from "./product-table";
import { PortfolioEditPanel, SoldEditPanel } from "./portfolio-panel";
import { AddProductPanel } from "./add-product-panel";
import { ManageCatalogPanel } from "./manage-catalog-panel";
import { PortfolioView } from "./portfolio-view";
import { buildPortfolioRows } from "@/lib/portfolio-resolve";
import {
  filterAccessoryProducts,
  filterGradedCards,
  filterRawCards,
  filterSealedProducts,
} from "@/lib/filters";
import { getGradedMarket, getSealedMarket } from "@/lib/market-utils";
import { computePortfolioSummary } from "@/lib/portfolio-summary";
import type {
  AppView,
  DashboardCategory,
  DashboardData,
  MarketRegion,
  PortfolioData,
  PortfolioEntry,
  ProductFilters,
  TimeRange,
} from "@/lib/types";
import { getPriceAlertStatus, getTotalCost } from "@/lib/portfolio";
import { RefreshCw } from "lucide-react";
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
  const [appView, setAppView] = useState<AppView>("overview");
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
  const [manageCatalogOpen, setManageCatalogOpen] = useState(false);

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

  const setMarketCategory = (category: DashboardCategory) => {
    updateFilters({ category });
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

  const portfolioRows = useMemo(
    () => (data ? buildPortfolioRows(data, portfolio.entries) : []),
    [data, portfolio.entries]
  );

  const activeAlerts = useMemo(
    () =>
      portfolioRows.filter(
        (row) =>
          !row.entry.soldPrice &&
          getPriceAlertStatus(row.entry, row.marketPrice) != null
      ),
    [portfolioRows]
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

  const category = filters.category;
  const isCategoryHub = category === "all";
  const showSealed = category === "sealed";
  const showGraded = category === "graded";
  const showRaw = category === "raw";
  const showAccessory = category === "accessory";
  const showCharts =
    appView === "market" &&
    !isCategoryHub &&
    (showSealed || showGraded);

  if (loading && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <RefreshCw className="h-8 w-8 animate-spin text-brand-light" />
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
            className="btn-primary mt-4"
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

  const categoryCounts = {
    sealed: data.sealed.length,
    graded: data.graded.length,
    raw: data.raw?.length ?? 0,
    accessory: data.accessory?.length ?? 0,
  };

  return (
    <div className="app-shell">
      <DashboardHeader
        data={data}
        scraping={scraping}
        loading={loading}
        scrapeMessage={scrapeMessage}
        onRefresh={() => loadData({ forceRefresh: true })}
        onAddProduct={() => setAddProductOpen(true)}
        onManageCatalog={() => setManageCatalogOpen(true)}
      />

      <section className="mb-6">
        <MainNav
          active={appView}
          onChange={setAppView}
          portfolioCount={portfolioRows.length}
          alertCount={activeAlerts.length}
        />
      </section>

      {activeAlerts.length > 0 && appView !== "portfolio" && (
        <section className="alert-banner mb-6">
          <p className="text-sm text-brand-light">
            {activeAlerts.length} alert prezzo attivi
          </p>
          <button
            type="button"
            onClick={() => setAppView("portfolio")}
            className="mt-1 text-xs text-zinc-500 underline underline-offset-2 hover:text-zinc-300"
          >
            Vai al Portfolio
          </button>
        </section>
      )}

      {appView === "overview" && (
        <OverviewPanel
          data={data}
          portfolio={portfolio}
          portfolioSummary={portfolioSummary}
          alertCount={activeAlerts.length}
          onNavigate={setAppView}
        />
      )}

      {appView === "portfolio" && (
        <PortfolioView
          data={data}
          portfolio={portfolio}
          onEdit={openPortfolioEdit}
          onSold={openSoldEdit}
        />
      )}

      {appView === "market" && (
        <div className="space-y-5">
          <CategoryTabs
            active={category}
            onChange={setMarketCategory}
            sealedCount={categoryCounts.sealed}
            gradedCount={categoryCounts.graded}
            rawCount={categoryCounts.raw}
            accessoryCount={categoryCounts.accessory}
          />

          {!isCategoryHub && (
            <SearchFilters
              filters={filters}
              onChange={updateFilters}
              showSealedLang={showSealed}
              showGradedFilters={showGraded}
            />
          )}

          {isCategoryHub && (
            <CategoryHub counts={categoryCounts} onSelect={setMarketCategory} />
          )}

          {showCharts && (
            <section className="grid gap-6 lg:grid-cols-2">
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
            <section>
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
            <section>
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
            <section>
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
            <section>
              <AccessoryTable
                products={filteredAccessory}
                portfolio={portfolio.entries}
                onEditPortfolio={openPortfolioEdit}
                onSoldPortfolio={openSoldEdit}
              />
            </section>
          )}
        </div>
      )}

      <footer className="app-footer">
        Cardmarket · eBay EU · snapshot locale
        {data.stats.blockedCount > 0 &&
          ` · ${data.stats.blockedCount} sorgenti bloccate`}
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

      <ManageCatalogPanel
        open={manageCatalogOpen}
        onClose={() => setManageCatalogOpen(false)}
        onChanged={() => loadData({ forceRefresh: true })}
      />
    </div>
  );
}
