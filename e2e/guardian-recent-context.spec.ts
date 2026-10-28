import { expect, test, type Page } from '@playwright/test';

const profile = {
  summary: 'Rhythm', priorities: [], preferences: [], rawIntro: 'Rhythm',
  confirmedAt: 1,
  firstPlan: { title: 'Observe', rationale: 'Notice', focusAreas: [], firstStep: 'Capture', phase: 'midday' },
};

async function seed(page: Page, recent: boolean) {
  await page.addInitScript(({ profile, recent }) => {
    const now = new Date();
    if (!recent) now.setDate(now.getDate() - 45);
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    localStorage.setItem('rhythm_language_v1', 'ar');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify(profile));
    localStorage.setItem('nimmapp_moments_v1', JSON.stringify([{
      id: 'context-harira', title: 'حريرة Harira', label: 'غداء',
      category: 'lunch', date, time: '12:30', location: 'الرباط',
      locationCategory: 'home', imageUrl: '', mood: 'comfort',
      tags: ['Darija'], eatingPace: 'rushed', distraction: 'screen',
      fullnessLevel: 2, createdAt: Date.now(),
    }]));
    localStorage.setItem('nimmapp_checkins_v1', JSON.stringify([{
      id: 'context-sleep', date, time: '08:00', timeOfDay: 'morning',
      sleep: { durationHours: 5, quality: 2, wakeFeeling: 'exhausted' },
      wellbeing: { energyLevel: 1 }, createdAt: Date.now(),
    }]));
    localStorage.removeItem('moment.guardian.acknowledged-occurrences.v1');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  }, { profile, recent });
}

for (const viewport of [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  test(`P0 Guardian does not revive 45-day-old meal and sleep prompts on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await seed(page, false);
    await page.goto('/');
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    const guardian = page.getByTestId('guardian');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(guardian.getByText('هنا متى احتجت')).toBeVisible();
    await expect(guardian.getByRole('button', { name: /إخفاء الفكرة/ })).toHaveCount(0);
    await expect(guardian).not.toContainText(/فشل|عقاب|إنذار|Überessen|Ghrelin|28%/);
    await expect.poll(() => page.evaluate(() => {
      const meals = JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]');
      const checkins = JSON.parse(localStorage.getItem('nimmapp_checkins_v1') || '[]');
      return [meals[0]?.id, checkins[0]?.id];
    })).toEqual(['context-harira', 'context-sleep']);
  });

  test(`P0 Guardian still offers optional Arabic care for today's entries on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await seed(page, true);
    await page.goto('/');
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    const guardian = page.getByTestId('guardian');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(guardian.getByText('قد تحتاج إلى بعض الراحة اليوم')).toBeVisible();
    await expect(guardian.getByText('لحظة هدوء بعد وجبتك')).toBeVisible();
    await expect(guardian.getByRole('status')).toContainText('أفكار يمكنك تجاهلها');
    const dismiss = guardian.getByRole('button', { name: /إخفاء الفكرة/ }).first();
    await dismiss.focus();
    await expect(dismiss).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(guardian.getByRole('button', { name: /إخفاء الفكرة/ })).toHaveCount(1);
    await expect(guardian.locator('.animate-pulse, .animate-ping, [class*="bg-rose"]')).toHaveCount(0);
  });
}
