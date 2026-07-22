import { NextResponse } from "next/server";
import { clearScraperCache } from "@/lib/scrapers/cache";
import { refreshSnapshot } from "@/lib/data-service";

/** Forza refresh scrape (invalida cache + aggiorna snapshot JSON) */
export async function POST() {
  clearScraperCache();
  const data = await refreshSnapshot();
  return NextResponse.json({
    ok: true,
    message: "Snapshot aggiornato con scrape fresh + merge history",
    liveCount: data.stats.liveCount,
    blockedCount: data.stats.blockedCount,
    dataSource: data.dataSource,
    lastUpdated: data.lastUpdated,
  });
}
