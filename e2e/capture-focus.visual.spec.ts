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
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
}

for (const viewport of [{ name: 'desktop', width: 1280, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
  test(`capture dialog restores focus to Add after Escape and Close (${viewport.name})`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await prepare(page);

    const add = page.getByTestId(
      viewport.name === 'desktop' ? 'desktop-capture-button' : 'primary-capture-button',
    );
    await expect(add).toBeVisible();
    await add.click();
    const dialog = page.getByRole('dialog');
    const closeButton = dialog.getByRole('button', { name: 'إغلاق', exact: true });
    await expect(dialog).toBeVisible();
    await expect(closeButton).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(add).toBeFocused();

    await add.click();
    await expect(dialog).toBeVisible();
    await closeButton.click();
    await expect(dialog).toBeHidden();
    await expect(add).toBeFocused();
    await page.screenshot({ path: `test-results/capture-focus-${viewport.name}.png`, fullPage: true });
  });
}

test('capture dialog keeps keyboard focus inside the modal', async ({ page }) => {
  await prepare(page);
  await page.getByRole('button', { name: 'سجّل لحظة' }).first().click();

  const dialog = page.getByRole('dialog');
  const closeButton = dialog.getByRole('button', { name: 'إغلاق', exact: true });
  const focusable = dialog.locator(
    'button:not([disabled]):visible, input:not([disabled]):visible, select:not([disabled]):visible, textarea:not([disabled]):visible, [tabindex]:not([tabindex="-1"]):visible',
  );

  await expect(dialog).toBeVisible();
  await expect(closeButton).toBeFocused();
  expect(await focusable.count()).toBeGreaterThan(1);

  const firstFocusable = focusable.first();
  const lastFocusable = focusable.last();
  await firstFocusable.focus();
  await page.keyboard.press('Shift+Tab');
  await expect(lastFocusable).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(firstFocusable).toBeFocused();
  await expect.poll(async () => page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')))).toBe(true);
});
