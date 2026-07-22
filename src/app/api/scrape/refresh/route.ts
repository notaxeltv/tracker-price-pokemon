import { NextResponse } from "next/server";
import { clearScraperCache } from "@/lib/scrapers/cache";
import { isSnapshotFresh, loadSnapshot } from "@/lib/scrapers/snapshot";
import { refreshSnapshot } from "@/lib/data-service";

function minIntervalSeconds(): number {
  return parseInt(process.env.SCRAPE_MIN_INTERVAL ?? "300", 10);
}

/** Scrape on-demand — eseguito aprendo la dashboard o cliccando Aggiorna */
export async function POST(request: Request) {
  const force =
    new URL(request.url).searchParams.get("force") === "1" ||
    request.headers.get("x-force-refresh") === "1";

  if (process.env.SCRAPE_ON_DEMAND === "false" && !force) {
    const snap = await loadSnapshot();
    if (snap) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        message: "SCRAPE_ON_DEMAND=false — snapshot esistente",
        liveCount: snap.stats.liveCount,
        blockedCount: snap.stats.blockedCount,
        dataSource: "snapshot",
        lastUpdated: snap.lastUpdated,
      });
    }
  }

  if (!force) {
    const snap = await loadSnapshot();
    if (snap && isSnapshotFresh(snap, minIntervalSeconds())) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        message: `Snapshot recente (< ${minIntervalSeconds()}s) — nessuno scrape`,
        liveCount: snap.stats.liveCount,
        blockedCount: snap.stats.blockedCount,
        dataSource: snap.dataSource,
        lastUpdated: snap.lastUpdated,
      });
    }
  }

  clearScraperCache();
  const data = await refreshSnapshot();
  return NextResponse.json({
    ok: true,
    skipped: false,
    message: "Prezzi aggiornati (Cardmarket + eBay EU)",
    liveCount: data.stats.liveCount,
    blockedCount: data.stats.blockedCount,
    dataSource: data.dataSource,
    lastUpdated: data.lastUpdated,
  });
}
