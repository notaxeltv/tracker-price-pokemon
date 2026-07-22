import { test, expect } from "@playwright/test";

test.describe("Dashboard Pokémon Price Tracker", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/scrape/refresh**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ skipped: true, message: "E2E mock", liveCount: 2 }),
      });
    });
  });

  test("carica la home e mostra le tre viste", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Pokémon Price Tracker/i })).toBeVisible({
      timeout: 30000,
    });
    const nav = page.locator("nav");
    await expect(nav.getByRole("button", { name: /^Panoramica/i })).toBeVisible();
    await expect(nav.getByRole("button", { name: /^Mercato/i })).toBeVisible();
    await expect(nav.getByRole("button", { name: /^Portfolio/i })).toBeVisible();
  });

  test("naviga tra Panoramica, Mercato e Portfolio", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Pokémon Price Tracker/i })).toBeVisible({
      timeout: 30000,
    });
    const nav = page.locator("nav");
    await nav.getByRole("button", { name: /^Mercato/i }).click();
    await expect(page.locator(".btn-tab-active, .btn-tab-inactive").filter({ hasText: /^Sealed/i }).first()).toBeVisible();
    await nav.getByRole("button", { name: /^Portfolio/i }).click();
    await nav.getByRole("button", { name: /^Panoramica/i }).click();
    await expect(page.getByText(/Mercato EU/i)).toBeVisible();
  });

  test("toggle tema chiaro/scuro", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Pokémon Price Tracker/i })).toBeVisible({
      timeout: 30000,
    });
    await page.getByRole("button", { name: /Cambia tema/i }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.getByRole("button", { name: /Cambia tema/i }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });
});
