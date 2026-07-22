"use client";

import { cn, formatDate } from "@/lib/utils";
import type { DashboardData } from "@/lib/types";

interface SnapshotStatusBadgeProps {
  data: DashboardData;
  scraping?: boolean;
}

export function SnapshotStatusBadge({ data, scraping }: SnapshotStatusBadgeProps) {
  const ageMs = Date.now() - new Date(data.lastUpdated).getTime();
  const ageMin = Math.max(0, Math.round(ageMs / 60000));
  const totalQuotes =
    data.sealed.reduce((n, p) => n + p.markets.length, 0) +
    data.graded.reduce(
      (n, c) => n + c.grades.reduce((m, g) => m + g.markets.length, 0),
      0
    ) +
    data.raw.reduce((n, c) => n + c.markets.length, 0) +
    data.accessory.reduce((n, p) => n + p.markets.length, 0);

  const live = data.stats.liveCount;
  const blocked = data.stats.blockedCount;

  return (
    <div
      className={cn(
        "inline-flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2 text-xs",
        blocked > 0 && live === 0
          ? "border-red-500/30 bg-red-500/10 text-red-300"
          : blocked > 0
            ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
      )}
    >
      {scraping ? (
        <span className="font-medium text-pokemon-yellow">Scraping in corso…</span>
      ) : (
        <>
          <span>
            Snapshot ·{" "}
            {ageMin < 1 ? "adesso" : ageMin < 60 ? `${ageMin} min fa` : formatDate(data.lastUpdated.split("T")[0])}
          </span>
          <span className="text-zinc-500">·</span>
          <span>
            {live}/{totalQuotes} live
          </span>
          {blocked > 0 && (
            <>
              <span className="text-zinc-500">·</span>
              <span>{blocked} bloccati</span>
            </>
          )}
          <span className="text-zinc-500">·</span>
          <span className="capitalize">{data.dataSource}</span>
        </>
      )}
    </div>
  );
}
