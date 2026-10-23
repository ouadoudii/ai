import { expect, test } from '@playwright/test';

for (const viewport of [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  test(`Arabic RTL first paint survives a blocked app bundle on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.route('**/src/main.tsx', route => route.abort());

    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page).toHaveTitle('Moment — الطعام والنوم وإيقاع الحياة اليومية');
    await expect(page.getByRole('heading', { name: 'يتم تحميل Moment…' })).toBeVisible();
    await expect(page.getByText('جارٍ تشغيل التطبيق.', { exact: true })).toBeVisible();

    await page.evaluate(() => {
      window.dispatchEvent(new ErrorEvent('error', { message: 'تعذر تحميل الحزمة' }));
    });
    await expect(page.locator('#rhythm-boot-status')).toHaveText('خطأ في بدء التشغيل: تعذر تحميل الحزمة');
  });
}
