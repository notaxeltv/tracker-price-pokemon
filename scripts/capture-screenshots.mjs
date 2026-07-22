import { chromium } from "playwright";

const baseUrl = "http://localhost:3000";
const outDir = "/opt/cursor/artifacts/screenshots";

async function capture() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  await page.screenshot({
    path: `${outDir}/dashboard-header.png`,
    fullPage: false,
  });

  await page.screenshot({
    path: `${outDir}/dashboard-full.png`,
    fullPage: true,
  });

  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(500);
  await page.screenshot({
    path: `${outDir}/dashboard-sealed-table.png`,
    fullPage: false,
  });

  await page.evaluate(() => window.scrollTo(0, 1400));
  await page.waitForTimeout(500);
  await page.screenshot({
    path: `${outDir}/dashboard-graded-cards.png`,
    fullPage: false,
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: `${outDir}/dashboard-mobile.png`,
    fullPage: true,
  });

  await browser.close();
  console.log("Screenshots saved to", outDir);
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
