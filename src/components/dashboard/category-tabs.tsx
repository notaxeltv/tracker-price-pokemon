"use client";

import { cn } from "@/lib/utils";
import type { DashboardCategory } from "@/lib/types";
import { Package, Gem, Layers, Puzzle, LayoutGrid } from "lucide-react";

interface CategoryTabsProps {
  active: DashboardCategory;
  onChange: (category: DashboardCategory) => void;
  sealedCount: number;
  gradedCount: number;
  rawCount: number;
  accessoryCount: number;
}

const tabs = [
  { id: "all" as const, label: "Categorie", icon: LayoutGrid },
  { id: "sealed" as const, label: "Sealed", icon: Package },
  { id: "graded" as const, label: "Gradate", icon: Gem },
  { id: "raw" as const, label: "Raw", icon: Layers },
  { id: "accessory" as const, label: "Accessori", icon: Puzzle },
];

export function CategoryTabs({
  active,
  onChange,
  sealedCount,
  gradedCount,
  rawCount,
  accessoryCount,
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
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              isActive ? "btn-tab-active" : "btn-tab-inactive"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {tab.label}
            <span
              className={cn(
                isActive ? "badge-count-active" : "badge-count px-1.5 py-0.5 text-[11px] text-zinc-500"
              )}
            >
              {counts[tab.id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
