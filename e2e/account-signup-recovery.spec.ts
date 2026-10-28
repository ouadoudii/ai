import { expect, test } from '@playwright/test';

for (const viewport of [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  test(`Arabic signup errors explain account creation, preserve input and allow recovery on ${viewport.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('rhythm_language_v1', 'fr'); // Legacy locale must never leak into product UI.
    });
    let attempts = 0;
    await page.route('**/auth/v1/signup*', route => {
      attempts += 1;
      return route.fulfill({
        status: attempts === 1 ? 422 : 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: attempts === 1 ? 'User already registered' : 'Service unavailable' }),
      });
    });

    await page.goto('/');
    await page.getByRole('button', { name: /إنشاء حساب/ }).first().click();
    await expect(page.getByRole('heading', { name: 'إنشاء حساب' })).toBeVisible();
    const email = page.getByRole('textbox', { name: 'البريد الإلكتروني' });
    const password = page.getByLabel('كلمة المرور');
    await email.fill('signup-qa@example.com');
    await password.fill('safe-test-password');

    for (const forbidden of ['User already registered', 'Service unavailable']) {
      await page.getByRole('button', { name: 'إنشاء حساب', exact: true }).click();
      const feedback = page.getByRole('status');
      await expect(feedback).toContainText('تعذر إنشاء الحساب');
      await expect(feedback).toContainText('راجع البريد الإلكتروني وكلمة المرور أو حاول بعد قليل');
      await expect(feedback).not.toContainText('تعذر تسجيل الدخول');
      await expect(feedback).not.toContainText(forbidden);
      await expect(email).toHaveValue('signup-qa@example.com');
      await expect(password).toHaveValue('safe-test-password');
      await expect(email).toHaveAttribute('aria-describedby', 'account-form-feedback');
      await expect(password).toHaveAttribute('aria-describedby', 'account-form-feedback');
      await expect(page.locator('form')).toHaveAttribute('aria-busy', 'false');
      await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
      await expect(feedback).toHaveCSS('background-color', 'rgb(255, 248, 235)');
      const contrast = await feedback.evaluate(element => {
        const style = getComputedStyle(element);
        const channels = (value: string) => (value.match(/\d+/g) || []).slice(0, 3).map(Number);
        const luminance = (rgb: number[]) => rgb.map(value => {
          const s = value / 255;
          return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
        const foreground = luminance(channels(style.color));
        const background = luminance(channels(style.backgroundColor));
        return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
      });
      expect(contrast).toBeGreaterThanOrEqual(4.5);
    }

    await page.screenshot({ path: testInfo.outputPath(`signup-recovery-${viewport.name}.png`), fullPage: true });
    await page.getByRole('button', { name: 'لديك حساب؟ سجّل الدخول' }).click();
    await expect(page.getByRole('heading', { name: 'مرحباً بعودتك' })).toBeVisible();
    await expect(page.getByRole('status')).toHaveCount(0);
    await expect(page.getByLabel('كلمة المرور')).toHaveAttribute('autocomplete', 'current-password');
  });
}
