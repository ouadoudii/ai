import { test, expect, type Page } from '@playwright/test';
import { buildCoachFollowUps, type CoachLocale } from '../src/utils/coachFollowUps';

async function verifyChat(page: Page, locale: CoachLocale, nav: string) {
  await page.goto('/');
  // Follow the real first-visit guest journey before opening Cary.
  await page.locator('#account-language').selectOption('en');
  await page.getByRole('button', { name: /Start on this device/ }).click();
  await page.getByRole('button').last().click();
  await expect(page.getByTestId(nav)).toBeVisible();
  await page.locator('button[data-testid="language-picker-opener"]:visible').click();
  await page.locator('[data-language-option="' + locale + '"]').click();
  await page.getByTestId(nav).click();
  const question = 'How does sleep affect energy?';
  const composer = page.getByTestId('cary-chat-composer');
  await expect(composer).toBeVisible();
  await composer.fill(question);
  await composer.press('Enter');
  const followUps = page.getByTestId('cary-contextual-followups').last();
  await expect(followUps).toBeVisible();
  const next = buildCoachFollowUps(question, 'response', locale)[1];
  await expect(followUps.getByRole('button', { name: next, exact: true })).toBeVisible();
  await followUps.getByRole('button', { name: next, exact: true }).click();
  await expect(composer).toHaveValue(next);
}

test.describe('desktop coach', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });
  for (const locale of ['de', 'en', 'fr', 'ar'] as const) {
    test('renders ' + locale + ' follow-ups in the actual chat', async ({ page }) => {
      await verifyChat(page, locale, 'desktop-coach-nav');
    });
  }
});

test.describe('mobile coach', () => {
  for (const locale of ['ar', 'en'] as const) {
    test('renders ' + locale + ' follow-ups in the actual chat', async ({ page }) => {
      await verifyChat(page, locale, 'mobile-coach-nav');
    });
  }
});
