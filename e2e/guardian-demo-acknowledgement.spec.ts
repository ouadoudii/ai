import { expect, test } from '@playwright/test';

const profile = {
  summary: 'Rhythm', priorities: [], preferences: [], rawIntro: 'Rhythm',
  confirmedAt: 1, firstPlan: { title: 'Observe', rationale: 'Notice', focusAreas: [], firstStep: 'Capture', phase: 'midday' },
};

for (const viewport of [{ name: 'desktop', width: 1280, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
  test(`Guardian demo dismissals never overwrite real acknowledgements on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.addInitScript(({ profile }) => {
      if (sessionStorage.getItem('guardian_demo_ack_seeded') === 'true') return;
      sessionStorage.setItem('guardian_demo_ack_seeded', 'true');
      const now = new Date();
      const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
      localStorage.setItem('rhythm_language_v1', 'ar');
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
      localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify(profile));
      localStorage.setItem('nimmapp_moments_v1', '[]');
      localStorage.setItem('nimmapp_checkins_v1', JSON.stringify([{
        id: 'real-sleep', date, time: '07:00', timeOfDay: 'morning',
        sleep: { durationHours: 4.5, quality: 2, wakeFeeling: 'exhausted' },
        wellbeing: { energyLevel: 4 }, createdAt: Date.now() - 1000,
      }]));
      localStorage.removeItem('moment.guardian.acknowledged-occurrences.v1');
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    }, { profile });

    await page.goto('/');
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    const guardian = page.getByTestId('guardian');
    const key = 'moment.guardian.acknowledged-occurrences.v1';

    await expect(guardian).toContainText('4.5 ساعات نوم');
    await guardian.getByRole('button', { name: /إخفاء الفكرة/ }).first().click();
    await expect(guardian).not.toContainText('4.5 ساعات نوم');
    const personalAcknowledgements = await page.evaluate((key) => localStorage.getItem(key), key);
    expect(JSON.parse(personalAcknowledgements || '[]').length).toBeGreaterThan(0);

    await guardian.getByRole('button', { name: 'تجربة لطيفة' }).click();
    await guardian.getByRole('button', { name: /نوم أقل من المعتاد/ }).click();
    await expect(guardian.getByTestId('guardian-demo-notice')).toBeVisible();
    await expect(guardian).toContainText('5 ساعات نوم');
    await guardian.getByRole('button', { name: /إخفاء الفكرة/ }).first().click();
    await expect(guardian).not.toContainText('5 ساعات نوم');
    await expect(guardian.getByRole('status')).toContainText('خذ يومك على مهل');
    expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(personalAcknowledgements);

    await guardian.getByRole('button', { name: /الأكل تحت الضغط/ }).click();
    await guardian.getByRole('button', { name: /نوم أقل من المعتاد/ }).click();
    await expect(guardian).toContainText('5 ساعات نوم');
    expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(personalAcknowledgements);

    // Collapsing the scenario picker must not trap the user in a synthetic demo.
    const demoPicker = guardian.getByRole('button', { name: 'تجربة لطيفة' });
    await expect(demoPicker).toHaveAttribute('aria-expanded', 'true');
    await demoPicker.click();
    await expect(demoPicker).toHaveAttribute('aria-expanded', 'false');
    await expect(guardian.getByRole('button', { name: /إعادة ضبط/ })).toHaveCount(0);
    const exitDemo = guardian.getByTestId('guardian-demo-exit');
    await expect(exitDemo).toBeVisible();
    await expect(guardian.getByRole('note')).toContainText('هذه أمثلة وليست تسجيلاتك');
    await exitDemo.focus();
    await expect(exitDemo).toBeFocused();
    await exitDemo.press('Enter');
    await expect(guardian.getByTestId('guardian-demo-notice')).toHaveCount(0);
    // The disappearing exit button must return keyboard focus to the
    // persistent, clearly labeled Arabic simulator toggle.
    await expect(demoPicker).toBeFocused();
    await expect(demoPicker).toHaveAttribute('aria-expanded', 'false');
    // Pointer/touch exit must not forcibly move focus to the toggle.
    await demoPicker.click();
    await guardian.getByRole('button', { name: /نوم أقل من المعتاد/ }).click();
    await demoPicker.click();
    await guardian.getByTestId('guardian-demo-exit').click();
    await expect(guardian.getByTestId('guardian-demo-notice')).toHaveCount(0);
    await expect(demoPicker).not.toBeFocused();
    await expect(guardian).not.toContainText('4.5 ساعات نوم');
    expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(personalAcknowledgements);

    await page.reload();
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    await expect(page.getByTestId('guardian')).not.toContainText('4.5 ساعات نوم');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });
}

for (const viewport of [{ name: 'desktop', width: 1280, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
  test(`Guardian afternoon demo is helpful after hours without touching private history on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    // A fixed evening clock catches the prior silent demo outside 13:00–17:00.
    await page.clock.setFixedTime(new Date('2026-11-01T21:15:00'));
    await page.addInitScript(({ profile }) => {
      localStorage.setItem('rhythm_language_v1', 'ar');
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
      localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify(profile));
      localStorage.setItem('nimmapp_moments_v1', '[]');
      localStorage.setItem('nimmapp_checkins_v1', '[]');
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    }, { profile });
    await page.goto('/');
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    const guardian = page.getByTestId('guardian');
    await guardian.getByRole('button', { name: /اختبار تنبيه|تجربة لطيفة/ }).click();
    await guardian.getByRole('button', { name: /طاقة أقل بعد الظهر/ }).click();
    await expect(guardian.getByRole('note')).toContainText('هذه أمثلة وليست تسجيلاتك');
    await expect(guardian).toContainText('مساحة صغيرة لاستعادة نشاطك');
    await expect(guardian.getByRole('status')).toContainText('أفكار يمكنك تجاهلها');
    await expect(guardian.getByRole('button', { name: /إخفاء الفكرة/ }).first()).toBeVisible();
    await expect(guardian).not.toContainText(/فشل|عقاب|Ghrelin|28%/);
    await expect(guardian.locator('.animate-pulse, .animate-ping, [class*="bg-red"]')).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('nimmapp_checkins_v1'))).toBe('[]');
    await guardian.getByRole('button', { name: /إعادة ضبط/ }).click();
    await expect(guardian.getByTestId('guardian-demo-notice')).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });
}


