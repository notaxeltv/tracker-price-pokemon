#!/usr/bin/env npx tsx
/**
 * Cron locale — esegui periodicamente per aggiornare data/scrape-snapshot.json
 *
 * Uso:
 *   npm run scrape
 *   SCRAPE_USE_PLAYWRIGHT=true npm run scrape
 *
 * Crontab esempio (ogni 6 ore):
 *   0 0,6,12,18 * * * cd /path/to/tracker && SCRAPE_USE_PLAYWRIGHT=true npm run scrape
 */

import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

process.env.SCRAPE_USE_SNAPSHOT = "false";

if (process.env.SCRAPE_USE_PLAYWRIGHT == null) {
  process.env.SCRAPE_USE_PLAYWRIGHT = "true";
}

async function main() {
  const { clearScraperCache } = await import("../src/lib/scrapers/cache");
  const { refreshSnapshot } = await import("../src/lib/dashboard-builder");

  console.log("[scrape-cron] Avvio scrape…");
  console.log(`  Playwright: ${process.env.SCRAPE_USE_PLAYWRIGHT}`);
  console.log(`  Snapshot:   ${process.env.SCRAPE_SNAPSHOT_PATH ?? "data/scrape-snapshot.json"}`);

  clearScraperCache();
  const data = await refreshSnapshot();

  console.log("[scrape-cron] Completato");
  console.log(
    JSON.stringify(
      {
        ok: true,
        lastUpdated: data.lastUpdated,
        dataSource: data.dataSource,
        liveCount: data.stats.liveCount,
        blockedCount: data.stats.blockedCount,
        totalProducts: data.stats.totalProducts,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error("[scrape-cron] Errore:", err);
  process.exit(1);
});
