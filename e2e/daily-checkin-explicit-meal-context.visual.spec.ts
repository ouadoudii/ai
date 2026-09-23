import { expect, test } from '@playwright/test';

test('daily check-in does not invent untouched meal context', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'de');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    localStorage.setItem('nimmapp_moments_v1', '[]');
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify({
      summary: 'Profile', priorities: ['meal'], preferences: ['simple'], rawIntro: 'Midday rhythm', confirmedAt: Date.now(),
      firstPlan: { title: 'Plan', rationale: 'Rationale', focusAreas: ['meal'], firstStep: 'Check in', phase: 'midday' }
    }));
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  });

  await page.goto('/');
  await page.getByTestId('personal-plan-start').click();
  const dialog = page.getByRole('dialog');
  const mealInput = dialog.getByPlaceholder('What did you eat? Search or type…');
  await mealInput.fill('Loop A meal');
  await mealInput.press('Enter');
  await dialog.getByRole('button', { name: 'Noch ein Schritt', exact: true }).click();
  await dialog.getByRole('button', { name: 'Fertig', exact: true }).click();

  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('nimmapp_checkins_v1') || '[]').length)).toBe(1);
  const food = await page.evaluate(() => JSON.parse(localStorage.getItem('nimmapp_checkins_v1') || '[]')[0]?.food);
  expect(food.mealTitle).toBe('Loop A meal');
  expect(food).not.toHaveProperty('hungerBefore');
  expect(food).not.toHaveProperty('fullnessAfter');
  expect(food).not.toHaveProperty('eatingPace');
  expect(food).not.toHaveProperty('distraction');
  await page.screenshot({ path: testInfo.outputPath('daily-checkin-explicit-meal-context.png'), fullPage: true });
});
