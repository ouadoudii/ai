import { devices, expect, test, type Browser } from '@playwright/test';

const layouts = ['desktop', 'mobile'] as const;

async function openMomentDetail(browser: Browser, layout: typeof layouts[number]) {
  const context = await browser.newContext({
    ...devices[layout === 'desktop' ? 'Desktop Chrome' : 'Pixel 7'],
    baseURL: 'http://127.0.0.1:4173',
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'en');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify({ confirmedAt: Date.now() }));
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    localStorage.setItem('nimmapp_moments_v1', JSON.stringify([{
      id: 'accessible-detail', title: 'Harira محفوظة', label: 'Dinner', category: 'dinner',
      date: '2026-10-17', time: '19:15', location: 'Home', imageUrl: '', rating: 4,
      mood: 'satisfied', notes: 'Mixed-script personal note', tags: [], createdAt: Date.now(),
    }]));
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  if (layout === 'desktop') {
    const desktopTimeline = page.getByRole('navigation', { name: 'التنقل الرئيسي' })
      .getByRole('button', { name: 'لحظات', exact: true });
    await expect(desktopTimeline).toBeVisible();
    await desktopTimeline.click();
  } else {
    const mobileTimeline = page.getByTestId('mobile-moments-nav');
    await expect(mobileTimeline).toBeVisible();
    await mobileTimeline.click();
  }
  const opener = page.getByTestId('timeline-moment-accessible-detail');
  await expect(opener).toBeVisible();
  await opener.focus();
  await page.keyboard.press('Enter');
  return { context, page, opener };
}

for (const layout of layouts) {
  test(`#237 ${layout}: detail is a named, contained modal and Escape restores its opener`, async ({ browser }) => {
    const { context, page, opener } = await openMomentDetail(browser, layout);
    try {
      const dialog = page.getByRole('dialog', { name: 'Harira محفوظة' });
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveAttribute('aria-modal', 'true');
      const close = dialog.getByRole('button', { name: 'إغلاق', exact: true });
      await expect(close).toBeFocused();
      await expect.poll(() => opener.evaluate((element) => {
        let current: Element | null = element;
        while (current && current !== document.body) {
          if ('inert' in current && (current as HTMLElement).inert) return true;
          current = current.parentElement;
        }
        return false;
      })).toBe(true);

      await page.keyboard.press('Shift+Tab');
      await expect(dialog.getByRole('button', { name: 'حذف', exact: true })).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(close).toBeFocused();

      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      await expect(opener).toBeFocused();
    } finally {
      await context.close();
    }
  });

  test(`#237 ${layout}: visible close control restores the exact timeline row`, async ({ browser }) => {
    const { context, page, opener } = await openMomentDetail(browser, layout);
    try {
      const dialog = page.getByRole('dialog', { name: 'Harira محفوظة' });
      await dialog.getByRole('button', { name: 'إغلاق', exact: true }).click();
      await expect(dialog).toHaveCount(0);
      await expect(opener).toBeFocused();
    } finally {
      await context.close();
    }
  });
}
