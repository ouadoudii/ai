import { expect, test } from '@playwright/test';

test('open generic daily check-in keeps its phase after wall-clock boundary', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    const RealDate = Date;
    let fixedNow = new RealDate(2026, 8, 24, 10, 59, 0, 0).getTime();
    class FixedDate extends RealDate {
      constructor(value?: string | number | Date) {
        super(value === undefined ? fixedNow : value instanceof RealDate ? value.getTime() : value);
      }
      static now() { return fixedNow; }
    }
    Object.setPrototypeOf(FixedDate, RealDate);
    window.Date = FixedDate as DateConstructor;
    (window as unknown as { __advanceCheckInClock?: () => void }).__advanceCheckInClock = () => {
      fixedNow = new RealDate(2026, 8, 24, 11, 1, 0, 0).getTime();
    };
    localStorage.setItem('rhythm_language_v1', 'de');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify({
      summary: 'Du möchtest deinen Essrhythmus und deine Energie besser verstehen.',
      priorities: ['Essrhythmus verstehen', 'Energie beobachten'],
      preferences: ['einfache Routinen'],
      rawIntro: 'Ich möchte verstehen, wie mein Essrhythmus meine Energie beeinflusst.',
      confirmedAt: fixedNow,
      firstPlan: {
        title: 'Morgen und Energie beobachten',
        rationale: 'Beobachte deinen Morgen, um deinen Rhythmus besser zu verstehen.',
        focusAreas: ['Morgen', 'Energie'],
        firstStep: 'Halte beim nächsten Check-in fest, wie dein Morgen läuft.',
        phase: 'morning',
      },
    }));
    localStorage.setItem('nimmapp_moments_v1', '[]');
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  });
  await page.goto('/');
  const start = page.getByTestId('personal-plan-start');
  await expect(start).toBeEnabled();
  await start.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Dein Morgen');
  await page.evaluate(() => (window as unknown as { __advanceCheckInClock: () => void }).__advanceCheckInClock());
  await page.getByTestId('personal-plan-start').evaluate((button) => button.setAttribute('data-boundary-rerender', '11:01'));
  await expect(dialog).toContainText('Dein Morgen');
  await expect(dialog).not.toContainText('Dein Mittag');
  await page.screenshot({ path: testInfo.outputPath('daily-checkin-session-phase.png'), fullPage: true });
});