import { expect, test } from '@playwright/test';

const lunchHistory = [
  { id:'user-lunch-6', title:'Lunch six', label:'Lunch', category:'lunch', date:'2026-09-29', time:'14:05', rating:4, tags:[], createdAt:600 },
  { id:'user-lunch-5', title:'Lunch five', label:'Lunch', category:'lunch', date:'2026-09-28', time:'14:00', rating:4, tags:[], createdAt:500 },
  { id:'user-lunch-4', title:'Lunch four', label:'Lunch', category:'lunch', date:'2026-09-27', time:'13:55', rating:4, tags:[], createdAt:400 },
  { id:'user-lunch-3', title:'Lunch three', label:'Lunch', category:'lunch', date:'2026-09-26', time:'12:35', rating:4, tags:[], createdAt:300 },
  { id:'user-lunch-2', title:'Lunch two', label:'Lunch', category:'lunch', date:'2026-09-25', time:'12:30', rating:4, tags:[], createdAt:200 },
  { id:'user-lunch-1', title:'Lunch one', label:'Lunch', category:'lunch', date:'2026-09-24', time:'12:25', rating:4, tags:[], createdAt:100 },
];

async function installReturningState(page:any, language:'de'|'ar') {
  await page.addInitScript(({lang,meals}:{lang:string;meals:unknown[]}) => {
    localStorage.setItem('rhythm_language_v1', lang);
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    localStorage.setItem('nimmapp_moments_v1', JSON.stringify(meals));
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  }, { lang: language, meals: lunchHistory });
}

test('desktop German discoveries show a later personal lunch rhythm', async ({ page }, testInfo) => {
  await page.setViewportSize({ width:1440, height:900 });
  await installReturningState(page, 'de');
  await page.goto('/');
  await page.getByRole('button', { name:'Entdeckungen', exact:true }).click();
  const insight = page.getByTestId('meal-rhythm-shift-insight');
  await expect(insight).toBeVisible();
  await expect(insight).toContainText('Dein Essrhythmus verändert sich');
  await expect(page.getByTestId('meal-rhythm-shift-observation')).toContainText('Mittagessen liegt zuletzt etwa 90 Min. später');
  await page.screenshot({ path:testInfo.outputPath('meal-rhythm-shift-desktop-de.png'), fullPage:true });
});

test('mobile Arabic discoveries localize the same personal rhythm shift', async ({ page }, testInfo) => {
  await page.setViewportSize({ width:390, height:844 });
  await installReturningState(page, 'ar');
  await page.goto('/');
  await page.getByRole('button', { name:'اكتشافاتك', exact:true }).click();
  const insight = page.getByTestId('meal-rhythm-shift-insight');
  await expect(insight).toBeVisible();
  await expect(insight).toContainText('إيقاع وجباتك يتغيّر');
  await expect(page.getByTestId('meal-rhythm-shift-observation')).toContainText('الغداء');
  await expect(page.getByTestId('meal-rhythm-shift-observation')).toContainText('90');
  await page.screenshot({ path:testInfo.outputPath('meal-rhythm-shift-mobile-ar.png'), fullPage:true });
});
