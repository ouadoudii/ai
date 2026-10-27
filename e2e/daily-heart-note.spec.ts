import { expect, test } from '@playwright/test';

test('daily heart note is warm, Arabic, RTL and stable for each visitor', async ({ page }) => {
  // Reach the real Today screen through the existing guest/onboarding contract.
  // Keep this setup separate from the per-visitor seed so the second visitor
  // can be tested after a reload without being overwritten by addInitScript.
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'ar');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  });
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('rhythm_heart_note_seed_v1', 'alpha-user'));
  await page.reload();

  const card = page.getByTestId('daily-heart-note');
  const note = page.getByTestId('daily-heart-note-text');
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('dir', 'rtl');
  await expect(card).toHaveAttribute('data-personalized', 'true');
  await expect(card).toHaveAttribute('aria-label', 'كلمة لقلبك اليوم');
  await expect(card.getByText('كلمة لقلبك', { exact: true })).toBeVisible();
  const first = await note.innerText();
  expect(first).toMatch(/[\u0600-\u06FF]/);

  await page.reload();
  await expect(card).toHaveAttribute('data-personalized', 'true');
  await expect(note).toHaveText(first);

  await page.evaluate(() => localStorage.setItem('rhythm_heart_note_seed_v1', 'beta-user'));
  await page.reload();
  await expect(card).toHaveAttribute('data-personalized', 'true');
  await expect(note).not.toHaveText(first);
  await expect(card).not.toContainText(/(?:Ghrelin|Küchenschluss|Überessen|failure|calories)/i);
});
