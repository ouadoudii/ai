import { expect, test } from "@playwright/test";

const moments = [
  {
    id: "late-lunch-a",
    title: "Lunch A",
    category: "lunch",
    date: "2026-09-21",
    time: "14:15",
    createdAt: 1,
  },
  {
    id: "evening-snack-a",
    title: "Snack A",
    category: "snack",
    date: "2026-09-21",
    time: "19:00",
    createdAt: 2,
  },
  {
    id: "late-lunch-b",
    title: "Lunch B",
    category: "lunch",
    date: "2026-09-22",
    time: "14:30",
    createdAt: 3,
  },
  {
    id: "evening-snack-b",
    title: "Snack B",
    category: "snack",
    date: "2026-09-22",
    time: "20:00",
    createdAt: 4,
  },
  {
    id: "late-lunch-c",
    title: "Lunch C",
    category: "lunch",
    date: "2026-09-23",
    time: "15:00",
    createdAt: 5,
  },
];

const legacyLanguages = ["en", "de", "fr", "ar"] as const;
const arabic = {
  title: "الغداء المتأخر والوجبات الخفيفة مساءً",
  evidence: "في 2 من 3 أيام",
  experiment: "الغداء أبكر",
};
const legacyTitles = [
  "Late lunch ↔ evening snacking",
  "Spätes Mittagessen und Snacks am Abend",
  "Déjeuner tardif et grignotage le soir",
];

for (const layout of [
  { name: "desktop", width: 1280, height: 900 },
  { name: "mobile", width: 390, height: 844 },
]) {
  test(`late-lunch pattern retains evidence and experiment for all legacy locales on ${layout.name}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: layout.width, height: layout.height });
    await page.addInitScript(
      ({ seedMoments }) => {
        if (!localStorage.getItem("rhythm_language_v1")) {
          localStorage.setItem("rhythm_language_v1", "en");
        }
        localStorage.setItem("cary_access_mode_v1", "guest");
        localStorage.setItem("cary_onboarding_v2_complete", "true");
        localStorage.setItem("rhythm_voice_entry_seen_v1", "true");
        localStorage.setItem(
          "rhythm_intro_profile_v1",
          JSON.stringify({
            summary: "Track my rhythm.",
            priorities: [],
            preferences: [],
            rawIntro: "Track my rhythm.",
            confirmedAt: Date.now(),
            firstPlan: {
              title: "Observe",
              rationale: "Notice patterns.",
              focusAreas: [],
              firstStep: "Capture the next check-in.",
              phase: "midday",
            },
          }),
        );
        localStorage.setItem("nimmapp_moments_v1", JSON.stringify(seedMoments));
        localStorage.setItem("nimmapp_checkins_v1", "[]");
        sessionStorage.setItem("nimmapp_checkin_auto_opened", "true");
      },
      { seedMoments: moments },
    );

    const assertPattern = async () => {
      await expect(page.locator("html")).toHaveAttribute("lang", "ar");
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      const card = page.locator('[data-pattern-id="late-lunch-snacking"]');
      await expect(
        card.getByRole("heading", { name: arabic.title, exact: true }),
      ).toBeVisible();
      await expect(card.getByTestId("pattern-evidence")).toContainText(
        arabic.evidence,
      );
      await expect(card.getByTestId("pattern-experiment")).toContainText(
        arabic.experiment,
      );
      for (const title of legacyTitles)
        await expect(
          page.getByRole("heading", { name: title, exact: true }),
        ).toHaveCount(0);
      expect(
        await page.evaluate(() =>
          JSON.parse(localStorage.getItem("nimmapp_moments_v1") || "[]"),
        ),
      ).toEqual(moments);
    };
    await page.goto("/");
    for (const language of legacyLanguages) {
      await page.evaluate(
        (language) => localStorage.setItem("rhythm_language_v1", language),
        language,
      );
      await page.reload();
      await page
        .getByRole("button", { name: "اكتشافاتك", exact: true })
        .click();
      await assertPattern();
      await expect(page.getByTestId("language-picker-opener")).toHaveCount(0);
      await expect(page.locator("[data-language-option]")).toHaveCount(0);
      await expect(
        page.getByTestId("personal-data-export").filter({ visible: true }),
      ).toHaveCount(1);
      await assertPattern();
      await page.screenshot({
        path: testInfo.outputPath(
          `late-lunch-pattern-${layout.name}-${language}.png`,
        ),
        fullPage: true,
      });
    }
    await page.reload();
    await page.getByRole("button", { name: "اكتشافاتك", exact: true }).click();
    await assertPattern();
  });
}
