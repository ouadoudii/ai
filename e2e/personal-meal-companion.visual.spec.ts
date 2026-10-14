import { expect,test } from '@playwright/test';

const seedMoments=[
  {id:'meal-1',title:'بيض مسلوق · Pain complet',label:'Meal',category:'snack',date:'2026-10-10',time:'09:00',location:'Home',locationCategory:'home',imageUrl:'',mood:'satisfied',tags:[],createdAt:10},
  {id:'meal-2',title:'بيض مسلوق · pain complet',label:'Meal',category:'snack',date:'2026-10-11',time:'09:00',location:'Home',locationCategory:'home',imageUrl:'',mood:'satisfied',tags:[],createdAt:20},
  {id:'meal-3',title:'بيض مسلوق · Pain complet',label:'Meal',category:'snack',date:'2026-10-12',time:'09:00',location:'Home',locationCategory:'home',imageUrl:'',mood:'satisfied',tags:[],createdAt:30},
];

for(const viewport of [
  {name:'desktop',width:1280,height:900,language:'en'},
  {name:'mobile',width:390,height:844,language:'ar'},
] as const)test(`personal meal companion is opt-in on ${viewport.name}`,async({page},testInfo)=>{
  await page.setViewportSize({width:viewport.width,height:viewport.height});
  await page.addInitScript(({moments,language})=>{
    localStorage.setItem('nimmapp_moments_v1',JSON.stringify(moments));
    localStorage.setItem('rhythm_language_v1',language);
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('rhythm_voice_entry_seen_v1','true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  },{moments:seedMoments,language:viewport.language});
  await page.goto('/');
  await page.getByTestId(viewport.name==='desktop'?'desktop-capture-button':'primary-capture-button').click();
  await page.locator('[data-capture-method="text"]').click();
  const input=page.locator('input[autocomplete="off"]');
  await input.fill('بيض مسلوق');
  await input.press('Enter');
  const suggestion=page.getByTestId('personal-meal-companion-suggestion');
  await expect(suggestion).toBeVisible();
  await expect(suggestion).toContainText('Pain complet');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('nimmapp_moments_v1')||'[]').length)).toBe(3);
  await page.screenshot({path:testInfo.outputPath(`personal-meal-companion-before-${viewport.name}.png`),fullPage:true});
  await suggestion.getByRole('button').click();
  await expect(suggestion).toBeHidden();
  await expect(page.getByText('Pain complet',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('nimmapp_moments_v1')||'[]').length)).toBe(3);
  await page.screenshot({path:testInfo.outputPath(`personal-meal-companion-after-${viewport.name}.png`),fullPage:true});
});
