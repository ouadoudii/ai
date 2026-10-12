import { expect, test } from '@playwright/test';
import { momentCardCopy, momentCardDate } from '../src/utils/momentCardCopy';

test('reusable meal card controls remain translated for all supported browser locales', async ({ page }) => {
 await page.goto('/');
 for(const language of ['de','en','fr','ar'] as const){
  const copy=momentCardCopy[language];
  expect(copy.edit).toBeTruthy();
  expect(copy.remove).toBeTruthy();
  expect(copy.favorite).not.toBe(copy.unfavorite);
  expect(momentCardDate('2026-10-14',language)).not.toBe('2026-10-14');
 }
 await expect(page.locator('body')).toBeVisible();
});
