import { expect, test } from '@playwright/test';

test('morning check-in saves only explicitly answered sleep fields', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'de');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    localStorage.setItem('nimmapp_moments_v1', '[]');
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify({
      summary: 'Profile', priorities: ['sleep'], preferences: ['simple'], rawIntro: 'Morning rhythm', confirmedAt: Date.now(),
      firstPlan: { title: 'Plan', rationale: 'Rationale', focusAreas: ['sleep'], firstStep: 'Check in', phase: 'morning' }
    }));
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  });

  await page.goto('/');
  await page.getByTestId('personal-plan-start').click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Schlafen gegangen').fill('22:30');
  await dialog.getByRole('button', { name: 'Noch ein Schritt', exact: true }).click();
  await dialog.getByRole('button', { name: 'Fertig', exact: true }).click();

  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('nimmapp_checkins_v1') || '[]').length)).toBe(1);
  const sleep = await page.evaluate(() => JSON.parse(localStorage.getItem('nimmapp_checkins_v1') || '[]')[0]?.sleep);
  expect(sleep).toEqual({ bedtime: '22:30' });
  await page.screenshot({ path: testInfo.outputPath('daily-checkin-explicit-sleep.png'), fullPage: true });
});