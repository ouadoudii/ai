import { expect,test } from '@playwright/test';

const moments=[
 {id:'favorite-old',title:'Harira favorite',label:'Meal',category:'dinner',date:'2026-09-20',time:'19:00',location:'',imageUrl:'',rating:5,mood:'satisfied',tags:[],createdAt:1,isFavorite:true},
 {id:'recent',title:'Recent soup',label:'Meal',category:'lunch',date:'2026-09-28',time:'12:00',location:'',imageUrl:'',rating:5,mood:'satisfied',tags:[],createdAt:10,isFavorite:false}
];
const prepare=async(page:any)=>page.addInitScript((seed)=>{localStorage.setItem('rhythm_language_v1','de');localStorage.setItem('cary_access_mode_v1','guest');localStorage.setItem('cary_onboarding_v2_complete','true');localStorage.setItem('rhythm_voice_entry_seen_v1','true');localStorage.setItem('nimmapp_moments_v1',JSON.stringify(seed));localStorage.setItem('nimmapp_checkins_v1','[]');sessionStorage.setItem('nimmapp_checkin_auto_opened','true');},moments);

for(const viewport of [{name:'desktop',width:1280,height:900},{name:'mobile',width:390,height:844}])test(`favorite meal can be repeated directly from Add on ${viewport.name}`,async({page},testInfo)=>{
 await page.setViewportSize({width:viewport.width,height:viewport.height});await prepare(page);await page.goto('/');
 await page.getByTestId('primary-capture-button').click();
 const favorites=page.locator('[data-favorite-quick-repeat="true"]');await expect(favorites).toContainText('Favoriten');await expect(favorites.getByRole('button',{name:'Harira favorite'})).toBeVisible();
 await page.screenshot({path:testInfo.outputPath(`favorite-quick-repeat-${viewport.name}.png`),fullPage:true});
 await favorites.getByRole('button',{name:'Harira favorite'}).click();await page.waitForLoadState('domcontentloaded');
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('nimmapp_moments_v1')||'[]'));
 expect(stored).toHaveLength(3);expect(stored[0].title).toBe('Harira favorite');expect(stored[0].tags).toEqual(['Repeated']);expect(stored[0].isFavorite).toBe(false);expect(stored[0].id).not.toBe('favorite-old');
});
