import { expect, test } from "@playwright/test";

type LegacyLanguage = "en" | "fr" | "de" | "ar";

async function seedReturningGuest(page: any, language: LegacyLanguage) {
  await page.addInitScript(
    ({ language }) => {
      localStorage.setItem("rhythm_language_v1", language);
      localStorage.setItem("cary_access_mode_v1", "guest");
      localStorage.setItem("cary_onboarding_v2_complete", "true");
      localStorage.setItem("nimmapp_moments_v1", "[]");
      localStorage.setItem("nimmapp_checkins_v1", "[]");
      sessionStorage.setItem("nimmapp_checkin_auto_opened", "true");
    },
    { language },
  );
}

for (const legacyLanguage of ["en", "fr", "de", "ar"] as const) {
  test(`legacy ${legacyLanguage} exposes no language menu and keeps direct data export`, async ({
    page,
  }) => {
    await seedReturningGuest(page, legacyLanguage);
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByTestId("language-picker-opener")).toHaveCount(0);
    await expect(page.locator("[data-language-option]")).toHaveCount(0);
    await expect(page.getByRole("dialog", { name: "اختر اللغة" })).toHaveCount(
      0,
    );
    await expect(page.getByText("English", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Deutsch", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Français", { exact: true })).toHaveCount(0);
    await expect(
      page.getByTestId("personal-data-export").filter({ visible: true }),
    ).toHaveCount(1);
    await expect(
      page.getByTestId("personal-data-export").filter({ visible: true }),
    ).toHaveAccessibleName("تصدير بياناتي");

    // Reading a historical preference must not erase user data or expose its old UI.
    await expect
      .poll(() =>
        page.evaluate(() => localStorage.getItem("rhythm_language_v1")),
      )
      .toBe(legacyLanguage);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.getByTestId("language-picker-opener")).toHaveCount(0);
  });
}

test("mobile and desktop retain an accessible Arabic data-export control", async ({
  page,
}) => {
  await seedReturningGuest(page, "fr");
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1280, height: 800 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const exportButton = page
      .getByTestId("personal-data-export")
      .filter({ visible: true });
    await expect(exportButton).toHaveCount(1);
    await expect(exportButton).toHaveAccessibleName("تصدير بياناتي");
    await expect(page.locator("[data-language-option]")).toHaveCount(0);
  }
});
