import { expect,test } from '@playwright/test';

const moments=[
 {id:'new-evening',title:'Harira',label:'Meal',category:'dinner',date:'2026-09-28',time:'20:00',location:'Home',imageUrl:'',rating:5,mood:'satisfied',tags:[],createdAt:3,isFavorite:true},
 {id:'new-morning',title:'Coffee',label:'Meal',category:'breakfast',date:'2026-09-28',time:'07:30',location:'Home',imageUrl:'',rating:4,mood:'satisfied',tags:[],createdAt:2,isFavorite:false},
 {id:'old',title:'Salad',label:'Meal',category:'lunch',date:'2026-09-27',time:'12:00',location:'Home',imageUrl:'',rating:4,mood:'light',tags:[],createdAt:1,isFavorite:false}
];
const prepare=async(page:any)=>page.addInitScript((moments)=>{localStorage.setItem('rhythm_language_v1','de');localStorage.setItem('cary_access_mode_v1','guest');localStorage.setItem('cary_onboarding_v2_complete','true');localStorage.setItem('rhythm_voice_entry_seen_v1','true');localStorage.setItem('nimmapp_moments_v1',JSON.stringify(moments));localStorage.setItem('nimmapp_checkins_v1','[]');sessionStorage.setItem('nimmapp_checkin_auto_opened','true');},moments);
const openTimeline=async(page:any,mobile:boolean)=>mobile?page.getByTestId('mobile-moments-nav').click():page.getByRole('button',{name:'Momente',exact:true}).click();
const ids=async(page:any)=>page.locator('[data-testid^="timeline-moment-"]').evaluateAll((nodes:any[])=>nodes.map(n=>n.getAttribute('data-testid')));

for(const viewport of [{name:'desktop',width:1280,height:900},{name:'mobile',width:390,height:844}])test(`journal sort composes with favorites and search on ${viewport.name}`,async({page},testInfo)=>{
 await page.setViewportSize({width:viewport.width,height:viewport.height});await prepare(page);await page.goto('/');await openTimeline(page,viewport.name==='mobile');
 await expect.poll(()=>ids(page)).toEqual(['timeline-moment-new-evening','timeline-moment-new-morning','timeline-moment-old']);
 await page.getByTestId('timeline-sort-oldest').click();await expect(page.getByTestId('timeline-sort-oldest')).toHaveAttribute('aria-pressed','true');
 await expect.poll(()=>ids(page)).toEqual(['timeline-moment-old','timeline-moment-new-morning','timeline-moment-new-evening']);
 await page.getByTestId('timeline-filter-favorites').click();await expect.poll(()=>ids(page)).toEqual(['timeline-moment-new-evening']);
 await page.getByTestId('timeline-filter-all').click();await page.getByTestId('timeline-search').fill('Coffee');await expect.poll(()=>ids(page)).toEqual(['timeline-moment-new-morning']);
 await page.screenshot({path:testInfo.outputPath(`journal-sort-${viewport.name}.png`),fullPage:true});
});
