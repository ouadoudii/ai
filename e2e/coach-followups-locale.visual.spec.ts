import { test, expect } from '@playwright/test';
import { buildCoachFollowUps } from '../src/utils/coachFollowUps';
test('Cary follow-up suggestions use supported language text', async ({page})=>{
 await page.goto('/');
 await expect(page.locator('body')).toBeVisible();
 expect(buildCoachFollowUps('sleep','reply','en')[1]).toContain('next step');
 expect(buildCoachFollowUps('sleep','reply','ar')[1]).toMatch(/[\u0600-\u06ff]/);
});
