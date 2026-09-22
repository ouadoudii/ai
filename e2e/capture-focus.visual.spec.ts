import { expect, test } from '@playwright/test';

test('capture dialog keeps keyboard focus inside the modal', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1','en');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  });

  await page.goto('/');
  await page.getByTestId('primary-capture-button').click();

  const dialog = page.getByRole('dialog');
  const closeButton = dialog.getByRole('button', { name: 'Close' });
  const firstFocusable = dialog.getByRole('button', { name: 'English', exact: true });
  const lastFocusable = dialog.locator('[data-capture-method="text"]');

  await expect(dialog).toBeVisible();
  await expect(closeButton).toBeFocused();

  await firstFocusable.focus();
  await page.keyboard.press('Shift+Tab');
  await expect(lastFocusable).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(firstFocusable).toBeFocused();

  await expect.poll(async () => page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')))).toBe(true);
});
