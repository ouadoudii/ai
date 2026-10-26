import { expect, test } from '@playwright/test';

for (const device of [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1280, height: 900 },
] as const) {
  test(`late-night catch-up saves the previous evening on ${device.name}`, async ({ page }) => {
    await page.setViewportSize({ width: device.width, height: device.height });
    await page.addInitScript(() => {
      localStorage.setItem('rhythm_language_v1', 'en');
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
      localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify({
        summary: 'Returning user', priorities: [], preferences: [], rawIntro: 'Returning user', confirmedAt: 1,
        firstPlan: { title: 'Notice your day', rationale: 'Learn your rhythm', focusAreas: [], firstStep: 'Check in', phase: 'midday' },
      }));
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    });

    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    const localTimestamp = await page.evaluate(() => new Date(2026, 9, 16, 2, 0, 0, 0).getTime());
    await page.clock.setFixedTime(localTimestamp);
    const previousDate = await page.evaluate(() => {
      const value = new Date();
      value.setDate(value.getDate() - 1);
      return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
    });
    await page.evaluate(date => {
      localStorage.setItem('nimmapp_checkins_v1', JSON.stringify([
        { id: 'user-morning', date, time: '08:00', timeOfDay: 'morning', wellbeing: {}, createdAt: 1 },
        { id: 'user-midday', date, time: '13:00', timeOfDay: 'midday', wellbeing: {}, createdAt: 2 },
      ]));
    }, previousDate);
    await page.reload();

    const catchUp = page.getByTestId('late-night-evening-catch-up');
    await expect(catchUp).toBeVisible();
    await expect(catchUp).toHaveAttribute('data-target-date', previousDate);
    await expect(catchUp).toContainText('كمّل عشاء البارح');
    await catchUp.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('مساؤك');
    await expect(dialog).toContainText('كيف كان يومك؟');
    await page.getByRole('button', { name: 'خطوة أخيرة' }).click();
    await page.getByRole('button', { name: 'تم', exact: true }).click();

    await expect.poll(async () => page.evaluate(date => {
      const checkIns = JSON.parse(localStorage.getItem('nimmapp_checkins_v1') || '[]');
      return checkIns.some((entry: any) => entry.date === date && entry.timeOfDay === 'evening');
    }, previousDate)).toBe(true);
  });
}
