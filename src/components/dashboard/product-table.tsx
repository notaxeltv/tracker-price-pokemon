"use client";

import Image from "next/image";
import { MiniSparkline } from "./price-chart";
import {
  cn,
  formatPercent,
  formatPrice,
  getChangeColor,
  getSealedTypeLabel,
} from "@/lib/utils";
import type { SealedProduct } from "@/lib/types";
import { ExternalLink } from "lucide-react";

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
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 font-medium">Prodotto</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Mercato</th>
              <th className="px-4 py-3 font-medium text-right">Prezzo</th>
              <th className="px-4 py-3 font-medium text-right">24h</th>
              <th className="px-4 py-3 font-medium text-right">7g</th>
              <th className="px-4 py-3 font-medium text-right">30g</th>
              <th className="px-4 py-3 font-medium">Trend</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
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
                  <span className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-400">
                    {getSealedTypeLabel(product.type)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-md px-2 py-1 text-xs font-medium",
                      product.market === "EU"
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-red-500/10 text-red-400"
                    )}
                  >
                    {product.market}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-zinc-100">
                  {formatPrice(product.price, product.currency)}
                </td>
                <td
                  className={cn(
                    "px-4 py-3 text-right font-medium",
                    getChangeColor(product.change24h)
                  )}
                >
                  {formatPercent(product.change24h)}
                </td>
                <td
                  className={cn(
                    "px-4 py-3 text-right font-medium",
                    getChangeColor(product.change7d)
                  )}
                >
                  {formatPercent(product.change7d)}
                </td>
                <td
                  className={cn(
                    "px-4 py-3 text-right font-medium",
                    getChangeColor(product.change30d)
                  )}
                >
                  {formatPercent(product.change30d)}
                </td>
                <td className="px-4 py-3">
                  <MiniSparkline
                    data={product.history}
                    positive={product.change7d >= 0}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface GradedTableProps {
  cards: import("@/lib/types").GradedCard[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function GradedTable({ cards, selectedId, onSelect }: GradedTableProps) {
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
        const topGrade = [...card.grades].sort((a, b) => b.price - a.price)[0];
        const isSelected = selectedId === card.id;

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
                    <span className="text-xs text-zinc-500">#{card.cardNumber}</span>
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-xs font-medium",
                        card.market === "EU"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-red-500/10 text-red-400"
                      )}
                    >
                      {card.market}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    {card.set} · {card.setCode}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {card.grades.map((grade) => (
                      <div
                        key={`${grade.company}-${grade.grade}`}
                        className="rounded-xl border border-zinc-800 bg-zinc-800/50 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-pokemon-yellow">
                            {grade.company} {grade.grade}
                          </span>
                          <span className="text-sm font-semibold text-zinc-100">
                            {formatPrice(
                              grade.price,
                              card.market === "EU" ? "EUR" : "USD"
                            )}
                          </span>
                        </div>
                        <p
                          className={cn(
                            "mt-0.5 text-xs font-medium",
                            getChangeColor(grade.change7d)
                          )}
                        >
                          7g: {formatPercent(grade.change7d)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <div className="text-right">
                  <p className="text-xs text-zinc-500">Prezzo max</p>
                  <p className="text-lg font-bold text-zinc-100">
                    {formatPrice(
                      topGrade.price,
                      card.market === "EU" ? "EUR" : "USD"
                    )}
                  </p>
                </div>
                <MiniSparkline
                  data={topGrade.history}
                  positive={topGrade.change7d >= 0}
                />
                {isSelected && (
                  <span className="inline-flex items-center gap-1 text-xs text-pokemon-blue">
                    <ExternalLink className="h-3 w-3" />
                    Selezionato
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
