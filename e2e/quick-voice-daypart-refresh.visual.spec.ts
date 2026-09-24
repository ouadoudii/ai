import { expect, test } from '@playwright/test';

test('quick Voice refreshes daypart after a long-lived mobile session crosses 18:00', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    const RealDate = Date;
    const initialNow = new RealDate(2026, 8, 24, 17, 55, 0, 0).getTime();
    (window as typeof window & { __quickVoiceNow?: number }).__quickVoiceNow = initialNow;
    class FixedDate extends RealDate {
      constructor(...args: ConstructorParameters<typeof Date>) {
        const now = (window as typeof window & { __quickVoiceNow?: number }).__quickVoiceNow ?? initialNow;
        super(args.length ? args[0] : now);
      }
      static now() {
        return (window as typeof window & { __quickVoiceNow?: number }).__quickVoiceNow ?? initialNow;
      }
    }
    Object.setPrototypeOf(FixedDate, RealDate);
    window.Date = FixedDate as DateConstructor;

    localStorage.setItem('rhythm_language_v1', 'de');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    localStorage.setItem('nimmapp_moments_v1', '[]');
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify({
      summary: 'Profile', priorities: ['meal'], preferences: ['simple'], rawIntro: 'Quick voice boundary', confirmedAt: initialNow,
      firstPlan: { title: 'Plan', rationale: 'Rationale', focusAreas: ['meal'], firstStep: 'Check in', phase: 'evening' }
    }));
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  });

  await page.goto('/');
  await expect(page.getByText('AFTERNOON CHECK-IN')).toBeVisible();

  await page.evaluate(() => {
    (window as typeof window & { __quickVoiceNow?: number }).__quickVoiceNow = new Date(2026, 8, 24, 18, 5, 0, 0).getTime();
    window.dispatchEvent(new Event('focus'));
  });

  await expect(page.getByText('EVENING CHECK-IN')).toBeVisible();
  await expect(page.getByText('AFTERNOON CHECK-IN')).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('quick-voice-evening-after-focus.png'), fullPage: true });
});
