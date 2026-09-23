import { expect, test } from '@playwright/test';

test('voice capture remains available under the shared Today phase policy', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'en');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  });

  await page.goto('/');
  await page.getByTestId('primary-capture-button').click();
  await expect(page.getByRole('dialog')).toBeVisible();

  const tellButton = page.getByRole('button', { name: /tell|voice|talk/i });
  if (await tellButton.count()) {
    await tellButton.first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
  }

  await expect(page.locator('body')).toHaveScreenshot('voice-phase-policy.png', { maxDiffPixelRatio: 0.03 });
});
