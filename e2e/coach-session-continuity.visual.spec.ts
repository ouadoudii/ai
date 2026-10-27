import { expect, test } from "@playwright/test";

const profile = {
  summary: "I want to understand my rhythm.",
  priorities: [],
  preferences: [],
  rawIntro: "I want to understand my rhythm.",
  confirmedAt: Date.now(),
  firstPlan: {
    title: "Observe your rhythm",
    rationale: "Notice what repeats.",
    focusAreas: [],
    firstStep: "Capture your next midday check-in.",
    phase: "midday",
  },
};

const prepare = async (page: any) => {
  await page.addInitScript((profile) => {
    localStorage.setItem("rhythm_language_v1", "de");
    localStorage.setItem("cary_access_mode_v1", "guest");
    localStorage.setItem("cary_onboarding_v2_complete", "true");
    localStorage.setItem("rhythm_voice_entry_seen_v1", "true");
    localStorage.setItem("rhythm_intro_profile_v1", JSON.stringify(profile));
    localStorage.setItem("nimmapp_moments_v1", "[]");
    localStorage.setItem("nimmapp_checkins_v1", "[]");
    sessionStorage.setItem("nimmapp_checkin_auto_opened", "true");
  }, profile);
};

test("Coach keeps a conversation after Arabic navigation and reload", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await prepare(page);
  await page.route("**/api/**", (route) => route.abort());
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByTestId("desktop-coach-nav")).toHaveText("المرشد");
  await page.getByTestId("desktop-coach-nav").click();
  await expect(
    page.getByRole("heading", { name: "اسأل المرشد" }),
  ).toBeVisible();

  const question = "Merke dir bitte meinen heutigen Spaziergang.";
  await page.getByPlaceholder(/اسأل عن وجباتك/).fill(question);
  await page.getByRole("button", { name: /إرسال/ }).click();
  await expect(page.getByText(question, { exact: true })).toBeVisible();
  await expect
    .poll(async () =>
      page.evaluate((question) => {
        const messages = JSON.parse(
          localStorage.getItem("moment.coach.session.v1") || "[]",
        );
        return messages.some(
          (message: any) =>
            message.sender === "user" && message.text === question,
        );
      }, question),
    )
    .toBe(true);

  await page.getByRole("button", { name: "اليوم", exact: true }).click();
  await expect(page.getByTestId("voice-home-mic")).toBeVisible();
  await page.getByTestId("desktop-coach-nav").click();
  await expect(page.getByText(question, { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.getByTestId("desktop-coach-nav").click();
  await expect(page.getByText(question, { exact: true })).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("coach-session-restored-desktop.png"),
    fullPage: true,
  });
});

test("Coach is reachable from the Arabic mobile app shell", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await prepare(page);
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  const coach = page.getByTestId("mobile-coach-nav");
  await expect(coach).toBeVisible();
  await expect(coach).toHaveText("المرشد");
  await coach.click();
  await expect(
    page.getByRole("heading", { name: "اسأل المرشد" }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("coach-mobile-entry.png"),
    fullPage: true,
  });
});
