"use client";

import { Search, Globe, ArrowUpDown, Languages } from "lucide-react";
import type { GradingCompany, ProductFilters } from "@/lib/types";

interface SearchFiltersProps {
  filters: ProductFilters;
  onChange: (filters: Partial<ProductFilters>) => void;
  showSealedLang?: boolean;
  showGradedFilters?: boolean;
}

const GRADING_COMPANIES: GradingCompany[] = ["PSA", "BGS", "CGC", "ACE", "TAG"];

export function SearchFilters({
  filters,
  onChange,
  showSealedLang = false,
  showGradedFilters = false,
}: SearchFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Cerca PSA/BGS/CGC, sealed, raw..."
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-pokemon-blue focus:outline-none focus:ring-1 focus:ring-pokemon-blue/50"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {showSealedLang && (
          <div className="relative">
            <Languages className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <select
              value={filters.sealedLanguage}
              onChange={(e) =>
                onChange({
                  sealedLanguage: e.target
                    .value as ProductFilters["sealedLanguage"],
                })
              }
              className="appearance-none rounded-xl border border-zinc-800 bg-zinc-900/80 py-2.5 pl-10 pr-8 text-sm text-zinc-100 focus:border-pokemon-blue focus:outline-none"
            >
              <option value="all">Sealed: tutte le lingue</option>
              <option value="IT">🇮🇹 Solo italiano</option>
              <option value="EN">🇬🇧 Solo inglese</option>
              <option value="JP">🇯🇵 Solo giapponese</option>
            </select>
          </div>
        )}

        <div className="relative">
          <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <select
            value={filters.market}
            onChange={(e) =>
              onChange({ market: e.target.value as ProductFilters["market"] })
            }
            className="appearance-none rounded-xl border border-zinc-800 bg-zinc-900/80 py-2.5 pl-10 pr-8 text-sm text-zinc-100 focus:border-pokemon-blue focus:outline-none"
          >
            <option value="all">Tutti i mercati</option>
            <option value="compare">Confronto IT / INTL</option>
            <option value="IT">🇮🇹 Italia (EUR)</option>
            <option value="INTL">🌍 Internazionale (USD)</option>
          </select>
        </div>

        {showGradedFilters && (
          <>
            <select
              value={filters.gradingCompany ?? "all"}
              onChange={(e) =>
                onChange({
                  gradingCompany:
                    e.target.value === "all"
                      ? undefined
                      : (e.target.value as GradingCompany),
                })
              }
              className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-100 focus:border-pokemon-blue focus:outline-none"
            >
              <option value="all">Grading: tutti</option>
              {GRADING_COMPANIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={filters.grade ?? "all"}
              onChange={(e) =>
                onChange({
                  grade:
                    e.target.value === "all"
                      ? undefined
                      : Number(e.target.value),
                })
              }
              className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-100 focus:border-pokemon-blue focus:outline-none"
            >
              <option value="all">Grado: tutti</option>
              <option value="10">10</option>
              <option value="9">9</option>
            </select>
          </>
        )}

        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <select
            value={`${filters.sortField}-${filters.sortDirection}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split("-") as [
                ProductFilters["sortField"],
                ProductFilters["sortDirection"],
              ];
              onChange({ sortField: field, sortDirection: direction });
            }}
            className="appearance-none rounded-xl border border-zinc-800 bg-zinc-900/80 py-2.5 pl-10 pr-8 text-sm text-zinc-100 focus:border-pokemon-blue focus:outline-none"
          >
            <option value="price-desc">Prezzo ↓</option>
            <option value="price-asc">Prezzo ↑</option>
            <option value="change7d-desc">Var. 7g ↓</option>
            <option value="change7d-asc">Var. 7g ↑</option>
            <option value="change30d-desc">Var. 30g ↓</option>
            <option value="change30d-asc">Var. 30g ↑</option>
            <option value="name-asc">Nome A-Z</option>
          </select>
        </div>
      </div>
    </div>
  );
}
