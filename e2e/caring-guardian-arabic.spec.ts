import { test, expect } from '@playwright/test';

// Exercise the visible Guardian in both configured desktop Chromium and Android.
test('Arabic Guardian presents a neutral RTL invitation on an empty day', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'ar');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const guardian = page.getByLabel('رسالة لطيفة من رفيق يومك');
  await expect(guardian).toBeVisible();
  await expect(guardian).toHaveAttribute('dir', 'rtl');
  await expect(guardian).toContainText('لا حاجة إلى يوم مثالي');
  await expect(guardian).not.toContainText(/Alles im grünen|harmonisch|Protein-Performer|Für dich da|⚠️/);
  await expect(guardian).toBeInViewport();
});
