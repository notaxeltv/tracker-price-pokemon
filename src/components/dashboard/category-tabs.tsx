"use client";

import { cn } from "@/lib/utils";
import type { ProductCategory } from "@/lib/types";
import { Package, Gem, Layers, Puzzle } from "lucide-react";

interface CategoryTabsProps {
  active: ProductCategory | "all";
  onChange: (category: ProductCategory | "all") => void;
  sealedCount: number;
  gradedCount: number;
  rawCount: number;
  accessoryCount: number;
}

const tabs = [
  { id: "all" as const, label: "Tutti", icon: null },
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
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
              isActive
                ? "bg-pokemon-yellow text-zinc-900 shadow-lg shadow-yellow-500/20"
                : "border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {tab.label}
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs",
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
