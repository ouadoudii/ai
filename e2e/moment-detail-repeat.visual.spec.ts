import { expect, test } from '@playwright/test';

// Regression: repeating from an old detail must create a fresh persisted occurrence on both layouts.
for (const viewport of [{ name: 'mobile', width: 390, height: 844 }, { name: 'desktop', width: 1280, height: 900 }]) {
  test(`repeat an older meal from moment detail persists a fresh copy - ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.addInitScript(() => {
      localStorage.setItem('rhythm_language_v1', 'en');
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
      localStorage.setItem('rhythm_intro_profile_v1', '{}');
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
      localStorage.setItem('nimmapp_moments_v1', JSON.stringify([{
        id: 'detail-repeat-source', title: 'بيض مسلوق + pain complet', label: 'Breakfast', category: 'breakfast',
        date: '2026-09-20', time: '08:15', location: 'Old café', locationCategory: 'restaurant', imageUrl: '',
        rating: 2, mood: 'comfort', hungerLevel: 5, fullnessLevel: 4, energyAfter: 'sluggish',
        notes: 'old context must not repeat', tags: ['old-context'], isFavorite: true, createdAt: 1,
      }]));
    });

    await page.goto('/');
    if (viewport.name === 'mobile') {
      await page.getByTestId('mobile-moments-nav').click();
    } else {
      await page.getByTestId('desktop-moments-nav').click();
    }
    await page.getByTestId('moments-timeline').getByText('بيض مسلوق + pain complet', { exact: true }).click();
    await expect(page.getByTestId('moment-detail-repeat')).toBeVisible();
    await page.screenshot({ path: `test-results/moment-detail-repeat-${viewport.name}-before.png`, fullPage: true });
    await page.getByTestId('moment-detail-repeat').click();

    await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]').length)).toBe(2);
    const repeated = await page.evaluate(() => JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]')[0]);
    expect(repeated.title).toBe('بيض مسلوق + pain complet');
    expect(repeated.id).not.toBe('detail-repeat-source');
    expect(repeated.location).toBe('');
    expect(repeated.rating).toBeUndefined();
    expect(repeated.mood).toBeUndefined();
    expect(repeated.hungerLevel).toBeUndefined();
    expect(repeated.fullnessLevel).toBeUndefined();
    expect(repeated.energyAfter).toBeUndefined();
    expect(repeated.notes).toBeUndefined();
    expect(repeated.isFavorite).toBe(false);

    await page.reload();
    if (viewport.name === 'mobile') {
      await page.getByTestId('mobile-moments-nav').click();
    } else {
      await page.getByTestId('desktop-moments-nav').click();
    }
    await expect(page.getByTestId('moments-timeline')).toContainText('بيض مسلوق + pain complet');
    await page.screenshot({ path: `test-results/moment-detail-repeat-${viewport.name}-after.png`, fullPage: true });
  });
}
