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

// Regression: Today cards may contain positioned elements, but must never
// intercept actual pointer clicks on the fixed mobile bottom navigation.
test('mobile bottom navigation remains clickable over Today content',async({page},testInfo)=>{
 await page.setViewportSize({width:390,height:844});await prepare(page);await page.goto('/');
 const momentsNav=page.getByTestId('mobile-moments-nav');
 await expect(momentsNav).toBeVisible();
 // Scroll Today cards underneath the fixed navigation before testing real hit targets.
 await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
 const capture=page.getByTestId('primary-capture-button');
 await expect.poll(async()=>capture.evaluate((button)=>{
   const rect=button.getBoundingClientRect();
   const hit=document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height/2);
   return hit===button||button.contains(hit);
 })).toBe(true);
 await capture.click();
 const dialog=page.getByRole('dialog');
 await expect(dialog).toBeVisible();
 // The capture dialog must sit above the navigation while open.
 expect(await capture.evaluate((button)=>{
   const rect=button.getBoundingClientRect();
   const hit=document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height/2);
   return hit===button||button.contains(hit);
 })).toBe(false);
 await page.keyboard.press('Escape');
 await expect(dialog).not.toBeVisible();
 await momentsNav.click();
 await expect(momentsNav).toHaveAttribute('aria-current','page');
 await page.screenshot({path:testInfo.outputPath('mobile-bottom-nav-stacking.png'),fullPage:true});
});
