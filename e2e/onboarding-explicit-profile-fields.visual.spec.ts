import { test, expect } from '@playwright/test';

const profileKey = 'rhythm_intro_profile_v1';

test('quick onboarding does not serialize untouched profile defaults', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('voice-first-entry-form').click();
  await page.getByTestId('onboarding-goal').fill('I want to understand my energy');

  await page.getByTestId('onboarding-form-save').click();
  await expect(page.getByTestId('voice-first-entry-overlay')).toBeHidden();

  const stored = await page.evaluate(key => localStorage.getItem(key), profileKey);
  expect(stored).toBeTruthy();
  expect(stored).not.toContain('Hunger right now');
  expect(stored).not.toContain('Energy right now');
  expect(stored).not.toContain('Eating rhythm');
});

test('quick onboarding keeps profile controls actionable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByTestId('voice-first-entry-form').click();
  await page.getByTestId('onboarding-goal').fill('Understand my routine');
  await page.getByTestId('onboarding-hunger').fill('4');
  await page.getByTestId('onboarding-rhythm').selectOption('regular');
  await expect(page.getByTestId('onboarding-form-save')).toBeEnabled();
  await page.screenshot({ path: 'visual-artifacts/onboarding-explicit-profile-fields.png', fullPage: true });
});
