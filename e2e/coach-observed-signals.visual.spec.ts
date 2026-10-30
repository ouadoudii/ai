import { expect, test } from '@playwright/test';

test.use({ timezoneId: 'UTC' });

test('Arabic title-only capture keeps hunger and fullness unknown on Desktop and Android, including reload', async ({ page }, testInfo) => {
  const title = 'نص tajine ديال الدجاج بلا زيت';
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'ar');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    localStorage.setItem('nimmapp_moments_v1', '[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

  const mobile = testInfo.project.name === 'android-arabic';
  await page.getByTestId(mobile ? 'primary-capture-button' : 'desktop-capture-button').click();
  await page.locator('[data-capture-method="text"]').click();
  const editor = page.getByRole('dialog', { name: 'ماذا أكلت؟' });
  await editor.getByPlaceholder('ابدأ بالكتابة… مثلاً طاجين').fill(title);
  await editor.getByRole('button', { name: 'حفظ الوجبة' }).click();
  await expect(editor).toHaveCount(0);

  const verifyStored = async () => {
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]'));
    expect(stored).toHaveLength(1);
    expect(stored[0].title).toBe(title);
    expect(Object.hasOwn(stored[0], 'hungerLevel')).toBe(false);
    expect(Object.hasOwn(stored[0], 'fullnessLevel')).toBe(false);
    return stored[0].id as string;
  };
  const id = await verifyStored();
  const nav = page.getByTestId(mobile ? 'mobile-coach-nav' : 'desktop-coach-nav');
  const verifyCoach = async () => {
    await nav.click();
    await expect(page.getByTestId(`coach-recent-signals-${id}`))
      .toHaveText('الجوع: لم يُسجّل • الشبع: لم يُسجّل');
    await expect(page.getByText('سجّلت وجبتك. يمكنك إضافة شعورك بالجوع أو الشبع متى أحببت، دون أي ضغط.'))
      .toBeVisible();
    await verifyStored();
  };
  await verifyCoach();
  await page.reload();
  await verifyCoach();
});
