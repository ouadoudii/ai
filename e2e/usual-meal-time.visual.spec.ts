import { test, expect } from '@playwright/test';

for (const viewport of [{name:'desktop',width:1280,height:900},{name:'mobile',width:390,height:844}]) {
  test(`usual meal time requires explicit choice on ${viewport.name}`, async ({page}, info) => {
    await page.setViewportSize({width:viewport.width,height:viewport.height});
    await page.addInitScript(() => {
      const moments=['05:20','05:30','05:40'].map((time,i)=>({
        id:'real-'+i,title:'Eggs',label:'Snack',category:'snack',date:'2026-10-11',
        time,location:'Home',locationCategory:'home',imageUrl:'',mood:'satisfied',
        tags:[],createdAt:i+1,
      }));
      localStorage.setItem('nimmapp_moments_v1',JSON.stringify(moments));
      localStorage.setItem('rhythm_language_v1','en');
      localStorage.setItem('cary_access_mode_v1','guest');
      localStorage.setItem('cary_onboarding_v2_complete','true');
      sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
    });
    await page.goto('/');
    await page.getByTestId(viewport.name==='desktop'?'desktop-capture-button':'primary-capture-button').click();
    await page.locator('[data-capture-method="text"]').click();
    const use=page.getByTestId('use-usual-meal-time');
    await expect(page.getByTestId('usual-meal-time-value')).toHaveText('05:30');
    await expect(use).toHaveAttribute('aria-pressed','false');
    await page.screenshot({path:info.outputPath('before.png'),fullPage:true});
    await use.click();
    await expect(use).toHaveAttribute('aria-pressed','true');
    await page.locator('input[autocomplete="off"]').fill('Eggs again');
    await page.getByRole('button',{name:'حفظ الوجبة'}).click();
    await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('nimmapp_moments_v1')||'[]').length)).toBe(4);
    const savedTime=await page.evaluate(()=>JSON.parse(localStorage.getItem('nimmapp_moments_v1')||'[]')[0].time);
    expect(savedTime).toBe('05:30');
    await page.screenshot({path:info.outputPath('after.png'),fullPage:true});
  });
}
