import { expect, test, type Page } from '@playwright/test';

const DRAFT_KEY = 'moment:capture-draft:v1';

async function prepare(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'en');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify({
      summary: 'Returning user', priorities: [], preferences: [], rawIntro: 'Returning user', confirmedAt: 1,
      firstPlan: { title: 'Start', rationale: 'Observe', focusAreas: [], firstStep: 'Log a meal', phase: 'midday' },
    }));
    localStorage.setItem('nimmapp_moments_v1', '[]');
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  });
}

async function openTextCapture(page: Page, layout: 'desktop' | 'mobile') {
  await page.getByTestId(layout === 'desktop' ? 'desktop-capture-button' : 'primary-capture-button').click();
  await page.locator('[data-capture-method="text"]').click();
  return page.getByRole('dialog', { name: 'What did you have?' });
}

for (const layout of [
  { name: 'desktop' as const, width: 1280, height: 900 },
  { name: 'mobile' as const, width: 390, height: 844 },
]) {
  test(`#397 ${layout.name}: unfinished mixed-script meal resumes explicitly and clears after save`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: layout.width, height: layout.height });
    await prepare(page);
    await page.goto('/');

    let editor = await openTextCapture(page, layout.name);
    await editor.getByPlaceholder('Start typing… e.g. chicken pasta').fill('بيض مسلوق avec thé');
    await editor.getByRole('button', { name: 'Add a note' }).click();
    await editor.getByPlaceholder('Optional context…').fill('Frühstück مع العائلة');
    await editor.getByRole('button', { name: 'Close' }).click();

    expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key) || 'null'), DRAFT_KEY)).toMatchObject({
      title: 'بيض مسلوق avec thé',
      note: 'Frühstück مع العائلة',
      category: 'snack',
    });
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]'))).toEqual([]);

    editor = await openTextCapture(page, layout.name);
    const recovery = editor.getByTestId('meal-draft-recovery');
    await expect(recovery).toContainText('Nothing was added to your journal');
    await page.screenshot({ path: testInfo.outputPath(`meal-draft-offer-${layout.name}.png`), fullPage: true });
    await recovery.getByTestId('resume-meal-draft').click();
    await expect(editor.getByText('بيض مسلوق avec thé', { exact: true })).toBeVisible();
    await expect(editor.getByPlaceholder('Optional context…')).toHaveValue('Frühstück مع العائلة');
    await editor.getByRole('button', { name: 'Save meal' }).click();

    await expect(editor).toHaveCount(0);
    expect(await page.evaluate(key => localStorage.getItem(key), DRAFT_KEY)).toBeNull();
    const moments = await page.evaluate(() => JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]'));
    expect(moments).toHaveLength(1);
    expect(moments[0]).toMatchObject({ title: 'بيض مسلوق avec thé', notes: 'Frühstück مع العائلة' });
  });

  test(`#397 ${layout.name}: discard removes the draft and an empty editor does not recreate it`, async ({ page }) => {
    await page.setViewportSize({ width: layout.width, height: layout.height });
    await prepare(page);
    await page.addInitScript(key => localStorage.setItem(key, JSON.stringify({
      version: 1,
      updatedAt: '2026-10-18T15:00:00.000Z',
      title: 'Harira',
      category: 'snack',
    })), DRAFT_KEY);
    await page.goto('/');

    let editor = await openTextCapture(page, layout.name);
    await editor.getByTestId('discard-meal-draft').click();
    expect(await page.evaluate(key => localStorage.getItem(key), DRAFT_KEY)).toBeNull();
    await editor.getByRole('button', { name: 'Close' }).click();

    editor = await openTextCapture(page, layout.name);
    await expect(editor.getByTestId('meal-draft-recovery')).toHaveCount(0);
    await editor.getByRole('button', { name: 'Close' }).click();
    expect(await page.evaluate(key => localStorage.getItem(key), DRAFT_KEY)).toBeNull();
  });
}
