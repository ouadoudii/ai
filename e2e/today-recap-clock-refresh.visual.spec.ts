import { expect, test } from '@playwright/test';

for(const viewport of [
  {name:'desktop',width:1280,height:900,language:'en'},
  {name:'mobile',width:390,height:844,language:'ar'},
] as const)test(`Today recap updates at 18:00 without remount on ${viewport.name}`,async({page},testInfo)=>{
  await page.setViewportSize({width:viewport.width,height:viewport.height});
  await page.clock.install({time:new Date(2026,9,15,17,59,0)});
  await page.addInitScript((language)=>{
    localStorage.setItem('rhythm_language_v1',language);
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('rhythm_voice_entry_seen_v1','true');
    localStorage.setItem('nimmapp_checkins_v1','[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  },viewport.language);
  await page.goto('/');
  const voice=page.getByTestId('voice-home-mic');
  await expect(voice).toHaveAttribute('data-full-day-recap','false');
  await page.clock.runFor(120_000);
  await expect(voice).toHaveAttribute('data-full-day-recap','true');
  await page.screenshot({path:testInfo.outputPath(`today-recap-after-boundary-${viewport.name}.png`),fullPage:true});
  await page.clock.setFixedTime(new Date(2026,9,15,17,30,0));
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await expect(voice).toHaveAttribute('data-full-day-recap','false');
  await page.screenshot({path:testInfo.outputPath(`today-recap-after-focus-${viewport.name}.png`),fullPage:true});
});
