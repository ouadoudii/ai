import { test, expect, type Locator } from '@playwright/test';

const profileKey = 'rhythm_intro_profile_v1';

// The native caret must advance with each keystroke even while React updates
// validation state. Assert both value and selection on Desktop and Android.
async function typeControlledWeight(weight: Locator, value: string) {
  await weight.fill('');
  await expect(weight).toHaveValue('');
  let typed = '';
  for (const character of value) {
    await weight.pressSequentially(character);
    typed += character;
    await expect(weight).toHaveValue(typed);
    await expect.poll(() => weight.evaluate((input: HTMLInputElement) => input.selectionStart)).toBe(typed.length);
  }
}

async function seedNewUser(page: any, language = 'en') {
  await page.addInitScript((lang: string) => {
    localStorage.setItem('rhythm_language_v1', lang);
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('nimmapp_moments_v1', '[]');
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    localStorage.removeItem('rhythm_intro_profile_v1');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  }, language);
}

test('quick onboarding does not serialize untouched profile defaults', async ({ page }) => {
  await seedNewUser(page);
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
  await seedNewUser(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByTestId('voice-first-entry-form').click();
  await page.getByTestId('onboarding-goal').fill('Understand my routine');
  await page.getByTestId('onboarding-hunger').fill('4');
  await page.getByTestId('onboarding-rhythm').selectOption('regular');
  await expect(page.getByTestId('onboarding-form-save')).toBeEnabled();
  await page.screenshot({ path: 'visual-artifacts/onboarding-explicit-profile-fields.png', fullPage: true });
});

test('desktop blocks ambiguous onboarding weight and accepts locale decimal', async ({ page }) => {
  await seedNewUser(page, 'de');
  await page.goto('/');
  await page.getByTestId('voice-first-entry-form').click();
  await page.getByTestId('onboarding-goal').fill('Meine Energie verstehen');
  const weight = page.getByTestId('onboarding-weight');
  await typeControlledWeight(weight, '72,5.3');
  await expect(weight).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByTestId('onboarding-weight-error')).toBeVisible();
  await expect(page.getByTestId('onboarding-form-save')).toBeDisabled();
  await page.screenshot({ path: 'visual-artifacts/onboarding-invalid-weight-desktop.png', fullPage: true });
  await typeControlledWeight(weight, '72,5');
  // Deliberate editing at the beginning must remain possible after React
  // validation updates; fixing the reversed caret must not force append-only.
  await weight.press('Home');
  await weight.pressSequentially('8');
  await expect(weight).toHaveValue('872,5');
  await weight.press('Backspace');
  await expect(weight).toHaveValue('72,5');
  await expect(page.getByTestId('onboarding-weight-error')).toBeHidden();
  await expect(page.getByTestId('onboarding-form-save')).toBeEnabled();
});

test('mobile rejects malformed onboarding weight without saving profile', async ({ page }) => {
  await seedNewUser(page, 'fr');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByTestId('voice-first-entry-form').click();
  await page.getByTestId('onboarding-goal').fill('Comprendre mon énergie');
  await typeControlledWeight(page.getByTestId('onboarding-weight'), '72,,5');
  await expect(page.getByTestId('onboarding-form-save')).toBeDisabled();
  expect(await page.evaluate(key => localStorage.getItem(key), profileKey)).toBeNull();
  await page.screenshot({ path: 'visual-artifacts/onboarding-invalid-weight-mobile.png', fullPage: true });
});

test('Arabic RTL quick form keeps logical weight digits on desktop and mobile', async ({ page }) => {
  await seedNewUser(page, 'ar');
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.getByTestId('voice-first-entry-form').click();
  await page.getByTestId('onboarding-goal').fill('أريد فهم عاداتي بهدوء');
  const weight = page.getByTestId('onboarding-weight');
  await weight.focus();
  await weight.pressSequentially('8');
  await expect(weight).toHaveValue('8');
  await expect.poll(() => weight.evaluate((input: HTMLInputElement) => input.selectionStart)).toBe(1);
  await weight.pressSequentially('2');
  await expect(weight).toHaveValue('82');
  await expect.poll(() => weight.evaluate((input: HTMLInputElement) => input.selectionStart)).toBe(2);
  await weight.press('Home');
  await weight.pressSequentially('7');
  await expect(weight).toHaveValue('782');
  await weight.press('Backspace');
  await expect(weight).toHaveValue('82');
  await expect(page.getByTestId('onboarding-form-save')).toBeEnabled();
});
