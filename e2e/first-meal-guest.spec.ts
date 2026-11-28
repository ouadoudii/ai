import { expect, test } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test('a new guest can save and find a first meal without a profile or account', async ({ page }) => {
  const assertProductionBuild = async () => {
    if (process.env.RHYTHM_PRODUCTION_SMOKE !== '1') return;
    await expect(page.locator('meta[name="rhythm-build-sha"]'))
      .toHaveAttribute('content', process.env.RHYTHM_EXPECTED_SHA!);
  };

  const response = await page.goto('/');
  expect(response?.ok()).toBe(true);
  await assertProductionBuild();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.getByRole('button', { name: /سجّل أول وجبة/ }).click();
  await expect(page.getByTestId('voice-first-entry-overlay')).toHaveCount(0);
  const editor = page.getByRole('dialog', { name: 'ماذا أكلت؟' });
  await expect(editor).toBeVisible();
  await editor.getByRole('button', { name: /طبق فواكه/ }).click();
  await editor.getByRole('button', { name: 'حفظ الوجبة' }).click();
  const entry = page.getByRole('button', { name: /\d{1,2}:\d{2}.*طبق فواكه/ });
  await expect(entry).toBeVisible();
  const reloaded = await page.reload();
  expect(reloaded?.ok()).toBe(true);
  await assertProductionBuild();
  await expect(entry).toBeVisible();
  await expect(editor).toHaveCount(0);
  await expect(page.getByTestId('voice-first-entry-overlay')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('rhythm_intro_profile_v1'))).toBeNull();
});
