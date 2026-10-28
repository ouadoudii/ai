import { expect, test, type Page } from '@playwright/test';

type Layout = { name: 'desktop' | 'mobile'; width: number; height: number };
const layouts: Layout[] = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

async function prepare(page: Page, withMeal: boolean, olderMeal = false) {
  await page.addInitScript(({ withMeal, olderMeal }) => {
    const now = new Date();
    if (olderMeal) now.setDate(now.getDate() - 45);
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    localStorage.setItem('rhythm_language_v1', 'fr');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify({
      summary: 'Journal', priorities: [], preferences: [], rawIntro: 'Journal',
      confirmedAt: Date.now(),
      firstPlan: { title: 'Observe', rationale: 'Notice', focusAreas: [], firstStep: 'Capture', phase: 'midday' },
    }));
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    localStorage.setItem('nimmapp_moments_v1', JSON.stringify(withMeal ? [{
      id: 'calm-harira', title: 'حريرة Harira', label: 'عشاء', category: 'dinner',
      date, time: '19:00', location: 'الرباط', locationCategory: 'home',
      imageUrl: '', rating: 5, mood: 'comfort', nutrition: { calories: 860 },
      tags: ['Darija', 'avec pain'], createdAt: Date.now(),
    }] : []));
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  }, { withMeal, olderMeal });
}

async function openJournal(page: Page, layout: Layout) {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  if (layout.name === 'mobile') await page.getByTestId('mobile-moments-nav').click();
  else await page.getByRole('navigation', { name: 'التنقل الرئيسي' }).getByRole('button', { name: 'لحظات', exact: true }).click();
  await expect(page.getByTestId('moments-timeline')).toBeVisible();
}

for (const layout of layouts) {
  test(`P0 calm Arabic journal keeps meal history without calorie and star pressure on ${layout.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: layout.width, height: layout.height });
    await prepare(page, true);
    await openJournal(page, layout);
    const timeline = page.getByTestId('moments-timeline');
    const row = page.getByTestId('timeline-moment-calm-harira');
    await expect(row).toBeVisible();
    await expect(row).toContainText('حريرة Harira');
    await expect(row.getByRole('img', { name: 'طعام مريح' })).toBeVisible();
    await expect(timeline).not.toContainText(/kcal|سعرة حرارية|calories/i);
    await expect(timeline.locator('svg.lucide-star, svg.lucide-flame')).toHaveCount(0);
    await expect.poll(async () => page.evaluate(() => {
      const meals = JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]');
      const saved = meals.find((meal: { id: string }) => meal.id === 'calm-harira');
      return { rating: saved?.rating, calories: saved?.nutrition?.calories };
    })).toEqual({ rating: 5, calories: 860 });
    await row.focus();
    await expect(row).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog', { name: 'حريرة Harira' })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`calm-journal-${layout.name}.png`), fullPage: true });
  });

  test(`P0 Arabic empty journal offers a gentle, accessible next step on ${layout.name}`, async ({ page }) => {
    await page.setViewportSize({ width: layout.width, height: layout.height });
    await prepare(page, false);
    await openJournal(page, layout);
    const empty = page.getByTestId('timeline-empty-journal');
    await expect(empty).toBeVisible();
    await expect(empty).toContainText('يومياتك هنا متى أحببت');
    const add = empty.getByRole('button', { name: 'إضافة تدوينة' });
    await expect(add).toBeVisible();
    await add.focus();
    await expect(add).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-capture-method="text"]')).toBeVisible();
    await page.locator('[data-capture-method="text"]').click();
    await expect(page.getByRole('dialog', { name: 'ماذا أكلت؟' })).toBeVisible();
  });
  test(`P0 older Arabic journal entries stay discoverable after a quiet 7/30-day period on ${layout.name}`, async ({ page }) => {
    await page.setViewportSize({ width: layout.width, height: layout.height });
    await prepare(page, true, true);
    await openJournal(page, layout);
    const range = page.getByTestId('timeline-date-range');
    const row = page.getByTestId('timeline-moment-calm-harira');
    await expect(row).toBeVisible();
    await range.selectOption('30d');
    const empty = page.getByTestId('timeline-range-empty');
    await expect(empty).toHaveAttribute('role', 'status');
    await expect(empty).toContainText('تدويناتك السابقة محفوظة');
    await expect(empty).toContainText('وهذا طبيعي');
    await expect(row).toHaveCount(0);
    await range.selectOption('7d');
    await expect(empty).toBeVisible();
    const showAll = page.getByTestId('timeline-range-reset');
    await expect(showAll).toHaveAccessibleName('عرض كل الأيام');
    await showAll.focus();
    await expect(showAll).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(range).toHaveValue('all');
    await expect(empty).toHaveCount(0);
    await expect(row).toContainText('حريرة Harira');
    await expect.poll(async () => page.evaluate(() => {
      const meals = JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]');
      return { count: meals.length, id: meals[0]?.id, rating: meals[0]?.rating, calories: meals[0]?.nutrition?.calories };
    })).toEqual({ count: 1, id: 'calm-harira', rating: 5, calories: 860 });
  });
}
