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
  test(`#157 ${method} route: no invented stars or mood after Arabic save, detail and reload`, async ({ page }, info) => {
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
    expect(Object.hasOwn(stored[0], 'mood')).toBe(false);
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
    expect(Object.hasOwn(stored[0], 'mood')).toBe(false);
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


test('#157 actual photo upload and confirmed recognition preserve unknown opinions', async ({ page }, info) => {
  const mobile = info.project.name === 'android-arabic';
  await seed(page);
  await page.addInitScript(() => {
    class FakeWorker {
      onmessage: ((event: { data: unknown }) => void) | null = null;
      onerror: ((event: unknown) => void) | null = null;
      postMessage(message: { id: number; type: string }) {
        if (message.type !== 'image') return;
        setTimeout(() => this.onmessage?.({ data: { id: message.id, results: [{ label: 'vegetable couscous', score: 0.92 }] } }), 0);
      }
      terminate() {}
    }
    Object.defineProperty(window, 'Worker', { configurable: true, writable: true, value: FakeWorker });
  });
  await page.goto('/');
  await page.getByTestId(mobile ? 'primary-capture-button' : 'desktop-capture-button').click();
  await page.locator('[data-capture-method="photo"]').click();
  const editor = page.getByRole('dialog', { name: 'ماذا أكلت؟' });
  await editor.locator('input[type="file"][accept="image/*"]').setInputFiles({
    name: 'couscous.png', mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aJkAAAAASUVORK5CYII=', 'base64'),
  });
  await expect(editor.getByTestId('photo-recognition-suggestions')).toContainText('كسكس بالخضر');
  await editor.getByTestId('photo-suggestion-use-0').click();
  await expect(editor.getByRole('button', { name: 'حفظ الوجبة' })).toBeEnabled();
  await editor.getByRole('button', { name: 'حفظ الوجبة' }).click();
  await expect(editor).toHaveCount(0);
  const read = () => page.evaluate(key => JSON.parse(localStorage.getItem(key) || '[]')[0], STORAGE_KEY);
  const stored = await read();
  expect(stored.title).toContain('كسكس بالخضر');
  expect(stored.imageUrl).toMatch(/^data:image\/png;base64,/);
  expect(stored).not.toHaveProperty('rating');
  expect(stored).not.toHaveProperty('mood');
  await page.reload();
  const persisted = await read();
  expect(persisted).not.toHaveProperty('rating');
  expect(persisted).not.toHaveProperty('mood');
});

test('#155 check-in-generated meal has no invented stars, mood or post-meal energy', async ({ page }, info) => {
  // The personal midday check-in is intentionally unavailable before 11:00 local time.
  // Keep that production gate intact and run this journey at a deterministic available hour
  // on both desktop and Android, regardless of the CI runner's wall clock.
  await page.clock.setFixedTime(new Date('2026-10-30T13:00:00Z'));
  const mobile = info.project.name === 'android-arabic';
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'ar');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    localStorage.setItem('nimmapp_moments_v1', '[]');
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify({
      summary: 'خطة بسيطة', priorities: ['meal'], preferences: ['simple'],
      rawIntro: 'Daily meal', confirmedAt: Date.now(),
      firstPlan: { title: 'خطوة صغيرة', rationale: 'على مهلك', focusAreas: ['meal'], firstStep: 'سجل وجبة', phase: 'midday' },
    }));
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByTestId('personal-plan-start')).toBeEnabled();
  await page.getByTestId('personal-plan-start').click();
  const dialog = page.getByRole('dialog');
  const mealInput = dialog.getByPlaceholder('ماذا أكلت؟ ابحث أو اكتب…');
  await mealInput.fill('حريرة و atay');
  await mealInput.press('Enter');
  await dialog.getByRole('button', { name: 'خطوة أخيرة', exact: true }).click();
  await dialog.getByRole('button', { name: 'تم', exact: true }).click();
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key) || '[]').length, STORAGE_KEY)).toBe(1);
  const read = () => page.evaluate(key => JSON.parse(localStorage.getItem(key) || '[]')[0], STORAGE_KEY);
  const saved = await read();
  expect(saved.title).toBe('حريرة و atay');
  expect(saved).not.toHaveProperty('rating');
  expect(saved).not.toHaveProperty('mood');
  expect(saved).not.toHaveProperty('energyAfter');
  await page.reload();
  const persisted = await read();
  expect(persisted.title).toBe('حريرة و atay');
  expect(persisted).not.toHaveProperty('rating');
  expect(persisted).not.toHaveProperty('mood');
  await openTimeline(page, mobile);
  await page.getByTestId(`timeline-moment-${persisted.id}`).click();
  await expect(page.getByTestId('moment-detail-rating')).toHaveText('غير محدد');
});
