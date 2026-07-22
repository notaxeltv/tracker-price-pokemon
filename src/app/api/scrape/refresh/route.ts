import { NextResponse } from "next/server";
import { clearScraperCache } from "@/lib/scrapers/cache";
import { fetchDashboardData } from "@/lib/data-service";

/** Forza refresh scrape (invalida cache) */
export async function POST() {
  clearScraperCache();
  const data = await fetchDashboardData();
  return NextResponse.json({
    ok: true,
    message: "Cache scraper invalidata, dati aggiornati",
    liveCount: data.stats.liveCount,
    blockedCount: data.stats.blockedCount,
    dataSource: data.dataSource,
  });
}
