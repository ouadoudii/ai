import { expect, test } from '@playwright/test';

test('Arabic journal celebrates real days without streak pressure on desktop and Android', async ({ page }) => {
  await page.addInitScript(() => {
    const day = (daysAgo: number) => {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() - daysAgo);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    const meal = (id: string, date: string) => ({
      id, date, title: 'كسكس بالخضر', label: 'غداء', category: 'lunch',
      time: '13:00', location: '', locationCategory: 'home',
      imageUrl: '', rating: 5, mood: 'satisfied', tags: [], createdAt: Date.now(),
    });
    localStorage.setItem('rhythm_language_v1', 'ar');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    localStorage.setItem('nimmapp_moments_v1', JSON.stringify([
      meal('recent', day(0)), meal('earlier', day(5)), meal('duplicate', day(5)),
    ]));
  });
  await page.goto('/');
  const card = page.getByTestId('journal-days-card');
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('dir', 'rtl');
  await expect(card).toHaveAttribute('aria-label', 'سجلك على راحتك');
  await expect(card.getByTestId('journal-days-count')).toHaveText('2');
  await expect(card).toContainText('والأيام بلا تسجيل عادية أيضاً');
  await expect(card).not.toContainText(/أفضل سلسلة|أيام متتالية|خسرت|فشل|عقوبة|ممنوع/);
  await expect(page.getByTestId('logging-streak-card')).toHaveCount(0);
  await expect(page.getByTestId('logging-best-streak')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.dir)).toBe('rtl');

  const contrast = await card.locator('p').last().evaluate(element => {
    const rgb = (value: string) => (value.match(/[\\d.]+/g) || []).slice(0, 3).map(Number);
    const luminance = (channels: number[]) => {
      const values = channels.map(value => {
        const c = value / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
    };
    const fg = luminance(rgb(getComputedStyle(element).color));
    const bg = luminance(rgb(getComputedStyle(element.closest('section')!).backgroundColor));
    return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
  });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
});
