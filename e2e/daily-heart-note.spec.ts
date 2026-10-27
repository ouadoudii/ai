import { expect, test } from '@playwright/test';

test('daily heart note is warm, Arabic, RTL and stable for each visitor', async ({ page }) => {
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
