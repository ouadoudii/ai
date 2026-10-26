import {expect,test,type Page} from '@playwright/test';

async function seedReturningUser(page:Page){
  await page.addInitScript(()=>{
    localStorage.setItem('rhythm_language_v1','en');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('rhythm_voice_entry_seen_v1','true');
    localStorage.setItem('nimmapp_moments_v1','[]');
    localStorage.setItem('nimmapp_checkins_v1','[]');
    localStorage.setItem('rhythm_intro_profile_v1',JSON.stringify({
      summary:'Returning user',priorities:[],preferences:[],rawIntro:'Returning user',confirmedAt:1,
      firstPlan:{title:'Notice your rhythm',rationale:'Test',focusAreas:[],firstStep:'Notice today.',phase:'midday'},
    }));
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  });
}

for(const viewport of [
  {name:'desktop',width:1280,height:900},
  {name:'mobile',width:390,height:844},
] as const){
  test(`Today refreshes full-day recap after foregrounding across 18:00 (${viewport.name})`,async({page},testInfo)=>{
    await page.setViewportSize({width:viewport.width,height:viewport.height});
    await seedReturningUser(page);
    await page.goto('/');
    const beforeBoundary=await page.evaluate(()=>new Date(2026,8,18,17,59,0,0).getTime());
    await page.clock.setFixedTime(beforeBoundary);
    await page.reload();

    await expect(page.locator('html')).toHaveAttribute('lang','ar');
    await expect(page.locator('html')).toHaveAttribute('dir','rtl');
    const voice=page.getByTestId('voice-home-mic');
    await expect(voice).toHaveAttribute('data-full-day-recap','false');
    await expect(page.getByText('سجّل يومك',{exact:true})).toBeVisible();

    const afterBoundary=await page.evaluate(()=>new Date(2026,8,18,18,1,0,0).getTime());
    await page.clock.setFixedTime(afterBoundary);
    await page.evaluate(()=>window.dispatchEvent(new Event('focus')));

    await expect(voice).toHaveAttribute('data-full-day-recap','true');
    await expect(page.getByText('سجّل يومك',{exact:true})).toHaveCount(0);
    await page.screenshot({path:testInfo.outputPath(`today-full-day-resume-${viewport.name}.png`),fullPage:true});
  });
}
