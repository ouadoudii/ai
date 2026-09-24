import { expect, test } from '@playwright/test';

test('generic daily check-in uses midday policy at 17:00', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    const RealDate = Date;
    const fixedNow = new RealDate(2026, 8, 24, 17, 0, 0, 0).getTime();
    class FixedDate extends RealDate {
      constructor(...args: ConstructorParameters<typeof Date>) {
        super(...(args.length ? args : [fixedNow]));
      }
      static now() { return fixedNow; }
    }
    Object.setPrototypeOf(FixedDate, RealDate);
    // @ts-expect-error Browser regression test intentionally fixes the wall clock.
    window.Date = FixedDate;

    localStorage.setItem('rhythm_language_v1', 'de');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    localStorage.setItem('nimmapp_moments_v1', '[]');
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify({
      summary: 'Profile', priorities: ['meal'], preferences: ['simple'], rawIntro: 'Phase policy', confirmedAt: fixedNow,
      firstPlan: { title: 'Plan', rationale: 'Rationale', focusAreas: ['meal'], firstStep: 'Check in', phase: 'midday' }
    }));
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  });

  await page.goto('/');
  await page.getByTestId('personal-plan-start').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Dein Mittag');
  await expect(dialog).not.toContainText('Dein Abend');
  await page.screenshot({ path: testInfo.outputPath('daily-checkin-shared-phase-policy.png'), fullPage: true });
});
