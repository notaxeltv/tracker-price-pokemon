"use client";

import { cn, formatPercent, formatPrice, getChangeColor } from "@/lib/utils";
import type { MarketQuote } from "@/lib/types";
import { ExternalLink } from "lucide-react";

interface MarketPriceCellProps {
  quote?: MarketQuote;
  compact?: boolean;
}

export function MarketPriceCell({ quote, compact }: MarketPriceCellProps) {
  if (!quote) {
    return <span className="text-zinc-600">—</span>;
  }

  if (!quote.live && quote.scrapeError && quote.price === 0) {
    return (
      <div className="text-right text-xs text-red-400/80" title={quote.scrapeError}>
        Scrape fallito
      </div>
    );
  }

  return (
    <div className={cn("text-right", compact ? "space-y-0" : "space-y-0.5")}>
      <p className="font-semibold text-zinc-100">
        {formatPrice(quote.price, quote.currency)}
      </p>
      {quote.activeListingPrice != null && quote.activeListingPrice > 0 && (
        <p className="text-[10px] text-zinc-400">
          in vendita: {formatPrice(quote.activeListingPrice, quote.currency)}
        </p>
      )}
      <p className={cn("text-xs font-medium", getChangeColor(quote.change7d))}>
        7g: {formatPercent(quote.change7d)}
      </p>
      {!compact && (
        <p className="text-[10px] text-zinc-500">{quote.sourceLabel}</p>
      )}
    </div>
  );
}

interface MarketBadgeProps {
  region: "IT" | "INTL";
}

export function MarketBadge({ region }: MarketBadgeProps) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 text-xs font-medium",
        region === "IT"
          ? "bg-green-500/10 text-green-400"
          : "bg-orange-500/10 text-orange-400"
      )}
    >
      {region === "IT" ? "Cardmarket" : "eBay EU"}
    </span>
  );
}

interface SourceLinkProps {
  quote?: MarketQuote;
}

export function SourceLink({ quote }: SourceLinkProps) {
  if (!quote?.externalUrl) return null;

  return (
    <a
      href={quote.externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1 text-xs text-pokemon-blue hover:underline"
    >
      {quote.sourceLabel}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

interface SpreadBadgeProps {
  spreadPercent: number;
}

export function LiveBadge({
  live,
  blocked,
}: {
  live?: boolean;
  blocked?: boolean;
}) {
  if (blocked) {
    return (
      <span
        className="rounded-md bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-400"
        title="Scrape bloccato — avvia in locale con SCRAPE_USE_PLAYWRIGHT=true"
      >
        Blocked
      </span>
    );
  }
  if (live) {
    return (
      <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
        Live
      </span>
    );
  }
  return (
    <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
      Stima
    </span>
  );
}

export function LanguageBadge({ lang }: { lang: "JP" | "IT" | "EN" }) {
  const labels = { JP: "🇯🇵 JP", IT: "🇮🇹 ITA", EN: "🇬🇧 ENG" };
  return (
    <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-300">
      {labels[lang]}
    </span>
  );
}

export function SpreadBadge({ spreadPercent }: SpreadBadgeProps) {
  const cheaper =
    spreadPercent > 2 ? "INTL" : spreadPercent < -2 ? "IT" : "pari";

  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 text-xs font-medium",
        cheaper === "IT" && "bg-green-500/10 text-green-400",
        cheaper === "INTL" && "bg-orange-500/10 text-orange-400",
        cheaper === "pari" && "bg-zinc-800 text-zinc-400"
      )}
      title="Spread Cardmarket vs eBay EU"
    >
      {cheaper === "pari"
        ? "≈ pari"
        : cheaper === "IT"
          ? `CM −${Math.abs(spreadPercent)}%`
          : `eBay −${Math.abs(spreadPercent)}%`}
    </span>
  );
}
