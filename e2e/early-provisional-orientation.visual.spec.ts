import { expect, test } from '@playwright/test';

const proteinMeals = [
  {
    id: 'user-meal-1',
    title: 'Poulet grillé avec riz',
    label: 'Déjeuner',
    category: 'lunch',
    date: '2026-09-16',
    time: '12:30',
    rating: 4,
    tags: [],
    createdAt: 1,
    nutrition: { protein: 32 },
  },
  {
    id: 'user-meal-2',
    title: 'Yaourt et noix',
    label: 'Collation',
    category: 'snack',
    date: '2026-09-16',
    time: '16:00',
    rating: 4,
    tags: [],
    createdAt: 2,
    nutrition: { protein: 26 },
  },
];

async function installReturningState(page: any, language: 'de' | 'fr') {
  await page.addInitScript(({ lang, meals }: { lang: string; meals: unknown[] }) => {
    localStorage.setItem('rhythm_language_v1', lang);
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    localStorage.setItem('nimmapp_moments_v1', JSON.stringify(meals));
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  }, { lang: language, meals: proteinMeals });
}

test('mobile legacy German profile shows Arabic preliminary orientation after two entries', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await installReturningState(page, 'de');
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.getByRole('button', { name: 'اكتشافاتك', exact: true }).click();

  const card = page.getByTestId('early-personal-orientation');
  await expect(card).toBeVisible();
  await expect(page.getByTestId('orientation-status')).toHaveText('توجّه أولي');
  await expect(card).toContainText('الأسد · الجوع الكبير');
  await expect(card).toContainText('2/12 إدخال للوصول إلى تقدير أكثر ثباتاً');
  await expect(card).toContainText('قد يتغير مع كل إدخال جديد');
  await page.screenshot({
    path: testInfo.outputPath('early-orientation-mobile-legacy-de-ar.png'),
    fullPage: true,
  });
});

test('desktop legacy French profile shows Arabic preliminary orientation without crashing', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await installReturningState(page, 'fr');
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.getByRole('button', { name: 'اكتشافاتك', exact: true }).click();

  const card = page.getByTestId('early-personal-orientation');
  await expect(card).toBeVisible();
  await expect(page.getByTestId('orientation-status')).toHaveText('توجّه أولي');
  await expect(card).toContainText('الأسد · الجوع الكبير');
  await expect(card).toContainText('2/12 إدخال للوصول إلى تقدير أكثر ثباتاً');
  await expect(page.getByText('الثعلب · المشاعر والطعام')).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath('early-orientation-desktop-legacy-fr-ar.png'),
    fullPage: true,
  });
});
