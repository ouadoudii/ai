import { expect, test } from '@playwright/test';

test('evening missed midday collapses into one full-day voice recap',async({page},testInfo)=>{
  await page.setViewportSize({width:390,height:844});
  await page.addInitScript(()=>{
    localStorage.setItem('rhythm_language_v1','en');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('rhythm_voice_entry_seen_v1','true');
    localStorage.setItem('nimmapp_moments_v1','[]');
    localStorage.setItem('nimmapp_checkins_v1','[]');
    // Keep the valid returning-user intro profile from Playwright storageState.
    // This regression now protects the consolidated evening voice flow.
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  });

  await page.goto('/');
  const browserTime=await page.evaluate(()=>({now:Date.now(),hour:new Date().getHours()}));
  const hoursToEvening=(19-browserTime.hour+24)%24;
  await page.clock.setFixedTime(new Date(browserTime.now+hoursToEvening*60*60*1000));
  await page.reload();

  const voice=page.getByTestId('voice-home-mic');
  await expect(voice).toBeVisible();
  await expect(voice).toHaveAttribute('data-full-day-recap','true');
  await expect(voice).toContainText('Tell me about your whole day');

  // After 18:00, an incomplete day must not create a second evening/midday
  // catch-up path. One voice narration handles the missing parts together.
  await expect(page.getByRole('button').filter({hasText:'Good evening'})).toHaveCount(0);
  await expect(page.getByRole('heading',{name:'Want to add what you ate?'})).toHaveCount(0);
  await page.screenshot({path:testInfo.outputPath('evening-whole-day-voice-recap.png'),fullPage:true});

  await voice.click();
  await expect(page.getByRole('dialog')).toBeVisible();
});
