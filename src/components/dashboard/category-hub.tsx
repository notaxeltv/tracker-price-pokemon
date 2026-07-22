"use client";

import { cn } from "@/lib/utils";
import type { DashboardCategory, ProductCategory } from "@/lib/types";
import { Gem, Layers, Package, Puzzle } from "lucide-react";

interface CategoryHubProps {
  counts: Record<ProductCategory, number>;
  onSelect: (category: DashboardCategory) => void;
}

const categories: {
  id: ProductCategory;
  label: string;
  description: string;
  icon: typeof Package;
  color: string;
}[] = [
  {
    id: "sealed",
    label: "Sealed",
    description: "Box, ETB, bundle IT / EN / JP",
    icon: Package,
    color: "border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10",
  },
  {
    id: "graded",
    label: "Gradate",
    description: "PSA · BGS · CGC per grado",
    icon: Gem,
    color: "border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10",
  },
  {
    id: "raw",
    label: "Raw",
    description: "Carte non gradate",
    icon: Layers,
    color: "border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10",
  },
  {
    id: "accessory",
    label: "Accessori",
    description: "Sleeve, toploader, supply",
    icon: Puzzle,
    color: "border-zinc-500/30 bg-zinc-500/5 hover:bg-zinc-500/10",
  },
];

export function CategoryHub({ counts, onSelect }: CategoryHubProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={cn(
              "flex items-start gap-4 rounded-2xl border p-5 text-left transition-colors",
              cat.color
            )}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-900/60">
              <Icon className="h-5 w-5 text-zinc-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-100">{cat.label}</span>
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                  {counts[cat.id]}
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-500">{cat.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
