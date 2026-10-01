import { test, expect } from '@playwright/test';

const moments = [
  { id:'streak-a', title:'Breakfast', category:'breakfast', date:'2026-09-29', time:'08:00', createdAt:1 },
  { id:'streak-b', title:'Lunch', category:'lunch', date:'2026-09-30', time:'12:00', createdAt:2 },
  { id:'streak-c', title:'Dinner', category:'dinner', date:'2026-10-01', time:'19:00', createdAt:3 },
];

async function seed(page:any) {
  await page.addInitScript((seeded:any) => {
    localStorage.setItem('nimmapp_moments_v1', JSON.stringify(seeded));
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    localStorage.setItem('nimmapp_profile_onboarding_v1', 'completed');
  }, moments);
}

for (const viewport of [
  { name:'desktop', width:1280, height:900 },
  { name:'mobile', width:390, height:844 },
]) {
  test(`shows a real three-day logging streak on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width:viewport.width, height:viewport.height });
    await seed(page);
    await page.goto('/');
    const card = page.getByTestId('logging-streak-card');
    await expect(card).toBeVisible();
    await expect(page.getByTestId('logging-streak-count')).toHaveText('3');
    await expect(card).toContainText(/days in a row/i);
    await expect(card).toHaveScreenshot(`logging-streak-${viewport.name}.png`);
  });
}
