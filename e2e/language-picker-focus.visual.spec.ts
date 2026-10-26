import { expect, test } from "@playwright/test";

async function seedReturningGuest(page: any) {
  await page.addInitScript(() => {
    localStorage.setItem("rhythm_language_v1", "fr");
    localStorage.setItem("cary_access_mode_v1", "guest");
    localStorage.setItem("cary_onboarding_v2_complete", "true");
    localStorage.setItem("nimmapp_moments_v1", "[]");
    localStorage.setItem("nimmapp_checkins_v1", "[]");
    sessionStorage.setItem("nimmapp_checkin_auto_opened", "true");
  });
}

for (const viewport of [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile", width: 390, height: 844 },
]) {
  test(`Arabic-only navigation has no language focus target on ${viewport.name}`, async ({
    page,
  }) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await seedReturningGuest(page);
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.getByTestId("language-picker-opener")).toHaveCount(0);
    await expect(page.locator("[data-language-option]")).toHaveCount(0);
    const exportButton = page
      .getByTestId("personal-data-export")
      .filter({ visible: true });
    await expect(exportButton).toHaveCount(1);
    await exportButton.focus();
    await expect(exportButton).toBeFocused();
    await page.screenshot({
      path: `test-results/arabic-only-navigation-${viewport.name}.png`,
      fullPage: true,
    });
  });
}
