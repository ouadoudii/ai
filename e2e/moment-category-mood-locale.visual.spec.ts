import { test, expect } from '@playwright/test';
import { momentCategoryLabels, momentMoodLabels } from '../src/utils/momentCardCopy';

test('MomentCard category and mood translations cover all supported languages', async ({ page }) => {
 await page.goto('/');
 await expect(page.locator('body')).toBeVisible();
 for (const language of ['de','en','fr','ar'] as const) {
  expect(momentCategoryLabels[language].breakfast).toBeTruthy();
  expect(momentMoodLabels[language].satisfied).toBeTruthy();
 }
});
