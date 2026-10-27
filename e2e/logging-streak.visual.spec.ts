import { test, expect } from '@playwright/test';

const profile = {
  summary: 'I want to understand my rhythm.',
  priorities: [],
  preferences: [],
  rawIntro: 'I want to understand my rhythm.',
  confirmedAt: Date.now(),
  firstPlan: {
    title: 'Observe your rhythm',
    rationale: 'Notice what repeats.',
    focusAreas: [],
    firstStep: 'Capture your next meal.',
    phase: 'midday',
  },
};

async function seed(page: Parameters<Parameters<typeof test>[1]>[0]['page']) {
  await page.addInitScript((introProfile) => {
    const dateKey = (daysAgo: number) => {
      const d = new Date();
      d.setHours(12, 0, 0, 0);
      d.setDate(d.getDate() - daysAgo);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    localStorage.setItem('rhythm_language_v1', 'ar');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify(introProfile));
    localStorage.setItem('nimmapp_moments_v1', JSON.stringify([
      { id: 'best-a', title: 'فطور', category: 'breakfast', date: dateKey(8), time: '08:00', createdAt: Date.now() - 691200000 },
      { id: 'best-b', title: 'غداء', category: 'lunch', date: dateKey(7), time: '12:00', createdAt: Date.now() - 604800000 },
      { id: 'best-c', title: 'عشاء', category: 'dinner', date: dateKey(6), time: '19:00', createdAt: Date.now() - 518400000 },
      { id: 'streak-a', title: 'فطور', category: 'breakfast', date: dateKey(1), time: '08:00', createdAt: Date.now() - 86400000 },
      { id: 'streak-b', title: 'عشاء', category: 'dinner', date: dateKey(0), time: '19:00', createdAt: Date.now() },
    ]));
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  }, profile);
}

for (const viewport of [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  test(`shows five real journal days without punishing gaps on ${viewport.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await seed(page);
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    const card = page.getByTestId('journal-days-card');
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute('dir', 'rtl');
    await expect(card).toHaveAttribute('aria-label', 'سجلك على راحتك');
    await expect(card.getByTestId('journal-days-count')).toHaveText('5');
    await expect(card).toContainText('والأيام بلا تسجيل عادية أيضاً');
    await expect(card).not.toContainText(/أفضل سلسلة|أيام متتالية|خسرت|فشل|عقوبة|ممنوع/);
    await expect(page.getByTestId('logging-streak-card')).toHaveCount(0);
    await expect(page.getByTestId('logging-best-streak-count')).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath(`gentle-journal-${viewport.name}.png`), fullPage: true });
  });
}
