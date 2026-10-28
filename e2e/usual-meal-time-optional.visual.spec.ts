import { test, expect } from '@playwright/test';

for(const viewport of [{name:'desktop',width:1280,height:900},{name:'mobile',width:390,height:844}]){
  for(const sparse of [false,true]){
    test(`usual time ${sparse?'requires real history':'is not auto-applied'} on ${viewport.name}`,async({page},info)=>{
      await page.setViewportSize({width:viewport.width,height:viewport.height});
      await page.clock.setFixedTime(new Date('2026-10-28T12:55:00'));
      await page.addInitScript(sparse=>{
        const meal=(id:string,time:string)=>({
          id,title:'Eggs',label:'Snack',category:'snack',date:'2026-10-11',
          time,location:'Home',locationCategory:'home',imageUrl:'',mood:'satisfied',
          tags:[],createdAt:1,
        });
        const moments=[meal('real-1','05:20'),meal('real-2','05:30'),meal(sparse?'demo-3':'real-3','05:40')];
        localStorage.setItem('nimmapp_moments_v1',JSON.stringify(moments));
        localStorage.setItem('rhythm_language_v1','en');
        localStorage.setItem('cary_access_mode_v1','guest');
        localStorage.setItem('cary_onboarding_v2_complete','true');
        sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
      },sparse);
      await page.goto('/');
      await page.getByTestId(viewport.name==='desktop'?'desktop-capture-button':'primary-capture-button').click();
      await page.locator('[data-capture-method="text"]').click();
      if(sparse){
        await expect(page.getByTestId('usual-meal-time-suggestion')).toHaveCount(0);
      }else{
        await expect(page.getByTestId('use-usual-meal-time')).toHaveAttribute('aria-pressed','false');
        await page.locator('input[autocomplete="off"]').fill('Eggs again');
        const now=await page.evaluate(()=>new Date().toTimeString().slice(0,5));
        await page.getByRole('button',{name:'حفظ الوجبة'}).click();
        await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('nimmapp_moments_v1')||'[]').length)).toBe(4);
        const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('nimmapp_moments_v1')||'[]')[0].time);
        expect(saved).toBe(now);
      }
      await page.screenshot({path:info.outputPath(`usual-time-${sparse?'sparse':'untouched'}.png`),fullPage:true});
    });
  }
}
