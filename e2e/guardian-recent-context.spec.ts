import { expect, test, type Page } from '@playwright/test';

const profile = {
  summary: 'Rhythm', priorities: [], preferences: [], rawIntro: 'Rhythm',
  confirmedAt: 1,
  firstPlan: { title: 'Observe', rationale: 'Notice', focusAreas: [], firstStep: 'Capture', phase: 'midday' },
};

async function seed(page: Page, recent: boolean, wakeFeeling: 'exhausted' | 'refreshed' = 'exhausted', partial = false, recoveredEnergy = false, correctedSleep = false, correctedMeal = false) {
  await page.addInitScript(({ profile, recent, wakeFeeling, partial, recoveredEnergy, correctedSleep, correctedMeal }) => {
    const now = new Date();
    if (!recent) now.setDate(now.getDate() - 45);
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    localStorage.setItem('rhythm_language_v1', 'ar');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify(profile));
    localStorage.setItem('nimmapp_moments_v1', JSON.stringify(correctedMeal ? [
      {
        id: 'older-rushed', title: 'حريرة', label: 'غداء',
        category: 'lunch', date, time: '12:00', location: 'الرباط',
        locationCategory: 'home', imageUrl: '', mood: 'comfort',
        tags: ['Darija'], eatingPace: 'rushed', distraction: 'screen',
        fullnessLevel: 2, createdAt: Date.now(),
      },
      {
        id: 'newer-mindful', title: 'كسكس', label: 'غداء',
        category: 'lunch', date, time: '14:00', location: 'الرباط',
        locationCategory: 'home', imageUrl: '', mood: 'comfort',
        tags: ['Darija'], eatingPace: 'slow', distraction: 'mindful',
        fullnessLevel: 2, createdAt: Date.now() - 60_000,
      },
    ] : [{
      id: 'context-harira', title: 'حريرة Harira', label: 'غداء',
      category: 'lunch', date, time: '12:30', location: 'الرباط',
      locationCategory: 'home', imageUrl: '', mood: 'comfort',
      tags: ['Darija'], eatingPace: 'rushed', distraction: 'screen',
      fullnessLevel: 2, energyAfter: recoveredEnergy ? 'sluggish' : undefined, createdAt: Date.now(),
    }]));
    localStorage.setItem('nimmapp_checkins_v1', JSON.stringify(correctedSleep ? [
      { id: 'sleep-old', date, time: '08:00', timeOfDay: 'morning', sleep: { durationHours: 5, quality: 2, wakeFeeling: 'exhausted' }, createdAt: Date.now() - 60_000 },
      { id: 'sleep-corrected', date, time: '09:00', timeOfDay: 'morning', sleep: { durationHours: 8, quality: 4, wakeFeeling: 'refreshed' }, createdAt: Date.now() },
      { id: 'midday-no-sleep', date, time: '13:00', timeOfDay: 'midday', wellbeing: { energyLevel: 4 }, createdAt: Date.now() + 60_000 },
    ] : recoveredEnergy ? [
      { id: 'energy-earlier', date, time: '12:00', timeOfDay: 'midday', wellbeing: { energyLevel: 1 }, createdAt: Date.now() - 60_000 },
      { id: 'energy-recovered', date, time: '14:30', timeOfDay: 'midday', wellbeing: { energyLevel: 4 }, createdAt: Date.now() },
    ] : partial ? [
      { id: 'context-midday', date, time: '13:00', timeOfDay: 'midday', wellbeing: { energyLevel: 4 }, createdAt: Date.now() },
      { id: 'context-sleep', date, time: '08:00', timeOfDay: 'morning', sleep: { durationHours: 5, wakeFeeling: 'refreshed' }, createdAt: Date.now() - 60_000 },
    ] : [{
      id: 'context-sleep', date, time: '08:00', timeOfDay: 'morning',
      sleep: { durationHours: 5, ...(wakeFeeling === 'exhausted' ? { quality: 2 } : {}), wakeFeeling },
      wellbeing: { energyLevel: 1 }, createdAt: Date.now(),
    }]));
    localStorage.removeItem('moment.guardian.acknowledged-occurrences.v1');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  }, { profile, recent, wakeFeeling, partial, recoveredEnergy, correctedSleep, correctedMeal });
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

  test(`P0 Guardian respects a refreshed wake feeling after short sleep on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await seed(page, true, 'refreshed');
    await page.goto('/');
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    const guardian = page.getByTestId('guardian');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(guardian.getByText(/شعورك عند الاستيقاظ: منتعش/)).toBeVisible();
    await expect(guardian).not.toContainText(/شعورك عند الاستيقاظ: تعب|undefined|NaN|Ghrelin|28%|فشل|عقاب/);
    await expect(guardian.getByRole('status')).toContainText('أفكار يمكنك تجاهلها');
    await expect(guardian.locator('.animate-pulse, .animate-ping, [class*="bg-red"], [class*="bg-rose"]')).toHaveCount(0);
    await expect(guardian.getByRole('button', { name: /إخفاء الفكرة/ }).first()).toBeVisible();
  });


  test(`P0 Guardian honors a corrected sleep check-in without old fatigue advice on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await seed(page, true, 'refreshed', false, false, true);
    await page.goto('/');
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    const guardian = page.getByTestId('guardian');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(guardian.getByText('لحظة هدوء بعد وجبتك')).toBeVisible();
    await expect(guardian.getByText('قد تحتاج إلى بعض الراحة اليوم')).toHaveCount(0);
    await expect(guardian).not.toContainText(/شعورك عند الاستيقاظ: مرهق|فشل|عقاب|إنذار|Ghrelin|28%/);
    await expect(guardian.locator('.animate-pulse, .animate-ping, [class*="bg-red"], [class*="bg-rose"]')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() =>
      JSON.parse(localStorage.getItem('nimmapp_checkins_v1') || '[]').map((entry: { id: string }) => entry.id)
    )).toEqual(['sleep-old', 'sleep-corrected', 'midday-no-sleep']);
  });

  test(`P0 Guardian keeps a partial morning sleep check-in after a newer midday entry on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await seed(page, true, 'refreshed', true);
    await page.goto('/');
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    const guardian = page.getByTestId('guardian');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(guardian.getByText('قد تحتاج إلى بعض الراحة اليوم')).toBeVisible();
    await expect(guardian.getByText(/شعورك عند الاستيقاظ: منتعش/)).toBeVisible();
    await expect(guardian.getByRole('status')).toContainText('أفكار يمكنك تجاهلها');
    await expect(guardian).not.toContainText(/undefined|NaN|Ghrelin|28%|فشل|عقاب/);
    await expect(guardian.locator('.animate-pulse, .animate-ping, [class*="bg-red"], [class*="bg-rose"]')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() =>
      JSON.parse(localStorage.getItem('nimmapp_checkins_v1') || '[]').map((entry: { id: string }) => entry.id)
    )).toEqual(['context-midday', 'context-sleep']);
  });

  test(`P0 Guardian does not repeat stale low-energy advice after recovery on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const afternoon = new Date();
    afternoon.setHours(15, 0, 0, 0);
    await page.clock.setFixedTime(afternoon);
    await seed(page, true, 'refreshed', false, true);
    await page.goto('/');
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    const guardian = page.getByTestId('guardian');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(guardian.getByText('لحظة هدوء بعد وجبتك')).toBeVisible();
    await expect(guardian.getByText('مساحة صغيرة لاستعادة نشاطك')).toHaveCount(0);
    await expect(guardian).not.toContainText(/فشل|عقاب|إنذار|Ghrelin|28%/);
    await expect(guardian.locator('.animate-pulse, .animate-ping, [class*="bg-red"], [class*="bg-rose"]')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() =>
      JSON.parse(localStorage.getItem('nimmapp_checkins_v1') || '[]').map((entry: { id: string }) => entry.id)
    )).toEqual(['energy-earlier', 'energy-recovered']);
    await expect.poll(() => page.evaluate(() =>
      JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]')[0]?.energyAfter
    )).toBe('sluggish');
  });

  test(`P0 Guardian does not revive an older rushed-meal suggestion after a calmer meal on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await seed(page, true, 'refreshed', false, false, false, true);
    await page.goto('/');
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    const guardian = page.getByTestId('guardian');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(guardian.getByText('لحظة هدوء بعد وجبتك')).toHaveCount(0);
    await expect(guardian.getByText('قد تحتاج إلى بعض الراحة اليوم')).toBeVisible();
    await expect(guardian).not.toContainText(/فشل|عقاب|إنذار|Ghrelin|28%|Überessen/);
    await expect(guardian.locator('.animate-pulse, .animate-ping, [class*="bg-red"], [class*="bg-rose"]')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() =>
      JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]').map((entry: { id: string }) => entry.id)
    )).toEqual(['older-rushed', 'newer-mindful']);
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
    const dismissButtons = guardian.getByRole('button', { name: /إخفاء الفكرة/ });
    const before = await dismissButtons.count();
    expect(before).toBeGreaterThanOrEqual(2);
    await dismissButtons.first().focus();
    await expect(dismissButtons.first()).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(dismissButtons).toHaveCount(before - 1);
    await expect(guardian.locator('.animate-pulse, .animate-ping, [class*="bg-rose"]')).toHaveCount(0);
  });
}
