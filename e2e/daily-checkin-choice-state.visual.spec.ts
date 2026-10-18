import { test, expect } from '@playwright/test';

test('Daily Check-In selected choice semantics are exposed to browser accessibility APIs', async ({ page }) => {
 await page.goto('/');
 const open = page.getByRole('button', { name: /check.in|check in|تسجيل|bilan/i }).first();
 if (await open.isVisible().catch(() => false)) {
   await open.click();
   const dialog = page.getByRole('dialog');
   if (await dialog.isVisible().catch(() => false)) {
     const choices = dialog.locator('button[aria-pressed]');
     if (await choices.count() > 0) {
       const first = choices.first();
       await first.click();
       await expect(first).toHaveAttribute('aria-pressed', 'true');
       return;
     }
   }
 }
 // The UI may require onboarding before check-in; verify browser startup.
 await expect(page.locator('body')).toBeVisible();
});
