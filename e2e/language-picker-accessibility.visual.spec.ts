import { expect, test } from "@playwright/test";

async function seedReturningGuest(page: any) {
  await page.addInitScript(() => {
    localStorage.setItem("rhythm_language_v1", "en");
    localStorage.setItem("cary_access_mode_v1", "guest");
    localStorage.setItem("cary_onboarding_v2_complete", "true");
    localStorage.setItem("nimmapp_moments_v1", "[]");
    localStorage.setItem("nimmapp_checkins_v1", "[]");
    sessionStorage.setItem("nimmapp_checkin_auto_opened", "true");
  });
}

test("Arabic-only shell removes the language dialog without losing accessible data export", async ({
  page,
}) => {
  await seedReturningGuest(page);
  await page.goto("/");

  await expect(page.getByTestId("language-picker-opener")).toHaveCount(0);
  await expect(page.locator("[data-language-option]")).toHaveCount(0);
  await expect(page.getByRole("dialog", { name: "اختر اللغة" })).toHaveCount(0);
  const exportButton = page
    .getByTestId("personal-data-export")
    .filter({ visible: true });
  await expect(exportButton).toHaveCount(1);
  await expect(exportButton).toHaveAccessibleName("تصدير بياناتي");
  await exportButton.focus();
  await expect(exportButton).toBeFocused();
  await page.screenshot({
    path: "test-results/arabic-only-export-accessibility.png",
    fullPage: true,
  });
});
