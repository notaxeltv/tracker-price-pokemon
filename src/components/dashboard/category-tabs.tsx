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
              "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all",
              isActive
                ? "bg-pokemon-yellow text-zinc-900 shadow-md shadow-yellow-500/15"
                : "border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {tab.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[11px]",
                isActive ? "bg-zinc-900/20 text-zinc-900" : "bg-zinc-800 text-zinc-500"
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
