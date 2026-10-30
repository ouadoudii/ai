import { expect, test, type Page } from '@playwright/test';

const STORAGE_KEY = 'nimmapp_moments_v1';
test.use({ timezoneId: 'UTC' });

async function seed(page: Page, rated = false) {
  await page.addInitScript(({ rated }) => {
    localStorage.setItem('rhythm_language_v1', 'ar');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify({ confirmedAt: 1 }));
    if (!sessionStorage.getItem('meal_rating_truth_seeded')) {
      const now = new Date();
      const existing = rated ? [{
        id: 'explicit-rating', title: 'حريرة', label: 'الغداء', category: 'lunch',
        date: now.toISOString().slice(0, 10), time: '12:30', location: 'البيت',
        locationCategory: 'home', imageUrl: '', rating: 4, mood: 'satisfied',
        tags: [], createdAt: now.getTime(),
      }] : [];
      localStorage.setItem('nimmapp_moments_v1', JSON.stringify(existing));
      localStorage.setItem('nimmapp_checkins_v1', '[]');
      sessionStorage.setItem('meal_rating_truth_seeded', 'true');
    }
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  }, { rated });
}

async function openTimeline(page: Page, mobile: boolean) {
  if (mobile) await page.getByTestId('mobile-moments-nav').click();
  else await page.getByRole('navigation', { name: 'التنقل الرئيسي' }).getByRole('button', { name: 'لحظات', exact: true }).click();
}

for (const method of ['text', 'photo'] as const) {
  test(`#157 ${method} entry: no invented stars after Arabic save, detail and reload`, async ({ page }, info) => {
    const mobile = info.project.name === 'android-arabic';
    await seed(page);
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await page.getByTestId(mobile ? 'primary-capture-button' : 'desktop-capture-button').click();
    await page.locator(`[data-capture-method="${method}"]`).click();
    const editor = page.getByRole('dialog', { name: 'ماذا أكلت؟' });
    await editor.getByPlaceholder('ابدأ بالكتابة… مثلاً طاجين').fill('كسكس بالخضر و atay');
    await editor.getByRole('button', { name: 'حفظ الوجبة' }).click();
    await expect(editor).toHaveCount(0);
    const getStored = () => page.evaluate(key => JSON.parse(localStorage.getItem(key) || '[]'), STORAGE_KEY);
    let stored = await getStored();
    expect(stored).toHaveLength(1);
    expect(stored[0].title).toBe('كسكس بالخضر و atay');
    expect(Object.hasOwn(stored[0], 'rating')).toBe(false);
    const id = stored[0].id as string;

    await openTimeline(page, mobile);
    await page.getByTestId(`timeline-moment-${id}`).click();
    await expect(page.getByTestId('moment-detail-rating')).toHaveText('غير محدد');
    await page.reload();
    await openTimeline(page, mobile);
    await page.getByTestId(`timeline-moment-${id}`).click();
    await expect(page.getByTestId('moment-detail-rating')).toHaveText('غير محدد');
    stored = await getStored();
    expect(Object.hasOwn(stored[0], 'rating')).toBe(false);
  });
}

test('#157 editing a genuinely rated Arabic meal preserves its 4/5 rating', async ({ page }, info) => {
  const mobile = info.project.name === 'android-arabic';
  await seed(page, true);
  await page.goto('/');
  await openTimeline(page, mobile);
  await page.getByTestId('timeline-moment-explicit-rating').click();
  await expect(page.getByTestId('moment-detail-rating')).toHaveText('4/5');
  await page.getByRole('button', { name: 'تعديل' }).click();
  const editor = page.getByRole('dialog', { name: 'ماذا أكلت؟' });
  await editor.getByPlaceholder('ابدأ بالكتابة… مثلاً طاجين').fill('حريرة بالليمون');
  await editor.getByRole('button', { name: 'حفظ التغييرات' }).click();
  await expect(editor).toHaveCount(0);
  const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '[]'), STORAGE_KEY);
  expect(stored).toHaveLength(1);
  expect(stored[0].rating).toBe(4);
  await page.reload();
  await openTimeline(page, mobile);
  await page.getByTestId('timeline-moment-explicit-rating').click();
  await expect(page.getByTestId('moment-detail-rating')).toHaveText('4/5');
});
