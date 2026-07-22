"use client";

import { cn } from "@/lib/utils";
import type { AppView } from "@/lib/types";
import { BarChart3, LayoutGrid, Wallet } from "lucide-react";

interface MainNavProps {
  active: AppView;
  onChange: (view: AppView) => void;
  portfolioCount?: number;
  alertCount?: number;
}

const views: {
  id: AppView;
  label: string;
  description: string;
  icon: typeof LayoutGrid;
}[] = [
  {
    id: "overview",
    label: "Panoramica",
    description: "Riepilogo rapido",
    icon: LayoutGrid,
  },
  {
    id: "market",
    label: "Mercato",
    description: "Prezzi e prodotti",
    icon: BarChart3,
  },
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Acquisti e vendite",
    icon: Wallet,
  },
];

export function MainNav({
  active,
  onChange,
  portfolioCount = 0,
  alertCount = 0,
}: MainNavProps) {
  return (
    <nav className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
      {views.map((view) => {
        const Icon = view.icon;
        const isActive = active === view.id;
        const isPortfolio = view.id === "portfolio";
        const badge =
          isPortfolio && portfolioCount > 0
            ? portfolioCount
            : isPortfolio && alertCount > 0
              ? alertCount
              : null;

        return (
          <button
            key={view.id}
            type="button"
            onClick={() => onChange(view.id)}
            className={cn(isActive ? "nav-card-active" : "nav-card-inactive")}
          >
            <div
              className={cn(
                "nav-icon",
                isActive ? "nav-icon-active" : "nav-icon-inactive"
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "font-semibold",
                    isActive ? "text-zinc-100" : "text-zinc-400"
                  )}
                >
                  {view.label}
                </span>
                {badge != null && (
                  <span className="badge-count">{badge}</span>
                )}
              </div>
              <p className="text-xs text-zinc-600">{view.description}</p>
            </div>
          </button>
        );
      })}
    </nav>
  );
}
