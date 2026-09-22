import { expect, test } from '@playwright/test';

type AppLanguage = 'de' | 'en' | 'fr' | 'ar';

const cases: Array<{
  language: AppLanguage;
  dir: 'ltr' | 'rtl';
  title: string;
  intro: string;
  device: string;
  signin: string;
  create: string;
  createFromLogin: string;
  welcome: string;
  email: string;
  password: string;
}> = [
  { language: 'de', dir: 'ltr', title: 'Deine Tage. Deine Muster.', intro: 'Starte auf diesem Gerät oder nutze ein Konto, um deine Einträge zu synchronisieren.', device: 'Auf diesem Gerät starten', signin: 'Anmelden', create: 'Konto erstellen', createFromLogin: 'Neues Konto erstellen', welcome: 'Willkommen zurück', email: 'E-Mail', password: 'Passwort' },
  { language: 'en', dir: 'ltr', title: 'Your days. Your patterns.', intro: 'Start on this device or use an account to sync your entries.', device: 'Start on this device', signin: 'Sign in', create: 'Create account', createFromLogin: 'Create a new account', welcome: 'Welcome back', email: 'Email', password: 'Password' },
  { language: 'fr', dir: 'ltr', title: 'Tes journées. Tes habitudes.', intro: 'Commence sur cet appareil ou utilise un compte pour synchroniser tes entrées.', device: 'Commencer sur cet appareil', signin: 'Se connecter', create: 'Créer un compte', createFromLogin: 'Créer un nouveau compte', welcome: 'Bon retour', email: 'E-mail', password: 'Mot de passe' },
  { language: 'ar', dir: 'rtl', title: 'أيامك. أنماطك.', intro: 'ابدأ على هذا الجهاز أو استخدم حساباً لمزامنة تسجيلاتك.', device: 'ابدأ على هذا الجهاز', signin: 'تسجيل الدخول', create: 'إنشاء حساب', createFromLogin: 'إنشاء حساب جديد', welcome: 'مرحباً بعودتك', email: 'البريد الإلكتروني', password: 'كلمة المرور' },
];

async function seedFreshGate(page: any, language: AppLanguage) {
  await page.addInitScript(({ language }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('rhythm_language_v1', language);
  }, { language });
}

for (const copy of cases) {
  test(`${copy.language} account gate stays localized through choice, login and signup`, async ({ page }, testInfo) => {
    await seedFreshGate(page, copy.language);
    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('lang', copy.language);
    await expect(page.locator('html')).toHaveAttribute('dir', copy.dir);
    await expect(page.getByRole('heading', { name: copy.title })).toBeVisible();
    await expect(page.getByText(copy.intro)).toBeVisible();
    await expect(page.getByRole('button', { name: new RegExp(copy.device) })).toBeVisible();
    await expect(page.getByRole('button', { name: new RegExp(copy.signin) }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: new RegExp(copy.create) }).first()).toBeVisible();

    await page.screenshot({ path: testInfo.outputPath(`account-gate-${copy.language}-choice.png`), fullPage: true });

    await page.getByRole('button', { name: new RegExp(copy.signin) }).first().click();
    await expect(page.getByRole('heading', { name: copy.welcome })).toBeVisible();
    await expect(page.getByPlaceholder(copy.email)).toBeVisible();
    await expect(page.getByPlaceholder(copy.password)).toBeVisible();

    const createAccount = page.getByRole('button', { name: copy.createFromLogin, exact: true });
    await expect(createAccount).toBeVisible();
    await createAccount.click();
    await expect(page.getByRole('heading', { name: copy.create })).toBeVisible();
    await expect(page.getByPlaceholder(copy.email)).toBeVisible();
    await expect(page.getByPlaceholder(copy.password)).toBeVisible();
  });
}

test('account gate language selector changes locale intentionally and does not leak the previous locale', async ({ page }, testInfo) => {
  await seedFreshGate(page, 'de');
  await page.goto('/');

  const language = page.getByLabel('Language');
  await expect(language).toHaveValue('de');
  await expect(page.getByRole('heading', { name: 'Deine Tage. Deine Muster.' })).toBeVisible();

  await language.selectOption('fr');
  await expect(language).toHaveValue('fr');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByRole('heading', { name: 'Tes journées. Tes habitudes.' })).toBeVisible();
  await expect(page.getByText('Deine Tage. Deine Muster.')).toHaveCount(0);

  await language.selectOption('ar');
  await expect(language).toHaveValue('ar');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { name: 'أيامك. أنماطك.' })).toBeVisible();
  await expect(page.getByText('Tes journées. Tes habitudes.')).toHaveCount(0);

  await page.screenshot({ path: testInfo.outputPath('account-gate-language-switch-ar.png'), fullPage: true });
});