for (const viewport of [{ name: 'desktop', width: 1280, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
  test(`Guardian remains supportive when private acknowledgement storage is denied on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.addInitScript(({ profile }) => {
      const now = new Date();
      const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
      localStorage.setItem('rhythm_language_v1', 'ar');
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
      localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify(profile));
      localStorage.setItem('nimmapp_moments_v1', '[]');
      localStorage.setItem('nimmapp_checkins_v1', JSON.stringify([{
        id: 'private-mode-sleep', date, time: '07:00', timeOfDay: 'morning',
        sleep: { durationHours: 4.5, quality: 2, wakeFeeling: 'exhausted' },
        wellbeing: { energyLevel: 4 }, createdAt: Date.now() - 1000,
      }]));
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');

      const key = 'moment.guardian.acknowledged-occurrences.v1';
      const originalGet = Storage.prototype.getItem;
      const originalSet = Storage.prototype.setItem;
      Storage.prototype.getItem = function (item: string) {
        if (item === key) throw new Error('SecurityError: acknowledgement read denied');
        return originalGet.call(this, item);
      };
      Storage.prototype.setItem = function (item: string, value: string) {
        if (item === key) throw new Error('SecurityError: acknowledgement write denied');
        return originalSet.call(this, item, value);
      };
    }, { profile });

    await page.goto('/');
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    const guardian = page.getByTestId('guardian');
    await expect(guardian).toContainText('4.5 ساعات نوم');
    await guardian.getByRole('button', { name: /إخفاء الفكرة/ }).first().click();
    await expect(guardian).not.toContainText('4.5 ساعات نوم');
    await expect(guardian.getByRole('status')).toContainText('خذ يومك على مهل');
    await expect(guardian).not.toContainText(/عقاب|فشل|Ghrelin|28%/);
    await expect(guardian.locator('.animate-pulse, .animate-ping, [class*="bg-red"]')).toHaveCount(0);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('nimmapp_checkins_v1') || '[]')[0].id)).toBe('private-mode-sleep');

    // Demo remains clearly labeled and can be exited without private storage.
    await guardian.getByRole('button', { name: 'تجربة لطيفة' }).click();
    await guardian.getByRole('button', { name: /نوم أقل من المعتاد/ }).click();
    await expect(guardian.getByRole('note')).toContainText('هذه أمثلة وليست تسجيلاتك');
    await guardian.getByRole('button', { name: /إعادة ضبط/ }).click();
    await expect(guardian.getByRole('note')).toHaveCount(0);

    // A storage-denied dismissal is intentionally session-only; it must not
    // corrupt personal journal entries or prevent a new session from loading.
    await page.reload();
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    await expect(page.getByTestId('guardian')).toContainText('4.5 ساعات نوم');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });
}


for (const viewport of [{ name: 'desktop', width: 1280, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
  test(`Guardian announces the selected Arabic demo example on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.addInitScript(({ profile }) => {
      localStorage.setItem('rhythm_language_v1', 'ar');
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
      localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify(profile));
      localStorage.setItem('nimmapp_moments_v1', '[]');
      localStorage.setItem('nimmapp_checkins_v1', '[]');
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    }, { profile });
    await page.goto('/');
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    const guardian = page.getByTestId('guardian');
    await guardian.getByRole('button', { name: 'تجربة لطيفة' }).click();
    const sleep = guardian.getByRole('button', { name: /نوم أقل من المعتاد/ });
    const meal = guardian.getByRole('button', { name: /الأكل تحت الضغط/ });
    const energy = guardian.getByRole('button', { name: /طاقة أقل بعد الظهر/ });
    for (const button of [sleep, meal, energy]) await expect(button).toHaveAttribute('aria-pressed', 'false');
    await sleep.focus();
    await expect(sleep).toBeFocused();
    await sleep.press('Enter');
    // The selected Arabic example remains exposed to screen readers on desktop and mobile.
    await expect(guardian.getByRole('button', { name: 'تجربة لطيفة' })).toHaveAttribute('aria-expanded', 'true');
    await expect(guardian.getByRole('group', { name: /تجربة اقتراحات الدعم/ })).toBeVisible();
    await expect(sleep).toHaveAttribute('aria-pressed', 'true');
    await expect(meal).toHaveAttribute('aria-pressed', 'false');
    await expect(guardian.getByRole('note')).toContainText('هذه أمثلة وليست تسجيلاتك');
    await meal.click();
    await expect(sleep).toHaveAttribute('aria-pressed', 'false');
    await expect(meal).toHaveAttribute('aria-pressed', 'true');
    await expect(energy).toHaveAttribute('aria-pressed', 'false');
    await guardian.getByRole('button', { name: /إعادة ضبط/ }).click();
    for (const button of [sleep, meal, energy]) await expect(button).toHaveAttribute('aria-pressed', 'false');
    await expect(guardian.getByRole('note')).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(guardian.locator('.animate-pulse, .animate-ping, [class*="bg-red"]')).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('nimmapp_moments_v1'))).toBe('[]');
    expect(await page.evaluate(() => localStorage.getItem('nimmapp_checkins_v1'))).toBe('[]');
  });
}
