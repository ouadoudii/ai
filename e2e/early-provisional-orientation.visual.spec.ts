import { expect, test } from '@playwright/test';

const proteinMeals = [
  { id:'user-meal-1', title:'Poulet grillé avec riz', label:'Déjeuner', category:'lunch', date:'2026-09-16', time:'12:30', rating:4, tags:[], createdAt:1, nutrition:{protein:32} },
  { id:'user-meal-2', title:'Yaourt et noix', label:'Collation', category:'snack', date:'2026-09-16', time:'16:00', rating:4, tags:[], createdAt:2, nutrition:{protein:26} },
];

async function installReturningState(page:any, language:'de'|'fr') {
  await page.addInitScript(({lang,meals}:{lang:string;meals:unknown[]}) => {
    localStorage.setItem('rhythm_language_v1', lang);
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    localStorage.setItem('nimmapp_moments_v1', JSON.stringify(meals));
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  }, { lang: language, meals: proteinMeals });
}

test('mobile German discoveries show a useful preliminary orientation after two entries', async ({ page }, testInfo) => {
  await page.setViewportSize({ width:390, height:844 });
  await installReturningState(page, 'de');
  await page.goto('/');
  await page.getByRole('button', { name:'Entdeckungen', exact:true }).click();
  const card = page.getByTestId('early-personal-orientation');
  await expect(card).toBeVisible();
  await expect(page.getByTestId('orientation-status')).toHaveText(/Vorläufige Orientierung/);
  await expect(card).toContainText('Löwe · Großer Hunger');
  await expect(card).toContainText('2/12 Einträge');
  await expect(card).toContainText('jedem neuen Eintrag verändern');
  await page.screenshot({ path:testInfo.outputPath('early-orientation-mobile-de.png'), fullPage:true });
});

test('desktop French discoveries render the localized preliminary orientation without crashing', async ({ page }, testInfo) => {
  await page.setViewportSize({ width:1440, height:900 });
  await installReturningState(page, 'fr');
  await page.goto('/');
  await page.getByRole('button', { name:'Découvertes', exact:true }).click();
  const card = page.getByTestId('early-personal-orientation');
  await expect(card).toBeVisible();
  await expect(page.getByTestId('orientation-status')).toHaveText(/Orientation provisoire/);
  await expect(card).toContainText('Lion · Grande faim');
  await expect(card).toContainText('2/12 entrées');
  await expect(page.getByText('Renard · Émotions & alimentation')).toBeVisible();
  await page.screenshot({ path:testInfo.outputPath('early-orientation-desktop-fr.png'), fullPage:true });
});
