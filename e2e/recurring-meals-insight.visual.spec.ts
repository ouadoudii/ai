import { expect, test } from '@playwright/test';

const moments = [
  { id:'real-1', title:'Harira', category:'dinner', date:'2026-09-25', time:'19:00', createdAt:10 },
  { id:'real-2', title:' harira ', category:'dinner', date:'2026-09-26', time:'19:00', createdAt:20 },
  { id:'real-3', title:'HARIRA', category:'dinner', date:'2026-09-27', time:'19:00', createdAt:30 },
  { id:'real-4', title:'Couscous', category:'lunch', date:'2026-09-25', time:'13:00', createdAt:40 },
  { id:'real-5', title:'Couscous', category:'lunch', date:'2026-09-28', time:'13:00', createdAt:50 },
  { id:'real-6', title:'One off', category:'lunch', date:'2026-09-29', time:'13:00', createdAt:60 },
  { id:'moment-1', title:'Demo meal', category:'lunch', date:'2026-09-29', time:'12:00', createdAt:999 },
  { id:'moment-2', title:'Demo meal', category:'lunch', date:'2026-09-29', time:'12:00', createdAt:998 },
];

const prepare = async (page:any) => page.addInitScript((seedMoments) => {
  localStorage.setItem('rhythm_language_v1','en');
  localStorage.setItem('cary_access_mode_v1','guest');
  localStorage.setItem('cary_onboarding_v2_complete','true');
  localStorage.setItem('rhythm_voice_entry_seen_v1','true');
  localStorage.setItem('nimmapp_moments_v1',JSON.stringify(seedMoments));
  localStorage.setItem('nimmapp_checkins_v1','[]');
  sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
}, moments);

for (const viewport of [{name:'desktop',width:1280,height:900},{name:'mobile',width:390,height:844}]) {
  test(`recurring meals are visible in personal discoveries on ${viewport.name}`, async ({page}, testInfo) => {
    await page.setViewportSize({width:viewport.width,height:viewport.height});
    await prepare(page);
    await page.goto('/');
    await page.getByRole('button',{name:'Discoveries',exact:true}).click();
    const insight = page.getByTestId('recurring-meals-insight');
    await expect(insight).toBeVisible();
    await expect(insight).toContainText('Your recurring meals');
    await expect(insight).toContainText('HARIRA');
    await expect(insight).toContainText('logged 3×');
    await expect(insight).toContainText('Couscous');
    await expect(insight).toContainText('logged 2×');
    await expect(insight).not.toContainText('One off');
    await expect(insight).not.toContainText('Demo meal');
    await expect(insight.getByTestId('recurring-meal-item')).toHaveCount(2);
    await page.screenshot({path:testInfo.outputPath(`recurring-meals-${viewport.name}.png`),fullPage:true});

    if (viewport.name === 'mobile') {
      await page.getByRole('button',{name:'Choose language',exact:true}).click();
      await page.locator('[data-language-option="ar"]').click();
      await expect(insight).toContainText('وجباتك المتكررة');
      await expect(insight).toContainText('سُجّلت 3×');
      await page.screenshot({path:testInfo.outputPath('recurring-meals-mobile-ar.png'),fullPage:true});
    }
  });
}

for (const viewport of [{name:'desktop',width:1280,height:900},{name:'mobile',width:390,height:844}]) {
  test(`personal meal memory preserves mixed-language wording on ${viewport.name}`, async ({page}, testInfo) => {
    await page.setViewportSize({width:viewport.width,height:viewport.height});
    await page.addInitScript(() => {
      localStorage.setItem('rhythm_language_v1','en');
      localStorage.setItem('cary_access_mode_v1','guest');
      localStorage.setItem('cary_onboarding_v2_complete','true');
      localStorage.setItem('rhythm_voice_entry_seen_v1','true');
      localStorage.setItem('nimmapp_checkin_auto_opened','true');
      localStorage.setItem('nimmapp_checkins_v1','[]');
      localStorage.setItem('nimmapp_moments_v1',JSON.stringify([
        {id:'arabic-1',title:'بيض مسلوق',category:'breakfast',date:'2026-10-01',time:'08:00',createdAt:1,tags:[]},
        {id:'arabic-2',title:'بيض، مسلوق!',category:'breakfast',date:'2026-10-02',time:'08:00',createdAt:2,tags:[]},
        {id:'demo-1',title:'Demo food',category:'breakfast',date:'2026-10-03',time:'08:00',createdAt:3,tags:['demo']},
        {id:'demo-2',title:'Demo food',category:'breakfast',date:'2026-10-04',time:'08:00',createdAt:4,tags:['demo']},
      ]));
    });
    await page.goto('/');
    await page.getByRole('button',{name:'Discoveries',exact:true}).click();
    const card=page.getByTestId('personal-meal-memory');
    await expect(card).toBeVisible();
    await expect(card).toContainText('بيض، مسلوق!');
    await expect(card).toContainText('2 ×');
    await expect(card).not.toContainText('Demo food');
    await expect(card.getByTestId('personal-meal-memory-item')).toHaveCount(1);
    await page.screenshot({path:testInfo.outputPath(`personal-memory-${viewport.name}.png`),fullPage:true});
  });
}
