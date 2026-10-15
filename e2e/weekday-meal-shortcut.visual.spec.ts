import { expect,test } from '@playwright/test';

const moments=['2026-09-23','2026-09-30','2026-10-07'].map((date,index)=>({
  id:`weekday-${index}`,title:'بيض مسلوق · Pain complet',label:'Snack',category:'snack',date,
  time:'09:00',location:'Home',locationCategory:'home',imageUrl:'',mood:'satisfied',
  tags:[],createdAt:index+1,
}));

for(const viewport of [
  {name:'desktop',width:1280,height:900,language:'en'},
  {name:'mobile',width:390,height:844,language:'ar'},
] as const)test(`weekday meal shortcut stays opt-in on ${viewport.name}`,async({page},testInfo)=>{
  await page.setViewportSize({width:viewport.width,height:viewport.height});
  // Keep the application on the same weekday as the seeded history so this
  // regression remains deterministic regardless of the calendar day in CI.
  await page.clock.setFixedTime(new Date('2026-10-14T12:00:00Z'));
  await page.addInitScript(({seed,language})=>{
    localStorage.setItem('nimmapp_moments_v1',JSON.stringify(seed));
    localStorage.setItem('rhythm_language_v1',language);
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('rhythm_voice_entry_seen_v1','true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  },{seed:moments,language:viewport.language});
  await page.goto('/');
  await page.getByTestId(viewport.name==='desktop'?'desktop-capture-button':'primary-capture-button').click();
  await page.locator('[data-capture-method="text"]').click();
  const suggestion=page.getByTestId('weekday-meal-shortcut');
  await expect(suggestion).toBeVisible();
  await expect(suggestion).toContainText('بيض مسلوق');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('nimmapp_moments_v1')||'[]').length)).toBe(3);
  await page.screenshot({path:testInfo.outputPath(`weekday-shortcut-before-${viewport.name}.png`),fullPage:true});
  await page.getByTestId('use-weekday-meal-shortcut').click();
  await expect(suggestion).toBeHidden();
  await expect(page.getByText('بيض مسلوق',{exact:true})).toBeVisible();
  await expect(page.getByText('Pain complet',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('nimmapp_moments_v1')||'[]').length)).toBe(3);
  await page.screenshot({path:testInfo.outputPath(`weekday-shortcut-after-${viewport.name}.png`),fullPage:true});
});
