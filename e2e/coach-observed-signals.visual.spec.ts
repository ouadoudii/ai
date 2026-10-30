import { expect, test } from '@playwright/test';

test.use({ timezoneId: 'UTC' });

test('Arabic Coach preserves unreported meal sensations on Desktop and Android, including reload', async ({ page }, testInfo) => {
  const title = 'نص tajine ديال الدجاج بلا زيت';
  await page.addInitScript((mealTitle) => {
    localStorage.setItem('rhythm_language_v1', 'ar');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    localStorage.setItem('nimmapp_moments_v1', JSON.stringify([{
      id: 'title-only', title: mealTitle, label: 'غداء', category: 'lunch',
      date: '2026-10-30', time: '13:00', location: 'الدار',
      locationCategory: 'home', imageUrl: '', mood: 'satisfied',
      tags: [], createdAt: Date.now(),
    }]));
  }, title);
  await page.goto('/');
  const nav = page.getByTestId(testInfo.project.name === 'android-arabic' ? 'mobile-coach-nav' : 'desktop-coach-nav');
  const verify = async () => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await nav.click();
    const signals = page.getByTestId('coach-recent-signals-title-only');
    await expect(signals).toHaveText('الجوع: لم يُسجّل • الشبع: لم يُسجّل');
    await expect(page.getByText('سجّلت وجبتك. يمكنك إضافة شعورك بالجوع أو الشبع متى أحببت، دون أي ضغط.')).toBeVisible();
    expect(await page.evaluate(() => {
      const stored = JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]')[0];
      return [stored.title, Object.hasOwn(stored, 'hungerLevel'), Object.hasOwn(stored, 'fullnessLevel')];
    })).toEqual([title, false, false]);
  };
  await verify();
  await page.reload();
  await verify();
});
