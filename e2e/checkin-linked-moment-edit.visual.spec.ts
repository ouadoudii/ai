import { expect, test, type Page } from '@playwright/test';

const MOMENTS_KEY = 'nimmapp_moments_v1';
const CHECKINS_KEY = 'nimmapp_checkins_v1';

async function prepare(page: Page, viewport: { width: number; height: number }) {
  await page.setViewportSize(viewport);
  await page.addInitScript(({ momentsKey, checkInsKey }) => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const checkInId = 'linked-checkin';
    localStorage.setItem('rhythm_language_v1', 'en');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    localStorage.setItem('rhythm_intro_profile_v1', '{}');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    localStorage.setItem(checkInsKey, JSON.stringify([{
      id: checkInId,
      date,
      time: '12:30',
      timeOfDay: 'midday',
      sleep: { durationHours: 7.5, quality: 4 },
      food: { mealTitle: 'Couscous', category: 'lunch', hungerBefore: 4, fullnessAfter: 3 },
      wellbeing: { energyLevel: 2, stressLevel: 4, waterGlasses: 1, mood: 'satisfied', note: 'old note', voiceTranscription: 'original voice' },
      createdAt: now.getTime(),
    }]));
    localStorage.setItem(momentsKey, JSON.stringify([{
      id: 'linked-meal',
      title: 'Couscous',
      label: 'Lunch',
      category: 'lunch',
      date,
      time: '12:30',
      location: 'Home',
      locationCategory: 'home',
      imageUrl: '',
      mood: 'satisfied',
      hungerLevel: 4,
      fullnessLevel: 3,
      notes: 'old note',
      tags: ['midday', `source-checkin:${checkInId}`],
      createdAt: now.getTime(),
    }]));
  }, { momentsKey: MOMENTS_KEY, checkInsKey: CHECKINS_KEY });
  await page.goto('/');
}

for (const viewport of [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
] as const) test(`editing a linked timeline meal reconciles its source check-in on ${viewport.name}`, async ({ page }, testInfo) => {
  await prepare(page, viewport);
  await page.getByText('Couscous', { exact: true }).first().click();
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('button', { name: 'Remove' }).click();
  const title = page.locator('input[autocomplete="off"]');
  await title.fill('سلطة Salat');
  await title.press('Enter');
  const note = page.locator('textarea');
  await note.fill('corrected mixed-script note');
  await page.getByRole('button', { name: 'Save changes' }).click();

  await expect.poll(() => page.evaluate(({ momentsKey, checkInsKey }) => {
    const moment = JSON.parse(localStorage.getItem(momentsKey) || '[]')[0];
    const checkIn = JSON.parse(localStorage.getItem(checkInsKey) || '[]')[0];
    return {
      momentTitle: moment?.title,
      checkInTitle: checkIn?.food?.mealTitle,
      note: checkIn?.wellbeing?.note,
      energy: checkIn?.wellbeing?.energyLevel,
      stress: checkIn?.wellbeing?.stressLevel,
      sleep: checkIn?.sleep?.durationHours,
    };
  }, { momentsKey: MOMENTS_KEY, checkInsKey: CHECKINS_KEY })).toEqual({
    momentTitle: 'سلطة Salat',
    checkInTitle: 'سلطة Salat',
    note: 'corrected mixed-script note',
    energy: 2,
    stress: 4,
    sleep: 7.5,
  });

  await page.reload();
  await expect.poll(() => page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '[]')[0]?.food?.mealTitle, CHECKINS_KEY))
    .toBe('سلطة Salat');
  await page.screenshot({ path: testInfo.outputPath(`linked-checkin-edit-${viewport.name}.png`), fullPage: true });
});
