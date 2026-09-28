import { expect,test } from '@playwright/test';

const moments=[
 {id:'fav-meal',title:'Harira',label:'Meal',category:'dinner',date:'2026-09-28',time:'19:00',location:'Home',imageUrl:'',rating:5,mood:'satisfied',tags:[],createdAt:1,isFavorite:true},
 {id:'plain-meal',title:'Salad',label:'Meal',category:'lunch',date:'2026-09-28',time:'12:00',location:'Home',imageUrl:'',rating:4,mood:'light',tags:[],createdAt:2,isFavorite:false}
];
const prepare=async(page:any)=>page.addInitScript((moments)=>{localStorage.setItem('rhythm_language_v1','de');localStorage.setItem('cary_access_mode_v1','guest');localStorage.setItem('cary_onboarding_v2_complete','true');localStorage.setItem('rhythm_voice_entry_seen_v1','true');localStorage.setItem('nimmapp_moments_v1',JSON.stringify(moments));localStorage.setItem('nimmapp_checkins_v1','[]');sessionStorage.setItem('nimmapp_checkin_auto_opened','true');},moments);
const openTimeline=async(page:any,mobile:boolean)=>mobile?page.getByTestId('mobile-moments-nav').click():page.getByRole('button',{name:'Momente',exact:true}).click();

for(const viewport of [{name:'desktop',width:1280,height:900},{name:'mobile',width:390,height:844}])test(`favorites are retrievable from timeline on ${viewport.name}`,async({page},testInfo)=>{
 await page.setViewportSize({width:viewport.width,height:viewport.height});await prepare(page);await page.goto('/');await openTimeline(page,viewport.name==='mobile');
 await expect(page.getByTestId('timeline-moment-fav-meal')).toBeVisible();await expect(page.getByTestId('timeline-moment-plain-meal')).toBeVisible();
 const favorites=page.getByTestId('timeline-filter-favorites');await expect(favorites).toContainText('(1)');await favorites.click();await expect(favorites).toHaveAttribute('aria-pressed','true');
 await expect(page.getByTestId('timeline-moment-fav-meal')).toBeVisible();await expect(page.getByTestId('timeline-moment-plain-meal')).toHaveCount(0);
 await page.reload();await openTimeline(page,viewport.name==='mobile');await page.getByTestId('timeline-filter-favorites').click();await expect(page.getByTestId('timeline-moment-fav-meal')).toBeVisible();
 await page.screenshot({path:testInfo.outputPath(`favorites-filter-${viewport.name}.png`),fullPage:true});
});
