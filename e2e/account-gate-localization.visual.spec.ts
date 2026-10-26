import { expect, test } from '@playwright/test';

type LegacyLanguage = 'de' | 'en' | 'fr' | 'ar' | null;

const legacyLanguages: LegacyLanguage[] = ['de', 'en', 'fr', 'ar', null];

async function seedFreshGate(page: any, language: LegacyLanguage) {
  await page.addInitScript(({ language }) => {
    localStorage.clear();
    sessionStorage.clear();
    if (language) localStorage.setItem('rhythm_language_v1', language);
  }, { language });
}

for (const legacyLanguage of legacyLanguages) {
  test(`account gate starts in Arabic for legacy locale ${legacyLanguage ?? 'unset'}`, async ({ page }, testInfo) => {
    await seedFreshGate(page, legacyLanguage);
    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { name: 'أيامك. أنماطك.' })).toBeVisible();
    await expect(page.getByText('ريثم', { exact: true })).toBeVisible();
    await expect(page.locator('#account-language')).toHaveCount(0);
    await expect(page.getByText('Deutsch', { exact: true })).toHaveCount(0);
    await expect(page.getByText('English', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Français', { exact: true })).toHaveCount(0);
    await expect(page.getByText('ابدأ على هذا الجهاز أو استخدم حساباً لمزامنة تسجيلاتك.')).toBeVisible();
    await expect(page.getByRole('button', { name: /ابدأ على هذا الجهاز/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /تسجيل الدخول/ }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /إنشاء حساب/ }).first()).toBeVisible();

    await page.screenshot({ path: testInfo.outputPath(`account-gate-arabic-${legacyLanguage ?? 'unset'}.png`), fullPage: true });

    await page.getByRole('button', { name: /تسجيل الدخول/ }).first().click();
    await expect(page.getByRole('heading', { name: 'مرحباً بعودتك' })).toBeVisible();
    await expect(page.getByPlaceholder('البريد الإلكتروني')).toBeVisible();
    await expect(page.getByPlaceholder('كلمة المرور')).toBeVisible();

    const createAccount = page.getByRole('button', { name: 'إنشاء حساب جديد', exact: true });
    await expect(createAccount).toBeVisible();
    await createAccount.click();
    await expect(page.getByRole('heading', { name: 'إنشاء حساب' })).toBeVisible();
    await expect(page.getByPlaceholder('البريد الإلكتروني')).toBeVisible();
    await expect(page.getByPlaceholder('كلمة المرور')).toBeVisible();
  });
}


test('account failures stay Arabic-only for provider and network errors', async ({ page }) => {
  await seedFreshGate(page, null);
  let attempt = 0;
  await page.route('**/auth/v1/token?grant_type=password', async route => {
    attempt += 1;
    if (attempt === 1) {
      await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ msg: 'Invalid login credentials' }) });
      return;
    }
    if (attempt === 2) {
      await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ message: 'Provider unavailable' }) });
      return;
    }
    await route.abort('failed');
  });
  await page.goto('/');
  await page.getByRole('button', { name: /تسجيل الدخول/ }).first().click();
  await page.getByPlaceholder('البريد الإلكتروني').fill('qa@example.com');
  await page.getByPlaceholder('كلمة المرور').fill('safe-test-password');

  for (const forbidden of ['Invalid login credentials', 'Provider unavailable', 'Anmeldung fehlgeschlagen', 'Failed to fetch']) {
    await page.getByRole('button', { name: 'تسجيل الدخول', exact: true }).click();
    await expect(page.getByText('تعذر تسجيل الدخول', { exact: true })).toBeVisible();
    await expect(page.getByText(forbidden, { exact: true })).toHaveCount(0);
  }
});

test('Arabic-only onboarding keeps the ريثم brand and hides legacy language controls', async ({ page }) => {
  await seedFreshGate(page, null);
  await page.goto('/');

  await page.getByRole('button', { name: /ابدأ على هذا الجهاز/ }).click();
  await page.getByRole('button', { name: 'ابدأ اكتشاف إيقاعي', exact: true }).click();
  await page.getByRole('button', { name: 'نموذج سريع', exact: true }).click();

  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByText('لا نحتاج إلى الكمال — فقط نقطة بداية تساعد ريثم على فهمك.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'ابدأ مع ريثم', exact: true })).toBeVisible();
  await expect(page.getByText('Moment', { exact: true })).toHaveCount(0);
  await expect(page.locator('#account-language')).toHaveCount(0);
});
