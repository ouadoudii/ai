import { expect, test } from '@playwright/test';

for (const viewport of [{name:'mobile',width:390,height:844},{name:'desktop',width:1280,height:900}] as const) {
  test(`empty midday catch-up cannot create history on ${viewport.name}`, async ({page},testInfo) => {
    await page.setViewportSize(viewport);
    await page.addInitScript(() => {
      localStorage.setItem('rhythm_language_v1','de');
      localStorage.setItem('cary_access_mode_v1','guest');
      localStorage.setItem('cary_onboarding_v2_complete','true');
      localStorage.setItem('rhythm_voice_entry_seen_v1','true');
      localStorage.setItem('nimmapp_moments_v1','[]');
      localStorage.setItem('nimmapp_checkins_v1','[]');
      sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
    });
    await page.goto('/');
    const now=await page.evaluate(()=>Date.now());
    const currentHour=await page.evaluate(()=>new Date().getHours());
    const hoursTo17=(17-currentHour+24)%24;
    await page.clock.setFixedTime(new Date(now+hoursTo17*60*60*1000));
    await page.reload();

    const mobileCoach=page.getByTestId('mobile-coach-nav');
    if(await mobileCoach.isVisible()) await mobileCoach.click();
    else await page.getByRole('button',{name:/Cary|Coach/i}).first().click();

    const startCheckInCandidates=page.getByRole('button',{name:/Check-in starten/i});
    let startCheckIn=startCheckInCandidates.first();
    for(let index=0;index<await startCheckInCandidates.count();index+=1){
      const candidate=startCheckInCandidates.nth(index);
      if(await candidate.isVisible()){
        startCheckIn=candidate;
        break;
      }
    }
    await expect(startCheckIn).toBeVisible();
    await startCheckIn.click();
    const dialog=page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const add=dialog.getByRole('button',{name:'Moment hinzufügen'});
    await expect(add).toBeDisabled();
    await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('nimmapp_checkins_v1')||'[]').length)).toBe(0);
    await page.screenshot({path:testInfo.outputPath(`catchup-empty-${viewport.name}.png`),fullPage:true});

    await dialog.getByRole('textbox').fill('Später gegessen');
    await expect(add).toBeEnabled();
  });
}
