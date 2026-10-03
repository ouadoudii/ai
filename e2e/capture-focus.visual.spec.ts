import { expect, test } from '@playwright/test';

async function prepare(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1','en');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify({ displayName: 'Test', completedAt: new Date().toISOString() }));
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  });
  await page.goto('/');
}

for (const viewport of [{ name: 'desktop', width: 1280, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
  test(`capture dialog restores focus to Add after Escape and Close (${viewport.name})`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await prepare(page);

    const add = page.getByTestId('primary-capture-button');
    await add.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(add).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Français', exact: true }).click();
    await dialog.getByRole('button', { name: 'Fermer' }).click();
    await expect(dialog).toBeHidden();
    await expect(add).toBeFocused();
    await page.screenshot({ path: `test-results/capture-focus-${viewport.name}.png`, fullPage: true });
  });
}

test('capture dialog keeps keyboard focus inside the modal', async ({ page }) => {
  await prepare(page);
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
