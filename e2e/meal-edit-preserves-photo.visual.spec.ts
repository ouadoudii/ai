import { expect, test } from '@playwright/test';

const MOMENTS_KEY = 'nimmapp_moments_v1';
const PHOTO_URL = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

test.describe('meal photo preservation while editing', () => {
  test('text-only edit keeps the persisted meal photo after save and reload', async ({ page }) => {
    const originalTitle = 'Harira';

    await page.addInitScript(({ key, photoUrl, title }) => {
      localStorage.setItem('rhythm_language_v1', 'en');
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_intro_profile_v1', '{}');
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
      const now = new Date();
      if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify([{
        id: 'photo-edit-meal',
        title,
        label: 'Lunch',
        category: 'lunch',
        date: now.toISOString().slice(0, 10),
        time: now.toTimeString().slice(0, 5),
        location: 'Home',
        locationCategory: 'home',
        imageUrl: photoUrl,
        rating: 5,
        mood: 'satisfied',
        tags: [],
        createdAt: now.getTime(),
      }]));
    }, { key: MOMENTS_KEY, photoUrl: PHOTO_URL, title: originalTitle });

    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'التنقل الرئيسي' });
    const desktop = nav.getByRole('button', { name: 'لحظات', exact: true });
    if (await desktop.isVisible()) await desktop.click();
    else await page.getByTestId('mobile-moments-nav').click();
    await page.getByTestId('timeline-moment-photo-edit-meal').click();
    await page.getByRole('button', { name: 'تعديل' }).click();

    const editor = page.locator('input[autocomplete="off"]');
    await editor.fill(' with lemon');
    await editor.press('Enter');
    await page.getByRole('button', { name: 'حفظ التغييرات' }).click();

    await expect.poll(async () => page.evaluate((key) => {
      const moments = JSON.parse(localStorage.getItem(key) || '[]');
      return moments.find((moment: { id?: string }) => moment.id === 'photo-edit-meal')?.imageUrl || '';
    }, MOMENTS_KEY)).toBe(PHOTO_URL);

    const editedTitle = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '[]')[0].title, MOMENTS_KEY);
    expect(editedTitle).toContain('with lemon');
    await page.reload();
    expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '[]')[0].title, MOMENTS_KEY)).toBe(editedTitle);

    const persistedPhoto = await page.evaluate((key) => {
      const moments = JSON.parse(localStorage.getItem(key) || '[]');
      return moments.find((moment: { id?: string }) => moment.id === 'photo-edit-meal')?.imageUrl || '';
    }, MOMENTS_KEY);
    expect(persistedPhoto).toBe(PHOTO_URL);
  });
});
