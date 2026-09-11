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
  const tellButton = dialog.getByRole('button', { name: 'Tell me' });

  await expect(dialog).toBeVisible();
  await expect(closeButton).toBeFocused();

  await page.keyboard.press('Shift+Tab');
  await expect(tellButton).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(closeButton).toBeFocused();
});
