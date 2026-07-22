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
import type { GradedCard, MarketFilter, SealedProduct } from "@/lib/types";
import { getGradedMarket } from "@/lib/market-utils";

interface SealedTableProps {
  products: SealedProduct[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function SealedTable({
  products,
  selectedId,
  onSelect,
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
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 font-medium">Prodotto</th>
              <th className="px-4 py-3 font-medium">Lingua</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium text-right">Prezzo</th>
              <th className="px-4 py-3 font-medium text-right">7g</th>
              <th className="px-4 py-3 font-medium">Fonte</th>
              <th className="px-4 py-3 font-medium">Trend</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const quote =
                product.language === "IT"
                  ? getSealedMarket(product, "IT")
                  : getSealedMarket(product, "INTL");

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
                    <MarketPriceCell quote={quote} compact />
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 text-right text-sm font-medium",
                      quote && getChangeColor(quote.change7d)
                    )}
                  >
                    {quote ? formatPercent(quote.change7d) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <LiveBadge live={quote?.live} blocked={quote?.blocked} />
                      <SourceLink quote={quote} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {quote && (
                      <MiniSparkline
                        data={quote.history}
                        positive={quote.change7d >= 0}
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

interface GradedTableProps {
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
                    <LanguageBadge lang="JP" />
                    <span className="text-xs text-zinc-500">#{card.cardNumber}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    {card.set} · {card.setCode}
                  </p>

                  <div className="mt-3 space-y-2">
                    {card.grades.map((grade) => {
                      const it = getGradedMarket(grade, "IT");
                      const intl = getGradedMarket(grade, "INTL");
                      const spread =
                        it && intl
                          ? getSpreadPercent(it.price, intl.price)
                          : 0;

                      return (
                        <div
                          key={`${grade.company}-${grade.grade}`}
                          className="rounded-xl border border-zinc-800 bg-zinc-800/40 p-3"
                        >
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-pokemon-yellow">
                              PSA {grade.grade}
                            </span>
                            {showCompare && it && intl && (
                              <SpreadBadge spreadPercent={spread} />
                            )}
                            <LiveBadge
                              live={it?.live || intl?.live}
                              blocked={it?.blocked || intl?.blocked}
                            />
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
                                      {intl.price.toLocaleString("en-US", {
                                        style: "currency",
                                        currency: "USD",
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
                    <p className="text-xs text-zinc-500">Prezzo max IT</p>
                    <p className="text-lg font-bold text-zinc-100">
                      {topIt.price.toLocaleString("it-IT", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </p>
                    {topIntl && (
                      <p className="text-xs text-zinc-500">
                        INTL:{" "}
                        {topIntl.price.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
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
