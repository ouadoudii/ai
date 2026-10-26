import { devices, expect, test, type Browser } from '@playwright/test';

const layouts = ['desktop', 'mobile'] as const;

async function createPage(browser: Browser, layout: typeof layouts[number], withMoment = false) {
  const context = await browser.newContext({
    ...devices[layout === 'desktop' ? 'Desktop Chrome' : 'Pixel 7'],
    baseURL: 'http://127.0.0.1:4173',
  });
  const page = await context.newPage();
  await page.addInitScript((seedMoment) => {
    localStorage.setItem('rhythm_language_v1', 'en');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify({ confirmedAt: Date.now() }));
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    localStorage.setItem('nimmapp_moments_v1', seedMoment ? JSON.stringify([seedMoment]) : '[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  }, withMoment ? {
    id: 'editor-a11y', title: 'Accessibility bowl', label: 'Lunch', category: 'lunch',
    date: '2026-10-17', time: '12:30', location: 'Home', imageUrl: '', rating: 5,
    mood: 'satisfied', notes: 'Must survive cancellation', tags: [], createdAt: 1,
  } : null);
  await page.goto('/');
  return { context, page };
}

async function visibleCaptureButton(page: import('@playwright/test').Page, layout: typeof layouts[number]) {
  return layout === 'desktop' ? page.getByTestId('desktop-capture-button') : page.getByTestId('primary-capture-button');
}

for (const layout of layouts) {
  test(`#217 ${layout}: meal editor is named, contained, inert and safely cancellable`, async ({ browser }) => {
    const { context, page } = await createPage(browser, layout);
    try {
      const opener = await visibleCaptureButton(page, layout);
      await opener.click();
      const chooser = page.getByRole('dialog', { name: 'ما اللحظة التي تريد تسجيلها؟' });
      await chooser.locator('[data-capture-method="text"]').click();

      const dialog = page.getByRole('dialog', { name: 'ماذا أكلت؟' });
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveAttribute('aria-modal', 'true');
      await expect(dialog.getByRole('button', { name: 'إغلاق' })).toBeFocused();
      await expect.poll(() => opener.evaluate((element) => {
        let current: Element | null = element;
        while (current && current !== document.body) {
          if ('inert' in current && (current as HTMLElement).inert) return true;
          current = current.parentElement;
        }
        return false;
      })).toBe(true);

      const first = dialog.getByRole('button', { name: 'رجوع' });
      const last = dialog.getByRole('button', { name: 'حفظ الوجبة' });
      await first.focus();
      await page.keyboard.press('Shift+Tab');
      await expect(last).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(first).toBeFocused();

      const uploadButton = dialog.getByRole('button', { name: 'أضف صورتك' });
      await uploadButton.focus();
      // A cancelled native chooser reports an empty file list. Dispatch that
      // result directly so the regression covers app behavior without waiting
      // on browser/OS picker UI that cannot be dismissed in headless CI.
      await dialog.getByTestId('meal-photo-input').dispatchEvent('change');
      await expect(dialog).toBeVisible();
      await expect(uploadButton).toBeFocused();
      await expect.poll(async () => page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')))).toBe(true);

      const input = dialog.getByPlaceholder('ابدأ بالكتابة… مثلاً طاجين');
      await input.fill('Pasta');
      await page.keyboard.press('Escape');
      await expect(dialog).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      await expect(opener).toBeFocused();
      expect(await page.evaluate(() => JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]'))).toEqual([]);
    } finally {
      await context.close();
    }
  });

  test(`#217 ${layout}: Escape from edit preserves the stored meal`, async ({ browser }) => {
    const { context, page } = await createPage(browser, layout, true);
    try {
      const momentsNav = layout === 'desktop'
        ? page.getByRole('navigation', { name: 'التنقل الرئيسي' }).getByRole('button', { name: 'لحظات' })
        : page.getByTestId('mobile-moments-nav');
      await momentsNav.click();
      await page.getByTestId('timeline-moment-editor-a11y').click();
      await page.getByRole('dialog', { name: 'Accessibility bowl' }).getByRole('button', { name: 'تعديل' }).click();

      const editor = page.getByRole('dialog', { name: 'ماذا أكلت؟' });
      await expect(editor).toBeVisible();
      await expect(editor.getByRole('button', { name: 'إغلاق' })).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(editor).toHaveCount(0);
      await expect(await visibleCaptureButton(page, layout)).toBeFocused();
      const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]'));
      expect(stored).toHaveLength(1);
      expect(stored[0]).toMatchObject({ id: 'editor-a11y', title: 'Accessibility bowl', notes: 'Must survive cancellation' });
    } finally {
      await context.close();
    }
  });
}
