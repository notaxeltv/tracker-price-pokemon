import { defineConfig, devices } from "@playwright/test";
import path from "path";

const fixture = (name: string) => path.join(process.cwd(), "tests", "fixtures", name);

const e2ePort = process.env.PLAYWRIGHT_PORT ?? "3001";

const e2eEnv = {
  ...process.env,
  PORT: e2ePort,
  CARDTRADER_API_TOKEN: "",
  SCRAPE_SNAPSHOT_PATH: fixture("scrape-snapshot.min.json"),
  PORTFOLIO_PATH: fixture("portfolio.empty.json"),
  USER_CATALOG_PATH: fixture("user-catalog.empty.json"),
  ALERT_STATE_PATH: fixture("alert-state.empty.json"),
};

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${e2ePort}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run build && npm run start:prepare && cd .next/standalone && node server.js",
        url: `http://localhost:${e2ePort}`,
        reuseExistingServer: false,
        timeout: 180000,
        env: e2eEnv,
        cwd: process.cwd(),
      },
});
