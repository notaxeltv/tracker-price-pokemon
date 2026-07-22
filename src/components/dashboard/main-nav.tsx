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
        const badge =
          view.id === "portfolio" && portfolioCount > 0
            ? portfolioCount
            : view.id === "portfolio" && alertCount > 0
              ? alertCount
              : null;

        return (
          <button
            key={view.id}
            type="button"
            onClick={() => onChange(view.id)}
            className={cn(
              "flex flex-1 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all",
              isActive
                ? view.id === "portfolio"
                  ? "border-violet-500/40 bg-violet-500/10 shadow-lg shadow-violet-500/10"
                  : "border-pokemon-yellow/40 bg-pokemon-yellow/10 shadow-lg shadow-yellow-500/10"
                : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70"
            )}
          >
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                isActive
                  ? view.id === "portfolio"
                    ? "bg-violet-500/20 text-violet-300"
                    : "bg-pokemon-yellow/20 text-pokemon-yellow"
                  : "bg-zinc-800 text-zinc-400"
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "font-semibold",
                    isActive ? "text-zinc-100" : "text-zinc-300"
                  )}
                >
                  {view.label}
                </span>
                {badge != null && (
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                    {badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500">{view.description}</p>
            </div>
          </button>
        );
      })}
    </nav>
  );
}
