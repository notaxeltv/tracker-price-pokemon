"use client";

import Image from "next/image";
import { MiniSparkline } from "./price-chart";
import {
  LanguageBadge,
  LiveBadge,
  MarketBadge,
  MarketPriceCell,
  SourceLink,
  SpreadBadge,
} from "./market-price-cell";
import {
  cn,
  formatPercent,
  getChangeColor,
  getSealedTypeLabel,
} from "@/lib/utils";
import { getSpreadPercent } from "@/lib/filters";
import { getSealedMarket } from "@/lib/market-utils";
import type { AccessoryProduct, GradedCard, MarketFilter, PortfolioEntry, RawCard, SealedProduct } from "@/lib/types";
import { getGradedMarket } from "@/lib/market-utils";
import { portfolioKey } from "@/lib/portfolio";
import { PlexiglassBadge, PortfolioCostCell } from "./portfolio-panel";

interface PortfolioTableProps {
  portfolio: Record<string, PortfolioEntry>;
  onEditPortfolio: (key: string, title: string, subtitle?: string) => void;
}

interface SealedTableProps extends PortfolioTableProps {
  products: SealedProduct[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function SealedTable({
  products,
  selectedId,
  onSelect,
  portfolio,
  onEditPortfolio,
}: SealedTableProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-12 text-center text-zinc-500">
        Nessun prodotto sealed trovato con i filtri attuali.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 font-medium">Prodotto</th>
              <th className="px-4 py-3 font-medium">Lingua</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium text-right">Cardmarket</th>
              <th className="px-4 py-3 font-medium text-right">eBay EU</th>
              <th className="px-4 py-3 font-medium text-right">Acquisto</th>
              <th className="px-4 py-3 font-medium text-right">7g</th>
              <th className="px-4 py-3 font-medium">Fonte</th>
              <th className="px-4 py-3 font-medium">Trend</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const cm = getSealedMarket(product, "IT");
              const ebay = getSealedMarket(product, "INTL");
              const entry = portfolio[product.id];
              const marketPrice = cm?.price ?? ebay?.price;

              return (
                <tr
                  key={product.id}
                  onClick={() => onSelect(product.id)}
                  className={cn(
                    "cursor-pointer border-b border-zinc-800/50 transition-colors hover:bg-zinc-800/40",
                    selectedId === product.id && "bg-pokemon-blue/10"
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-contain p-1"
                            sizes="40px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-600">
                            📦
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-zinc-100">
                          {product.name}
                        </p>
                        <p className="truncate text-xs text-zinc-500">
                          {product.set} · {product.setCode}
                        </p>
                        <PlexiglassBadge entry={entry} className="mt-1" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <LanguageBadge lang={product.language} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-400">
                      {getSealedTypeLabel(product.type)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <MarketPriceCell quote={cm} compact />
                  </td>
                  <td className="px-4 py-3">
                    <MarketPriceCell quote={ebay} compact />
                  </td>
                  <td className="px-4 py-3">
                    <PortfolioCostCell
                      entry={entry}
                      marketPrice={marketPrice}
                      onEdit={() =>
                        onEditPortfolio(product.id, product.name, product.set)
                      }
                    />
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 text-right text-sm font-medium",
                      cm && getChangeColor(cm.change7d)
                    )}
                  >
                    {cm ? formatPercent(cm.change7d) : ebay ? formatPercent(ebay.change7d) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <LiveBadge live={cm?.live || ebay?.live} blocked={cm?.blocked || ebay?.blocked} />
                      <SourceLink quote={cm ?? ebay} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {(cm ?? ebay) && (
                      <MiniSparkline
                        data={(cm ?? ebay)!.history}
                        positive={(cm ?? ebay)!.change7d >= 0}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface GradedTableProps extends PortfolioTableProps {
  cards: GradedCard[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  marketFilter: MarketFilter;
}

export function GradedTable({
  cards,
  selectedId,
  onSelect,
  marketFilter,
  portfolio,
  onEditPortfolio,
}: GradedTableProps) {
  const showCompare = marketFilter === "all" || marketFilter === "compare";

  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-12 text-center text-zinc-500">
        Nessuna carta gradata trovata con i filtri attuali.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cards.map((card) => {
        const isSelected = selectedId === card.id;
        const topGrade = [...card.grades].sort((a, b) => {
          const pa = getGradedMarket(a, "IT")?.price ?? 0;
          const pb = getGradedMarket(b, "IT")?.price ?? 0;
          return pb - pa;
        })[0];
        const topIt = topGrade ? getGradedMarket(topGrade, "IT") : undefined;
        const topIntl = topGrade ? getGradedMarket(topGrade, "INTL") : undefined;

        return (
          <div
            key={card.id}
            onClick={() => onSelect(card.id)}
            className={cn(
              "cursor-pointer rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 transition-all hover:border-zinc-700",
              isSelected && "border-pokemon-blue/50 bg-pokemon-blue/5"
            )}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                  {card.imageUrl ? (
                    <Image
                      src={card.imageUrl}
                      alt={card.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg">
                      🃏
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-zinc-100">{card.name}</h3>
                    {card.nameJa && (
                      <span className="text-sm text-zinc-400">{card.nameJa}</span>
                    )}
                    <LanguageBadge lang={card.language} />
                    <span className="text-xs text-zinc-500">#{card.cardNumber}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    {card.set} · {card.setCode}
                  </p>

                  <div className="mt-3 space-y-2">
                    {card.grades.map((grade) => {
                      const it = getGradedMarket(grade, "IT");
                      const intl = getGradedMarket(grade, "INTL");
                      const gradeKey = `${grade.company}-${grade.grade}`;
                      const entryKey = portfolioKey(card.id, gradeKey);
                      const entry = portfolio[entryKey];
                      const primaryQuote = it ?? intl;
                      const spread =
                        it && intl
                          ? getSpreadPercent(it.price, intl.price)
                          : 0;

                      return (
                        <div
                          key={gradeKey}
                          className="rounded-xl border border-zinc-800 bg-zinc-800/40 p-3"
                        >
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-pokemon-yellow">
                              {grade.company} {grade.grade}
                            </span>
                            <PlexiglassBadge entry={entry} />
                            {showCompare && it && intl && (
                              <SpreadBadge spreadPercent={spread} />
                            )}
                            <LiveBadge
                              live={it?.live || intl?.live}
                              blocked={it?.blocked || intl?.blocked}
                            />
                            <div className="ml-auto">
                              <PortfolioCostCell
                                entry={entry}
                                marketPrice={primaryQuote?.price}
                                onEdit={() =>
                                  onEditPortfolio(
                                    entryKey,
                                    `${card.name} · ${grade.company} ${grade.grade}`,
                                    card.set
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {(marketFilter === "all" ||
                              marketFilter === "compare" ||
                              marketFilter === "IT") &&
                              it && (
                                <div className="flex items-start justify-between gap-2 rounded-lg bg-green-500/5 p-2">
                                  <div>
                                    <MarketBadge region="IT" />
                                    <p className="mt-1 text-sm font-semibold text-zinc-100">
                                      {it.price.toLocaleString("it-IT", {
                                        style: "currency",
                                        currency: "EUR",
                                      })}
                                    </p>
                                    <p
                                      className={cn(
                                        "text-xs",
                                        getChangeColor(it.change7d)
                                      )}
                                    >
                                      7g: {formatPercent(it.change7d)}
                                    </p>
                                  </div>
                                  <SourceLink quote={it} />
                                </div>
                              )}
                            {(marketFilter === "all" ||
                              marketFilter === "compare" ||
                              marketFilter === "INTL") &&
                              intl && (
                                <div className="flex items-start justify-between gap-2 rounded-lg bg-orange-500/5 p-2">
                                  <div>
                                    <MarketBadge region="INTL" />
                                    <p className="mt-1 text-sm font-semibold text-zinc-100">
                                      {intl.price.toLocaleString("it-IT", {
                                        style: "currency",
                                        currency: "EUR",
                                      })}
                                    </p>
                                    <p
                                      className={cn(
                                        "text-xs",
                                        getChangeColor(intl.change7d)
                                      )}
                                    >
                                      7g: {formatPercent(intl.change7d)}
                                    </p>
                                  </div>
                                  <SourceLink quote={intl} />
                                </div>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              {topIt && (
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">Cardmarket max</p>
                    <p className="text-lg font-bold text-zinc-100">
                      {topIt.price.toLocaleString("it-IT", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </p>
                    {topIntl && (
                      <p className="text-xs text-zinc-500">
                        eBay EU:{" "}
                        {topIntl.price.toLocaleString("it-IT", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </p>
                    )}
                  </div>
                  <MiniSparkline
                    data={topIt.history}
                    positive={topIt.change7d >= 0}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface RawTableProps extends PortfolioTableProps {
  cards: RawCard[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function RawTable({
  cards,
  selectedId,
  onSelect,
  portfolio,
  onEditPortfolio,
}: RawTableProps) {
  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-12 text-center text-zinc-500">
        Nessuna carta raw trovata con i filtri attuali.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 font-medium">Carta</th>
              <th className="px-4 py-3 font-medium">Lingua</th>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium text-right">Cardmarket</th>
              <th className="px-4 py-3 font-medium text-right">eBay EU</th>
              <th className="px-4 py-3 font-medium text-right">Acquisto</th>
              <th className="px-4 py-3 font-medium">Fonte</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => {
              const it = card.markets.find((m) => m.region === "IT");
              const intl = card.markets.find((m) => m.region === "INTL");
              const entry = portfolio[card.id];
              const marketPrice = it?.price ?? intl?.price;

              return (
                <tr
                  key={card.id}
                  onClick={() => onSelect(card.id)}
                  className={cn(
                    "cursor-pointer border-b border-zinc-800/50 transition-colors hover:bg-zinc-800/40",
                    selectedId === card.id && "bg-pokemon-blue/10"
                  )}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-100">{card.name}</p>
                    <p className="text-xs text-zinc-500">
                      {card.set} · {card.setCode}
                    </p>
                    <PlexiglassBadge entry={entry} className="mt-1" />
                  </td>
                  <td className="px-4 py-3">
                    <LanguageBadge lang={card.language} />
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{card.cardNumber}</td>
                  <td className="px-4 py-3">
                    <MarketPriceCell quote={it} compact />
                  </td>
                  <td className="px-4 py-3">
                    <MarketPriceCell quote={intl} compact />
                  </td>
                  <td className="px-4 py-3">
                    <PortfolioCostCell
                      entry={entry}
                      marketPrice={marketPrice}
                      onEdit={() =>
                        onEditPortfolio(card.id, card.name, card.set)
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <LiveBadge
                      live={it?.live || intl?.live}
                      blocked={it?.blocked || intl?.blocked}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface AccessoryTableProps extends PortfolioTableProps {
  products: AccessoryProduct[];
}

export function AccessoryTable({
  products,
  portfolio,
  onEditPortfolio,
}: AccessoryTableProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-12 text-center text-zinc-500">
        Nessun accessorio trovato con i filtri attuali.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 font-medium">Accessorio</th>
              <th className="px-4 py-3 font-medium text-right">Cardmarket</th>
              <th className="px-4 py-3 font-medium text-right">eBay EU</th>
              <th className="px-4 py-3 font-medium text-right">Acquisto</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const it = product.markets.find((m) => m.region === "IT");
              const intl = product.markets.find((m) => m.region === "INTL");
              const entry = portfolio[product.id];
              const marketPrice = it?.price ?? intl?.price;

              return (
                <tr
                  key={product.id}
                  className="border-b border-zinc-800/50 hover:bg-zinc-800/40"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-100">{product.name}</p>
                    <PlexiglassBadge entry={entry} className="mt-1" />
                  </td>
                  <td className="px-4 py-3">
                    <MarketPriceCell quote={it} compact />
                  </td>
                  <td className="px-4 py-3">
                    <MarketPriceCell quote={intl} compact />
                  </td>
                  <td className="px-4 py-3">
                    <PortfolioCostCell
                      entry={entry}
                      marketPrice={marketPrice}
                      onEdit={() => onEditPortfolio(product.id, product.name)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
