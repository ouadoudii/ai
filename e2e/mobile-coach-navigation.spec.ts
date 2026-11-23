import { test, expect } from "@playwright/test";

test("Arabic mobile navigation reaches Coach without changing viewport", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "android-arabic", "Native mobile navigation journey");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: /.+/ }).filter({
    has: page.getByTestId("mobile-coach-nav"),
  });
  const coach = page.getByTestId("mobile-coach-nav");
  await expect(nav).toBeVisible();
  await expect(coach).toBeVisible();
  await expect(coach).toHaveAccessibleName(/مدرب|مرشد|مرافق|كوتش|نصيح/);
  await coach.click();
  await expect(coach).toHaveAttribute("aria-current", "page");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  expect(page.viewportSize()).toEqual({ width: 390, height: 844 });
  await expect(page.getByTestId("mobile-moments-nav")).toBeVisible();
  await expect(page.getByTestId("primary-capture-button")).toBeVisible();
});

test("Desktop Coach navigation remains available", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-arabic", "Desktop navigation regression");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const coach = page.getByTestId("desktop-coach-nav");
  await expect(coach).toBeVisible();
  await coach.click();
  await expect(coach).toHaveAttribute("aria-current", "page");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
});
