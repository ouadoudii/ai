import { expect, test, type Page } from '@playwright/test';

const meal = (id: string, title: string, category: 'breakfast' | 'lunch', date: string, tags: string[] = []) => ({
  id, title, label: 'Meal', category, date, time: '08:00', location: 'Home',
  locationCategory: 'home', imageUrl: '', rating: 5, mood: 'satisfied', tags,
  createdAt: Date.parse(date + 'T08:00:00'),
});
const history = [
  meal('old', 'مسمن بالزبدة', 'breakfast', '2026-10-01'),
  meal('one', 'Omelette', 'breakfast', '2026-10-06'),
  meal('two', 'omelette', 'breakfast', '2026-10-07'),
  meal('three', '  OMELETTE  ', 'breakfast', '2026-10-08'),
  meal('demo', 'Demo', 'breakfast', '2026-10-09', ['demo']),
  meal('lunch', 'Couscous', 'lunch', '2026-10-09'),
];
const copy = {
  en: 'Something different from your own meals?',
  de: 'Etwas anderes aus deinen Mahlzeiten?',
  fr: 'Autre chose parmi tes repas ?',
  ar: 'بغيتي تبدّل من وجباتك السابقة؟',
} as const;
async function prepare(page: Page, moments: typeof history, language: keyof typeof copy) {
  await page.addInitScript(({ moments, language }) => {
    localStorage.setItem('rhythm_language_v1', language);
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    localStorage.setItem('nimmapp_moments_v1', JSON.stringify(moments));
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  }, { moments, language });
}
for (const viewport of [{ name: 'desktop', width: 1280, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
  for (const language of ['en', 'de', 'fr', 'ar'] as const) {
    test(`tap-only rotation keeps original meal name on ${viewport.name} in ${language}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await prepare(page, history, language);
      await page.goto('/');
      await page.getByTestId(viewport.name === 'desktop' ? 'desktop-capture-button' : 'primary-capture-button').click();
      await expect(page.getByTestId('personal-meal-rotation')).toContainText(copy[language]);
      const candidate = page.getByTestId('personal-rotation-breakfast');
      await expect(candidate).toContainText('مسمن بالزبدة');
      await expect(page.getByTestId('personal-rotation-lunch')).toHaveCount(0);
      await candidate.click();
      await expect(page.locator('input[autocomplete="off"]')).toHaveValue('مسمن بالزبدة');
      expect(await page.evaluate(() => JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]').length)).toBe(history.length);
      await page.screenshot({ path: testInfo.outputPath(`rotation-${viewport.name}-${language}.png`), fullPage: true });
    });
  }
  test(`no rotation without three real repeats on ${viewport.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await prepare(page, history.filter(m => m.id !== 'two'), 'en');
    await page.goto('/');
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-capture-button' : 'primary-capture-button').click();
    await expect(page.getByTestId('personal-meal-rotation')).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath(`rotation-absent-${viewport.name}.png`), fullPage: true });
  });
}
