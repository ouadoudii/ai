import { expect, test } from '@playwright/test';

for (const viewport of [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  test(`Arabic RTL first paint survives a blocked app bundle on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    let blockedEntryUrl = '';
    await page.route(/\/assets\/index-[^/?]+\.js(?:\?.*)?$/, async route => {
      blockedEntryUrl = route.request().url();
      await route.abort();
    });

    await page.goto('/');

    expect(blockedEntryUrl).toMatch(/\/assets\/index-[^/?]+\.js/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page).toHaveTitle('Moment — الطعام والنوم وإيقاع الحياة اليومية');
    await expect(page.getByRole('heading', { name: 'يتم تحميل Moment…' })).toBeVisible();
    await expect(page.getByText('جارٍ تشغيل التطبيق.', { exact: true })).toBeVisible();

    await page.evaluate(() => {
      window.dispatchEvent(new ErrorEvent('error', {
        message: 'Failed to fetch dynamically imported module',
      }));
    });
    await expect(page.locator('#rhythm-boot-status')).toHaveText(
      'تعذر بدء التطبيق. يُرجى تحديث الصفحة والمحاولة مرة أخرى.',
    );
    await expect(page.locator('#rhythm-boot-status')).not.toContainText('Failed to fetch');

    await page.evaluate(() => {
      window.dispatchEvent(new PromiseRejectionEvent('unhandledrejection', {
        promise: Promise.resolve(),
        reason: new Error('Sensitive internal rejection detail'),
      }));
    });
    await expect(page.locator('#rhythm-boot-status')).toHaveText(
      'تعذر بدء التطبيق. يُرجى تحديث الصفحة والمحاولة مرة أخرى.',
    );
    await expect(page.locator('#rhythm-boot-status')).not.toContainText('Sensitive internal');
  });
}
