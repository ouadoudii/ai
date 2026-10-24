import { expect, test, type Page } from "@playwright/test";

const existingCheckIn = {
  id: "existing-midday",
  date: "",
  time: "12:35",
  timeOfDay: "midday",
  food: {
    mealTitle: "Harira + خبز",
    category: "lunch",
    hungerBefore: 2,
    fullnessAfter: 5,
    eatingPace: "slow",
    distraction: "screen",
  },
  wellbeing: {
    energyLevel: 4,
    mood: "energized",
    stressLevel: 2,
    note: "keep this note",
  },
  coachSummary: "Existing summary",
  createdAt: 1,
};

async function seedExistingCheckIn(page: Page) {
  await page.goto("/");
  const localMidday = await page.evaluate(() => {
    const value = new Date();
    value.setHours(13, 0, 0, 0);
    return value.getTime();
  });
  await page.clock.setFixedTime(localMidday);
  await page.evaluate((seed) => {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const checkIn = { ...seed, date };
    localStorage.setItem("rhythm_language_v1", "en");
    localStorage.setItem("cary_access_mode_v1", "guest");
    localStorage.setItem("cary_onboarding_v2_complete", "true");
    localStorage.setItem("rhythm_voice_entry_seen_v1", "true");
    localStorage.setItem("nimmapp_checkins_v1", JSON.stringify([checkIn]));
    localStorage.setItem(
      "nimmapp_moments_v1",
      JSON.stringify([
        {
          id: "old-linked-meal",
          title: checkIn.food.mealTitle,
          label: "Lunch",
          category: "lunch",
          date,
          time: checkIn.time,
          location: "Home",
          locationCategory: "home",
          imageUrl: "",
          mood: "energized",
          tags: ["source-checkin:existing-midday"],
          createdAt: 1,
        },
      ]),
    );
    sessionStorage.setItem("nimmapp_checkin_auto_opened", "true");
  }, existingCheckIn);
  await page.reload();
}

for (const viewport of [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1280, height: 900 },
]) {
  test(`completed check-in remains editable and preserves untouched data on ${viewport.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    await seedExistingCheckIn(page);

    const phaseCard = page.getByTestId("today-phase-midday");
    await expect(phaseCard).toHaveAttribute("data-completed", "true");
    await expect(phaseCard).toContainText("راجع أو عدّل");
    await phaseCard.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toContainText("راجع وعدّل");
    await expect(dialog).toContainText("Harira + خبز");
    await expect(dialog.getByRole("slider", { name: "قبل الأكل، كم كان جوعك؟" })).toHaveValue("2");
    await expect(dialog.getByRole("slider", { name: "وبعدها، كم شعرت بالشبع؟" })).toHaveValue("5");

    await dialog.getByRole("button", { name: "خطوة أخيرة" }).click();
    const energy = dialog.getByRole("slider", { name: "كيف طاقتك الآن؟" });
    await expect(energy).toHaveValue("4");
    await energy.fill("5");
    await dialog.getByRole("button", { name: "حفظ التعديلات" }).click();

    await expect(dialog).toHaveCount(0);
    const stored = await page.evaluate(() => ({
      checkIns: JSON.parse(localStorage.getItem("nimmapp_checkins_v1") || "[]"),
      moments: JSON.parse(localStorage.getItem("nimmapp_moments_v1") || "[]"),
    }));
    expect(stored.checkIns).toHaveLength(1);
    expect(stored.checkIns[0].food).toMatchObject({
      mealTitle: "Harira + خبز",
      hungerBefore: 2,
      fullnessAfter: 5,
      eatingPace: "slow",
      distraction: "screen",
    });
    expect(stored.checkIns[0].wellbeing).toMatchObject({
      energyLevel: 5,
      mood: "energized",
      stressLevel: 2,
      note: "keep this note",
    });
    expect(stored.moments).toHaveLength(1);
    expect(stored.moments[0].title).toBe("Harira + خبز");
    expect(stored.moments[0].tags).not.toContain("source-checkin:existing-midday");

    await page.screenshot({
      path: testInfo.outputPath(`completed-checkin-edited-${viewport.name}.png`),
      fullPage: true,
    });
  });
}
