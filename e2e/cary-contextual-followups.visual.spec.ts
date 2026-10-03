import { expect, test } from '@playwright/test';

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
    firstStep: 'Capture your next midday check-in.',
    phase: 'midday',
  },
};

const prepare = async (page: any) => {
  await page.addInitScript((savedProfile) => {
    localStorage.setItem('rhythm_language_v1', 'de');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify(savedProfile));
    localStorage.setItem('nimmapp_moments_v1', '[]');
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  }, profile);
};

for (const viewport of [
  { name: 'desktop', width: 1280, height: 900, nav: 'desktop-coach-nav' },
  { name: 'mobile', width: 390, height: 844, nav: 'mobile-coach-nav' },
] as const) {
  test(`Cary contextual follow-up prefills without auto-sending on ${viewport.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await prepare(page);
    await page.route('**/api/**', (route) => route.abort());
    await page.goto('/');
    await page.getByTestId(viewport.nav).click();

    const question = 'Warum bin ich nach بيض مسلوق + pain complet müde?';
    const composer = page.getByPlaceholder(/Frage stellen/);
    await composer.fill(question);
    await page.getByRole('button', { name: /Senden/ }).click();
    await expect(page.getByText(question, { exact: true })).toBeVisible();

    const followUps = page.getByTestId('cary-contextual-followups');
    await expect(followUps).toBeVisible();
    const firstFollowUp = followUps.getByRole('button').first();
    const suggestion = (await firstFollowUp.textContent())?.trim() ?? '';
    expect(suggestion).toContain('بيض مسلوق + pain complet');

    const before = await page.locator('[data-testid="cary-contextual-followups"]').count();
    await firstFollowUp.click();
    await expect(composer).toHaveValue(suggestion);
    await expect(page.getByText(suggestion, { exact: true })).toHaveCount(1);
    expect(await page.locator('[data-testid="cary-contextual-followups"]').count()).toBe(before);

    await page.screenshot({
      path: testInfo.outputPath(`cary-contextual-followup-${viewport.name}.png`),
      fullPage: true,
    });
  });
}
