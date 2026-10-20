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
