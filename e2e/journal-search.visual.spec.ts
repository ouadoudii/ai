import { expect,test } from '@playwright/test';

const moments=[
 {id:'creme',title:'Crème brûlée',label:'Meal',category:'dessert',date:'2026-09-28',time:'20:00',location:'Paris',imageUrl:'',rating:5,mood:'satisfied',tags:['dessert'],createdAt:1,isFavorite:true,note:'Dessert after dinner'},
 {id:'harira',title:'حريرة Harira',label:'Meal',category:'dinner',date:'2026-09-27',time:'19:00',location:'Marrakech',imageUrl:'',rating:5,mood:'comfort',tags:['morocco'],createdAt:2,isFavorite:false,note:'بعد sport avec Youssef'}
];
const prepare=async(page:any)=>page.addInitScript((moments)=>{localStorage.setItem('rhythm_language_v1','de');localStorage.setItem('cary_access_mode_v1','guest');localStorage.setItem('cary_onboarding_v2_complete','true');localStorage.setItem('rhythm_voice_entry_seen_v1','true');localStorage.setItem('nimmapp_moments_v1',JSON.stringify(moments));localStorage.setItem('nimmapp_checkins_v1','[]');sessionStorage.setItem('nimmapp_checkin_auto_opened','true');},moments);
const openTimeline=async(page:any,mobile:boolean)=>mobile?page.getByTestId('mobile-moments-nav').click():page.getByRole('button',{name:'Momente',exact:true}).click();

for(const viewport of [{name:'desktop',width:1280,height:900},{name:'mobile',width:390,height:844}])test(`journal search finds multilingual history and personal notes on ${viewport.name}`,async({page},testInfo)=>{
 await page.setViewportSize({width:viewport.width,height:viewport.height});await prepare(page);await page.goto('/');await openTimeline(page,viewport.name==='mobile');
 const search=page.getByTestId('timeline-search');await expect(search).toHaveAttribute('placeholder','Mahlzeiten, Orte oder Tags suchen');
 await search.fill('creme');await expect(page.getByTestId('timeline-moment-creme')).toBeVisible();await expect(page.getByTestId('timeline-moment-harira')).toHaveCount(0);
 await search.fill('Marrakech');await expect(page.getByTestId('timeline-moment-harira')).toBeVisible();await expect(page.getByTestId('timeline-moment-creme')).toHaveCount(0);
 await search.fill('sport avec');await expect(page.getByTestId('timeline-moment-harira')).toBeVisible();await expect(page.getByTestId('timeline-moment-creme')).toHaveCount(0);
 await search.fill('بعد');await expect(page.getByTestId('timeline-moment-harira')).toBeVisible();
 await page.getByTestId('timeline-filter-favorites').click();await expect(page.getByTestId('timeline-search-empty')).toBeVisible();
 const reset=page.getByTestId('timeline-search-reset');await expect(reset).toHaveText('Suche zurücksetzen');await reset.click();
 await expect(search).toHaveValue('');await expect(page.getByTestId('timeline-filter-all')).toHaveAttribute('aria-pressed','true');await expect(page.getByTestId('timeline-moment-creme')).toBeVisible();await expect(page.getByTestId('timeline-moment-harira')).toBeVisible();
 await search.fill('حريرة');await expect(page.getByTestId('timeline-moment-harira')).toBeVisible();
 await page.screenshot({path:testInfo.outputPath(`journal-note-search-${viewport.name}.png`),fullPage:true});
});
