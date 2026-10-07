import { expect,test } from '@playwright/test';

const moments=[
 {id:'user-old',title:'Harira',label:'Meal',category:'dinner',date:'2026-09-27',time:'19:00',location:'Home',locationCategory:'home',imageUrl:'',rating:5,mood:'satisfied',tags:[],createdAt:10},
 {id:'user-latest',title:'Couscous',label:'Meal',category:'lunch',date:'2026-09-28',time:'13:00',location:'Cafe',locationCategory:'restaurant',imageUrl:'',rating:4,mood:'satisfied',tags:[],notes:'source note',createdAt:30}
];
const prepare=async(page:any)=>page.addInitScript((seed)=>{localStorage.setItem('rhythm_language_v1','de');localStorage.setItem('cary_access_mode_v1','guest');localStorage.setItem('cary_onboarding_v2_complete','true');localStorage.setItem('rhythm_voice_entry_seen_v1','true');localStorage.setItem('nimmapp_moments_v1',JSON.stringify(seed));localStorage.setItem('nimmapp_checkins_v1','[]');sessionStorage.setItem('nimmapp_checkin_auto_opened','true');},moments);

for(const viewport of [{name:'desktop',width:1280,height:900},{name:'mobile',width:390,height:844}])test(`latest meal can be safely repeated from Today on ${viewport.name}`,async({page},testInfo)=>{
 await page.setViewportSize({width:viewport.width,height:viewport.height});await prepare(page);await page.goto('/');
 const repeat=page.getByTestId('repeat-latest-meal');await expect(repeat).toBeVisible();await expect(repeat).toContainText('Letzte wiederholen');await repeat.click();
 await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('nimmapp_moments_v1')||'[]').length)).toBe(3);
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('nimmapp_moments_v1')||'[]'));
 expect(stored[0].title).toBe('Couscous');expect(stored[0].category).toBe('lunch');expect(stored[0].id).not.toBe('user-latest');expect(stored[0].tags).toEqual(['Repeated']);expect(stored[0].notes).toBeUndefined();expect(stored[0].rating).toBeUndefined();expect(stored[0].location).toBe('');
 await page.screenshot({path:testInfo.outputPath(`repeat-latest-${viewport.name}.png`),fullPage:true});
});
