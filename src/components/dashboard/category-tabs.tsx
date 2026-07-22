"use client";

import { cn } from "@/lib/utils";
import { formatFreshnessLabel } from "@/lib/category-freshness";
import type { CategoryFreshness } from "@/lib/category-freshness";
import type { DashboardCategory, ProductCategory } from "@/lib/types";
import { Package, Gem, Layers, Puzzle, LayoutGrid } from "lucide-react";

interface CategoryTabsProps {
  active: DashboardCategory;
  onChange: (category: DashboardCategory) => void;
  sealedCount: number;
  gradedCount: number;
  rawCount: number;
  accessoryCount: number;
  freshness?: Record<ProductCategory, CategoryFreshness>;
}

const tabs = [
  { id: "all" as const, label: "Categorie", icon: LayoutGrid, freshKey: null },
  { id: "sealed" as const, label: "Sealed", icon: Package, freshKey: "sealed" as const },
  { id: "graded" as const, label: "Gradate", icon: Gem, freshKey: "graded" as const },
  { id: "raw" as const, label: "Raw", icon: Layers, freshKey: "raw" as const },
  { id: "accessory" as const, label: "Accessori", icon: Puzzle, freshKey: "accessory" as const },
];

export function CategoryTabs({
  active,
  onChange,
  sealedCount,
  gradedCount,
  rawCount,
  accessoryCount,
  freshness,
}: CategoryTabsProps) {
  const counts: Record<string, number> = {
    all: sealedCount + gradedCount + rawCount + accessoryCount,
    sealed: sealedCount,
    graded: gradedCount,
    raw: rawCount,
    accessory: accessoryCount,
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        const fresh =
          tab.freshKey && freshness ? freshness[tab.freshKey] : null;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(isActive ? "btn-tab-active" : "btn-tab-inactive")}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="flex flex-col items-start leading-tight">
              <span className="flex items-center gap-1.5">
                {tab.label}
                <span
                  className={cn(
                    isActive
                      ? "badge-count-active"
                      : "badge-count px-1.5 py-0.5 text-[11px] text-zinc-500"
                  )}
                >
                  {counts[tab.id]}
                </span>
              </span>
              {fresh && tab.id !== "all" && (
                <span className="mt-0.5 text-[10px] font-normal opacity-70">
                  {formatFreshnessLabel(fresh.lastScraped)} · {fresh.liveCount}/{fresh.totalQuotes} live
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
