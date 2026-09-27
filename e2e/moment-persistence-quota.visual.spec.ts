import { expect, test } from '@playwright/test';

async function prepareGuest(page:any) {
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1','en');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key:string, value:string) {
      if (key === 'nimmapp_moments_v1' && (window as any).__forceMomentQuotaFailure) {
        throw new DOMException('Storage quota exceeded', 'QuotaExceededError');
      }
      return original.call(this, key, value);
    };
  });
}

async function openMealEditor(page:any) {
  await page.getByTestId('primary-capture-button').click();
  await page.locator('[data-capture-method="text"]').click();
  await expect(page.getByRole('heading', { name: 'What did you have?' })).toBeVisible();
}

async function saveTypedMeal(page:any, name:string) {
  const editor = page.getByRole('heading', { name: 'What did you have?' }).locator('..').locator('..').locator('..');
  const input = page.getByPlaceholder('Start typing… e.g. chicken pasta');
  await input.fill(name);
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.getByRole('button', { name: 'Save meal' }).click();
}

test('quota failure never presents an unsaved moment as durable', async ({ page }) => {
  await prepareGuest(page);
  await page.goto('/');
  await page.evaluate(() => { (window as any).__forceMomentQuotaFailure = true; });

  await openMealEditor(page);
  await saveTypedMeal(page, 'Quota test snack');

  const alert = page.getByTestId('moment-persistence-error');
  await expect(alert).toBeVisible();
  await expect(alert).toContainText(/storage|space|photo/i);
  await expect.poll(async () => page.evaluate(() => {
    const stored = JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]');
    return stored.some((moment:any) => moment.title.includes('Quota test snack'));
  })).toBe(false);
  await expect(page.getByText('Quota test snack', { exact: false })).toHaveCount(0);
  await page.screenshot({ path: 'test-results/moment-quota-recovery.png', fullPage: true });
});

test('successful manual moment remains after reload', async ({ page }) => {
  await prepareGuest(page);
  await page.goto('/');

  await openMealEditor(page);
  await saveTypedMeal(page, 'Persistent test snack');

  await expect.poll(async () => page.evaluate(() => {
    const stored = JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]');
    return stored.some((moment:any) => moment.title.includes('Persistent test snack'));
  })).toBe(true);

  await page.reload();
  await expect.poll(async () => page.evaluate(() => {
    const stored = JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]');
    return stored.some((moment:any) => moment.title.includes('Persistent test snack'));
  })).toBe(true);
  await expect(page.getByTestId('moment-persistence-error')).toHaveCount(0);
});
