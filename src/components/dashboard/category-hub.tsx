"use client";

import { categoryCardClass } from "@/lib/design";
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
  variant: ProductCategory;
}[] = [
  {
    id: "sealed",
    label: "Sealed",
    description: "Box, ETB, bundle IT / EN / JP",
    icon: Package,
    variant: "sealed",
  },
  {
    id: "graded",
    label: "Gradate",
    description: "PSA · BGS · CGC per grado",
    icon: Gem,
    variant: "graded",
  },
  {
    id: "raw",
    label: "Raw",
    description: "Carte non gradate",
    icon: Layers,
    variant: "raw",
  },
  {
    id: "accessory",
    label: "Accessori",
    description: "Sleeve, toploader, supply",
    icon: Puzzle,
    variant: "accessory",
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
            className={categoryCardClass(cat.variant)}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-900/60">
              <Icon className="h-5 w-5 text-zinc-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-100">{cat.label}</span>
                <span className="badge-count">{counts[cat.id]}</span>
              </div>
              <p className="mt-1 text-sm text-zinc-500">{cat.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
