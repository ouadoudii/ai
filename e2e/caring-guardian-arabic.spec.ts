import { test, expect } from '@playwright/test';

// The live Guardian is on the Coach screen, not the Today screen.
// Reach the real Coach route before asserting; preserve the Android viewport
// for the responsive assertions after navigation.
test('live Arabic Guardian offers calm RTL guidance on desktop and Android', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'ar');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

  const originalViewport = page.viewportSize();
  // The Coach link currently lives in the desktop header. On Android, use
  // that real navigation link then restore the mobile viewport for coverage.
  if (originalViewport && originalViewport.width < 768) {
    await page.setViewportSize({ width: 1024, height: 900 });
  }
  await page.getByTestId('desktop-coach-nav').click();
  if (originalViewport && originalViewport.width < 768) {
    await page.setViewportSize(originalViewport);
  }

  const guardian = page.getByTestId('guardian');
  await expect(guardian).toBeVisible();
  await expect(guardian).toHaveAttribute('dir', 'rtl');
  await expect(guardian).toHaveAttribute('aria-label', 'مساحة لطيفة للاهتمام بنفسك');
  await expect(guardian).toContainText('أفكار بسيطة تدعم راحتك، دون أحكام أو ضغط.');
  await expect(guardian).toContainText('لكل يوم إيقاعه الخاص');
  await expect(guardian).not.toContainText(/Alles im grünen|harmonisch|Protein-Performer|Für dich da|⚠️/);
  await expect(guardian).toBeInViewport();

  await guardian.getByRole('button', { name: 'تجربة لطيفة' }).click();
  await guardian.getByRole('button', { name: /نوم أقل من المعتاد/ }).click();
  await expect(guardian.getByTestId('guardian-demo-notice')).toContainText('هذه أمثلة وليست تسجيلاتك');
  await guardian.getByRole('button', { name: /إعادة ضبط/ }).click();
  await expect(guardian.getByTestId('guardian-demo-notice')).toHaveCount(0);
});
