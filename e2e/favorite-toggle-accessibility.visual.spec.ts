import { expect,test } from '@playwright/test';

const storedTitle='Harira accessibility';
const moment={id:'favorite-a11y',title:storedTitle,label:'Meal',category:'dinner',date:'2026-09-28',time:'19:00',location:'Home',imageUrl:'',rating:5,mood:'satisfied',tags:[],createdAt:1,isFavorite:false};
const prepare=async(page:any)=>page.addInitScript((seed)=>{localStorage.setItem('rhythm_language_v1','de');localStorage.setItem('cary_access_mode_v1','guest');localStorage.setItem('cary_onboarding_v2_complete','true');localStorage.setItem('rhythm_voice_entry_seen_v1','true');if(localStorage.getItem('nimmapp_moments_v1')===null)localStorage.setItem('nimmapp_moments_v1',JSON.stringify([seed]));if(localStorage.getItem('nimmapp_checkins_v1')===null)localStorage.setItem('nimmapp_checkins_v1','[]');sessionStorage.setItem('nimmapp_checkin_auto_opened','true');},moment);

for(const viewport of [{name:'desktop',width:1280,height:900},{name:'mobile',width:390,height:844}])test(`favorite toggle exposes persisted pressed state in Arabic on ${viewport.name}`,async({page},testInfo)=>{
 await page.setViewportSize({width:viewport.width,height:viewport.height});await prepare(page);await page.goto('/');
 await expect(page.locator('html')).toHaveAttribute('lang','ar');await expect(page.locator('html')).toHaveAttribute('dir','rtl');
 if(viewport.name==='mobile')await page.getByTestId('mobile-moments-nav').click();else await page.getByRole('navigation').getByRole('button',{name:'لحظات',exact:true}).click();
 await expect(page.getByText(storedTitle,{exact:true})).toBeVisible();await page.getByText(storedTitle,{exact:true}).click();
 const favorite=page.getByRole('button',{name:'مفضلة',exact:true});await expect(favorite).toHaveAttribute('aria-pressed','false');
 await favorite.click();await expect(favorite).toHaveAttribute('aria-pressed','true');
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('nimmapp_moments_v1')||'[]').find((entry:{id:string})=>entry.id==='favorite-a11y')?.isFavorite)).toBe(true);
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('nimmapp_moments_v1')||'[]').find((entry:{id:string})=>entry.id==='favorite-a11y')?.title)).toBe(storedTitle);
 await page.screenshot({path:testInfo.outputPath(`favorite-toggle-a11y-${viewport.name}.png`),fullPage:true});
 await page.reload();
 await expect(page.locator('html')).toHaveAttribute('lang','ar');await expect(page.locator('html')).toHaveAttribute('dir','rtl');
 if(viewport.name==='mobile')await page.getByTestId('mobile-moments-nav').click();else await page.getByRole('navigation').getByRole('button',{name:'لحظات',exact:true}).click();
 await expect(page.getByText(storedTitle,{exact:true})).toBeVisible();await page.getByText(storedTitle,{exact:true}).click();await expect(page.getByRole('button',{name:'مفضلة',exact:true})).toHaveAttribute('aria-pressed','true');
});
