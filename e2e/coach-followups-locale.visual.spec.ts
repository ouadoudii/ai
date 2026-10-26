import { test, expect, type Page } from '@playwright/test';
import { buildCoachFollowUps, type CoachLocale } from '../src/utils/coachFollowUps';

async function verifyChat(page: Page, legacyLocale: CoachLocale, nav: string) {
  await page.addInitScript(({ locale }) => {
    localStorage.setItem('rhythm_language_v1', locale);
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    localStorage.setItem('nimmapp_moments_v1', '[]');
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  }, { locale: legacyLocale });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByTestId(nav)).toBeVisible();
  await page.getByTestId(nav).click();

  const question = 'How does sleep affect energy?';
  const composer = page.getByTestId('cary-chat-composer');
  await expect(composer).toBeVisible();
  await composer.fill(question);
  await composer.press('Enter');

  const followUps = page.getByTestId('cary-contextual-followups').last();
  await expect(followUps).toBeVisible();
  const next = buildCoachFollowUps(question, 'response', 'ar')[1];
  await expect(followUps.getByRole('button', { name: next, exact: true })).toBeVisible();
  await followUps.getByRole('button', { name: next, exact: true }).click();
  await expect(composer).toHaveValue(next);
}

test.describe('desktop coach', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });
  for (const legacyLocale of ['de', 'en', 'fr', 'ar'] as const) {
    test('legacy ' + legacyLocale + ' renders Arabic follow-ups in the actual chat', async ({ page }) => {
      await verifyChat(page, legacyLocale, 'desktop-coach-nav');
    });
  }
});

test.describe('mobile coach', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  for (const legacyLocale of ['ar', 'en'] as const) {
    test('legacy ' + legacyLocale + ' renders Arabic follow-ups in the actual chat', async ({ page }) => {
      await verifyChat(page, legacyLocale, 'mobile-coach-nav');
    });
  }
});
