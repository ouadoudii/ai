import { expect, test } from '@playwright/test';

const profile = {
  summary: 'Rhythm', priorities: [], preferences: [], rawIntro: 'Rhythm',
  confirmedAt: 1, firstPlan: { title: 'Observe', rationale: 'Notice', focusAreas: [], firstStep: 'Capture', phase: 'midday' },
};

for (const viewport of [{ name: 'desktop', width: 1280, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
  test(`Guardian demo dismissals never overwrite real acknowledgements on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.addInitScript(({ profile }) => {
      if (sessionStorage.getItem('guardian_demo_ack_seeded') === 'true') return;
      sessionStorage.setItem('guardian_demo_ack_seeded', 'true');
      const now = new Date();
      const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
      localStorage.setItem('rhythm_language_v1', 'ar');
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
      localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify(profile));
      localStorage.setItem('nimmapp_moments_v1', '[]');
      localStorage.setItem('nimmapp_checkins_v1', JSON.stringify([{
        id: 'real-sleep', date, time: '07:00', timeOfDay: 'morning',
        sleep: { durationHours: 4.5, quality: 2, wakeFeeling: 'exhausted' },
        wellbeing: { energyLevel: 4 }, createdAt: Date.now() - 1000,
      }]));
      localStorage.removeItem('moment.guardian.acknowledged-occurrences.v1');
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    }, { profile });

    await page.goto('/');
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    const guardian = page.getByTestId('guardian');
    const key = 'moment.guardian.acknowledged-occurrences.v1';

    await expect(guardian).toContainText('4.5 ساعات نوم');
    await guardian.getByRole('button', { name: /إخفاء الفكرة/ }).first().click();
    await expect(guardian).not.toContainText('4.5 ساعات نوم');
    const personalAcknowledgements = await page.evaluate((key) => localStorage.getItem(key), key);
    expect(JSON.parse(personalAcknowledgements || '[]').length).toBeGreaterThan(0);

    await guardian.getByRole('button', { name: 'اختبار تنبيه' }).click();
    await guardian.getByRole('button', { name: /نقص النوم/ }).click();
    await expect(guardian.getByTestId('guardian-demo-notice')).toBeVisible();
    await expect(guardian).toContainText('5 ساعات نوم');
    await guardian.getByRole('button', { name: /إخفاء الفكرة/ }).first().click();
    await expect(guardian).not.toContainText('5 ساعات نوم');
    expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(personalAcknowledgements);

    await guardian.getByRole('button', { name: /الأكل تحت الضغط/ }).click();
    await guardian.getByRole('button', { name: /نقص النوم/ }).click();
    await expect(guardian).toContainText('5 ساعات نوم');
    expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(personalAcknowledgements);

    await guardian.getByRole('button', { name: /إعادة ضبط/ }).click();
    await expect(guardian.getByTestId('guardian-demo-notice')).toHaveCount(0);
    await expect(guardian).not.toContainText('4.5 ساعات نوم');
    expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(personalAcknowledgements);

    await page.reload();
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    await expect(page.getByTestId('guardian')).not.toContainText('4.5 ساعات نوم');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });
}
