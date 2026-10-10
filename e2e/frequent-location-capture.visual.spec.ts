import { expect, test, type Page } from '@playwright/test';

const key = 'nimmapp_moments_v1';
const now = Date.now();
const makeMoment = (id: string, location: string, category: 'snack' | 'coffee', createdAt: number) => ({
  id, title: 'Snack', label: 'Snack', category, date: '2026-10-10', time: '14:00',
  location, locationCategory: 'home', imageUrl: '', rating: 5, mood: 'satisfied',
  tags: [], createdAt,
});
const history = [
  makeMoment('snack-old', ' CAFÉ ATLAS ', 'snack', now - 3000),
  makeMoment('snack-middle', 'café atlas', 'snack', now - 2000),
  makeMoment('snack-new', 'Café Atlas', 'snack', now - 1000),
  makeMoment('demo-noise', 'Somewhere else', 'snack', now),
  makeMoment('coffee-one', 'Different place', 'coffee', now),
].map(moment => moment.id === 'demo-noise' ? { ...moment, id: 'demo-noise' } : moment);
const copy = {
  en: { label: 'Your usual place for this meal', action: 'Use this place', save: 'Save meal' },
  de: { label: 'Dein häufiger Ort für diese Mahlzeit', action: 'Diesen Ort übernehmen', save: 'Mahlzeit speichern' },
  fr: { label: 'Ton lieu habituel pour ce repas', action: 'Utiliser ce lieu', save: 'Enregistrer le repas' },
  ar: { label: 'مكانك المعتاد لهذه الوجبة', action: 'استخدم هذا المكان', save: 'حفظ الوجبة' },
} as const;

async function prepare(page: Page, language: keyof typeof copy, moments = history) {
  await page.addInitScript(({ language, moments }) => {
    localStorage.setItem('rhythm_language_v1', language);
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify({
      summary: 'Returning user', priorities: [], preferences: [], rawIntro: 'Returning user',
      confirmedAt: 1, firstPlan: { title: 'Start', rationale: 'Observe', focusAreas: [], firstStep: 'Log a meal', phase: 'midday' },
    }));
    localStorage.setItem('nimmapp_moments_v1', JSON.stringify(moments));
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  }, { language, moments });
}

async function openTextCapture(page: Page, viewport: 'desktop' | 'mobile') {
  await page.goto('/');
  await page.getByTestId(viewport === 'desktop' ? 'desktop-capture-button' : 'primary-capture-button').click();
  await page.locator('[data-capture-method="text"]').click();
}

for (const viewport of [
  { name: 'desktop' as const, width: 1280, height: 900 },
  { name: 'mobile' as const, width: 390, height: 844 },
]) {
  for (const language of ['en', 'de', 'fr', 'ar'] as const) {
    test(`location is an explicit localized shortcut on ${viewport.name} in ${language}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await prepare(page, language);
      await openTextCapture(page, viewport.name);
      const suggestion = page.getByTestId('frequent-location-suggestion');
      await expect(suggestion).toContainText(copy[language].label);
      await expect(page.getByTestId('frequent-location-name')).toHaveText('Café Atlas');
      const action = page.getByTestId('use-frequent-location');
      await expect(action).toHaveText(copy[language].action);
      await expect(action).toHaveAttribute('aria-pressed', 'false');
      await page.screenshot({ path: testInfo.outputPath(`location-before-${viewport.name}-${language}.png`), fullPage: true });
      expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '[]').length, key)).toBe(history.length);
      await action.click();
      await expect(action).toHaveAttribute('aria-pressed', 'true');
      expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '[]').length, key)).toBe(history.length);
      await page.locator('input[autocomplete="off"]').fill('My snack');
      await page.getByRole('button', { name: copy[language].save }).click();
      await expect.poll(() => page.evaluate(key => {
        const moments = JSON.parse(localStorage.getItem(key) || '[]');
        return moments.length > 5 ? moments[0].location : null;
      }, key)).toBe('Café Atlas');
      await page.screenshot({ path: testInfo.outputPath(`location-saved-${viewport.name}-${language}.png`), fullPage: true });
    });
  }

  test(`location is hidden without three real observations on ${viewport.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await prepare(page, 'en', history.filter(moment => moment.id !== 'snack-middle'));
    await openTextCapture(page, viewport.name);
    await expect(page.getByTestId('frequent-location-suggestion')).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath(`location-absent-${viewport.name}.png`), fullPage: true });
  });
}
