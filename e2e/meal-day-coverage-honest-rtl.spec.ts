import { expect, test } from '@playwright/test';

test('Arabic seven-day journal shows real dates, not a fake streak, on desktop and Android', async ({ page }) => {
  await page.addInitScript(() => {
    const key = (daysAgo: number) => {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() - daysAgo);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    const meal = (id: string, date: string) => ({
      id, date, title: 'طاجين بالخضر', label: 'غداء', category: 'lunch', time: '13:00',
      location: '', locationCategory: 'home', imageUrl: '', rating: 5,
      mood: 'satisfied', tags: [], createdAt: Date.now(),
    });
    localStorage.setItem('rhythm_language_v1', 'ar');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    localStorage.setItem('nimmapp_moments_v1', JSON.stringify([
      meal('real-today', key(0)),
      meal('real-three-days-ago', key(3)),
      meal('real-same-day-duplicate', key(3)),
    ]));
  });

  await page.goto('/');
  const card = page.getByTestId('meal-day-coverage');
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('dir', 'rtl');
  await expect(card).toContainText('سجّلت لحظات في 2 من آخر 7 أيام');
  await expect(card.getByTestId('meal-day-mark')).toHaveCount(7);
  await expect(card.locator('[data-logged="true"]')).toHaveCount(2);
  await expect(card.locator('[data-logged="false"]')).toHaveCount(5);

  const dates = await page.evaluate(() => {
    const key = (daysAgo: number) => {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() - daysAgo);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    return { today: key(0), threeDaysAgo: key(3), yesterday: key(1) };
  });
  await expect(card.locator(`[data-date="${dates.today}"]`)).toHaveAttribute('data-logged', 'true');
  await expect(card.locator(`[data-date="${dates.threeDaysAgo}"]`)).toHaveAttribute('data-logged', 'true');
  await expect(card.locator(`[data-date="${dates.yesterday}"]`)).toHaveAttribute('data-logged', 'false');

  const labels = await card.locator('time').evaluateAll(nodes => nodes.map(node => node.getAttribute('aria-label') || ''));
  expect(labels.filter(label => label.includes('لا يوجد تسجيل، وهذا طبيعي'))).toHaveLength(5);
  expect(labels.filter(label => label.includes('سجّلت لحظة'))).toHaveLength(2);
  await expect(card).not.toContainText(/فشل|عقوبة|سلسلة متواصلة|ممنوع/);
  expect(await page.evaluate(() => document.documentElement.dir)).toBe('rtl');
  const contrast = await card.locator('p').last().evaluate(element => {
    const parse = (value: string) => (value.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
    const luminance = (rgb: number[]) => {
      const channels = rgb.map(value => {
        const channel = value / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      });
      return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
    };
    const fg = luminance(parse(getComputedStyle(element).color));
    const bg = luminance(parse(getComputedStyle(element.closest('section')!).backgroundColor));
    return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
  });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
});
