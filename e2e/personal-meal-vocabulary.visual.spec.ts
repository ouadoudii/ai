import { expect, test } from '@playwright/test';

const MOMENTS_KEY = 'nimmapp_moments_v1';
const VOCABULARY_KEY = 'moment.personalMealVocabulary.v1';

for (const viewport of [
  { name: 'desktop', width: 1280, height: 900, language: 'en', originalTitle: 'Harira' },
  { name: 'mobile', width: 390, height: 844, language: 'ar', originalTitle: 'حريرة' },
] as const) test(`confirmed meal edit becomes an opt-in wording suggestion on ${viewport.name}`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.addInitScript(({ momentsKey, vocabularyKey, language, originalTitle }) => {
    const now = new Date();
    localStorage.setItem('rhythm_language_v1', language);
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    localStorage.removeItem(vocabularyKey);
    localStorage.setItem(momentsKey, JSON.stringify([{
      id: 'vocabulary-meal',
      title: originalTitle,
      label: 'Lunch',
      category: 'lunch',
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
      location: 'Home',
      locationCategory: 'home',
      imageUrl: '',
      rating: 5,
      mood: 'satisfied',
      tags: [],
      createdAt: now.getTime(),
    }]));
  }, { momentsKey: MOMENTS_KEY, vocabularyKey: VOCABULARY_KEY, language: viewport.language, originalTitle: viewport.originalTitle });

  await page.goto('/');
  if (viewport.name === 'desktop') await page.getByRole('navigation', { name: 'التنقل الرئيسي' }).getByRole('button', { name: 'لحظات', exact: true }).click();
  else await page.getByTestId('mobile-moments-nav').click();
  await page.getByTestId('timeline-moment-vocabulary-meal').click();
  await page.getByRole('button', { name: 'تعديل' }).click();
  const editor = page.locator('input[autocomplete="off"]');
  await editor.fill('with lemon');
  await editor.press('Enter');
  await page.getByRole('button', { name: 'حفظ التغييرات' }).click();

  await expect.poll(async () => page.evaluate((key) => {
    const entries = JSON.parse(localStorage.getItem(key) || '[]');
    return entries[0]?.preferred || '';
  }, VOCABULARY_KEY)).toBe(`${viewport.originalTitle} · with lemon`);

  await page.getByTestId(viewport.name === 'desktop' ? 'desktop-capture-button' : 'primary-capture-button').click();
  await page.locator('[data-capture-method="text"]').click();
  await editor.fill(viewport.originalTitle);
  const suggestion = page.getByTestId('remembered-meal-correction');
  await expect(suggestion).toBeVisible();
  await expect(suggestion).toContainText(`${viewport.originalTitle} · with lemon`);
  await expect.poll(async () => page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '[]').length, MOMENTS_KEY)).toBe(1);
  await page.screenshot({ path: testInfo.outputPath(`personal-meal-vocabulary-before-${viewport.name}.png`), fullPage: true });

  await suggestion.click();
  await expect(editor).toHaveValue(`${viewport.originalTitle} · with lemon`);
  await expect.poll(async () => page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '[]').length, MOMENTS_KEY)).toBe(1);
  await page.screenshot({ path: testInfo.outputPath(`personal-meal-vocabulary-after-${viewport.name}.png`), fullPage: true });
});
