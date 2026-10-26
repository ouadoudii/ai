import { expect, test } from "@playwright/test";

type LegacyLanguage = "en" | "ar" | "de" | "fr";

const legacyLanguages: LegacyLanguage[] = ["en", "ar", "de", "fr"];

const arabic = {
  today: "اليوم",
  discoveries: "اكتشافاتك",
  moments: "لحظاتي",
  desktopMoments: "لحظات",
  homeHeading: "مرحباً بك 👋",
  captureDay: "سجّل يومك",
  captureAction: "سجّل لحظة",
  recentMoments: "لحظاتك الأخيرة",
  captureTitle: "ما اللحظة التي تريد تسجيلها؟",
  photo: "صورة",
  speak: "احكِ لي",
  foodLabel: "الطعام",
  foodTitle: "ماذا أكلت؟",
  mealPlaceholder: "ابدأ بالكتابة… مثلاً طاجين",
  chooseByPicture: "اختر بالصورة",
  pictureHelp: "أو ابدأ بالكتابة لتضييق الاختيارات",
  photoSection: "الصورة",
  addPhoto: "أضف صورتك",
  addNote: "أضف ملاحظة",
  saveMeal: "حفظ الوجبة",
  footer: "اكتب القليل فقط — سنساعدك في الباقي.",
  close: "إغلاق",
};

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

for (const legacyLanguage of legacyLanguages) {
  test(`legacy ${legacyLanguage} keeps the full food flow in Arabic`, async ({
    page,
  }, testInfo) => {
    await seedReturningGuest(page, legacyLanguage);
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(
      page.getByRole("heading", { name: arabic.homeHeading, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(arabic.captureDay, { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: arabic.recentMoments, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: arabic.discoveries, exact: true }),
    ).toBeVisible();
    if (testInfo.project.name === "android-arabic") {
      await expect(page.getByTestId("mobile-moments-nav")).toBeVisible();
      await expect(page.getByTestId("personal-data-export")).toBeVisible();
    } else {
      await expect(
        page
          .getByRole("navigation")
          .getByRole("button", { name: arabic.desktopMoments, exact: true }),
      ).toBeVisible();
      await expect(page.getByTestId("personal-data-export")).toBeVisible();
    }
    await expect(
      page
        .getByRole("button", { name: arabic.today, exact: true })
        .filter({ visible: true })
        .first(),
    ).toBeVisible();
    await expect(page.getByTestId("language-picker-opener")).toHaveCount(0);
    await expect(page.locator("[data-language-option]")).toHaveCount(0);
    // The capture CTA must remain actionable on both desktop and mobile.
    await expect(
      page
        .getByRole("button", { name: arabic.captureAction, exact: true })
        .filter({ visible: true })
        .first(),
    ).toBeEnabled();

    await page
      .getByRole("button", { name: arabic.captureAction, exact: true })
      .filter({ visible: true })
      .first()
      .click();
    await expect(
      page.getByRole("heading", { name: arabic.captureTitle, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: arabic.photo, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: arabic.speak, exact: true }),
    ).toBeVisible();

    await page.getByRole("button", { name: arabic.photo, exact: true }).click();
    await expect(
      page.getByText(arabic.foodLabel, { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: arabic.foodTitle, exact: true }),
    ).toBeVisible();
    await expect(page.getByPlaceholder(arabic.mealPlaceholder)).toBeVisible();
    await expect(
      page.getByText(arabic.chooseByPicture, { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(arabic.pictureHelp, { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(arabic.photoSection, { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(arabic.addPhoto, { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: arabic.addNote, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: arabic.saveMeal, exact: true }),
    ).toBeVisible();
    await expect(page.getByText(arabic.footer, { exact: true })).toBeVisible();
    await expect(
      page.getByRole("button", { name: arabic.close, exact: true }),
    ).toBeVisible();
  });
}

test("Arabic-only language contract survives reload for every legacy locale", async ({
  page,
}) => {
  for (const legacyLanguage of legacyLanguages) {
    await seedReturningGuest(page, legacyLanguage);
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(
      page.getByRole("heading", { name: arabic.homeHeading, exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(
      page.getByRole("heading", { name: arabic.homeHeading, exact: true }),
    ).toBeVisible();
  }
});
