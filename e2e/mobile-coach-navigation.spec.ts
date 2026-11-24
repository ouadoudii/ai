import { test, expect } from "@playwright/test";

// These navigation regressions start as a returning local-device user. Dedicated
// account-gate and onboarding specs exercise first-run choices independently.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("cary_access_mode_v1", "guest");
    localStorage.setItem("cary_onboarding_v2_complete", "true");
  });
});

test("Arabic mobile navigation reaches Coach without changing viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: /.+/ }).filter({
    has: page.getByTestId("mobile-bottom-coach-nav"),
  });
  const coach = page.getByTestId("mobile-bottom-coach-nav");
  await expect(nav).toBeVisible();
  await expect(coach).toBeVisible();
  await expect(coach).toHaveAccessibleName(/[\u0600-\u06FF]+/);
  await coach.click();
  await expect(coach).toHaveAttribute("aria-current", "page");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  expect(page.viewportSize()).toEqual({ width: 390, height: 844 });
  await expect(page.getByTestId("mobile-moments-nav")).toBeVisible();
  await expect(page.getByTestId("primary-capture-button")).toBeVisible();
});

test("Desktop Coach navigation remains available", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const coach = page.getByTestId("desktop-coach-nav");
  await expect(coach).toBeVisible();
  await coach.click();
  await expect(coach).toHaveAttribute("aria-current", "page");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
});
