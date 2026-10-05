import { expect,test } from '@playwright/test';

const moment=(id:string,title:string,category:string,date:string,time:string,createdAt:number)=>({id,title,label:'Meal',category,date,time,location:'Home',locationCategory:'home',imageUrl:'',rating:5,mood:'satisfied',tags:[],createdAt});
const moments=[
 moment('real-1','Harira','dinner','2026-09-25','19:00',10),
 moment('real-2',' harira ','dinner','2026-09-26','19:00',20),
 moment('real-3','Couscous','lunch','2026-09-27','13:00',30),
 moment('real-4','بيض مسلوق','breakfast','2026-09-28','08:00',40),
 moment('real-5','Salad','lunch','2026-09-29','13:00',50),
 moment('real-6','Soup','dinner','2026-09-30','19:00',60),
 moment('moment-1','Demo meal','lunch','2026-09-30','12:00',999)
];
const prepare=async(page:any)=>page.addInitScript((seed)=>{localStorage.setItem('rhythm_language_v1','de');localStorage.setItem('cary_access_mode_v1','guest');localStorage.setItem('cary_onboarding_v2_complete','true');localStorage.setItem('rhythm_voice_entry_seen_v1','true');localStorage.setItem('nimmapp_moments_v1',JSON.stringify(seed));localStorage.setItem('nimmapp_checkins_v1','[]');sessionStorage.setItem('nimmapp_checkin_auto_opened','true');},moments);

for(const viewport of [{name:'desktop',width:1280,height:900},{name:'mobile',width:390,height:844}])test(`meal variety is visible and localized in discoveries on ${viewport.name}`,async({page},testInfo)=>{
 await page.setViewportSize({width:viewport.width,height:viewport.height});await prepare(page);await page.goto('/');await page.getByRole('button',{name:'Entdeckungen',exact:true}).click();
 const insight=page.getByTestId('meal-variety-insight');await expect(insight).toBeVisible();await expect(insight).toContainText('Deine Mahlzeitenvielfalt zuletzt');await expect(page.getByTestId('meal-variety-summary')).toContainText('5 verschiedene Mahlzeiten');await expect(insight).not.toContainText('Demo meal');
 await page.screenshot({path:testInfo.outputPath(`meal-variety-${viewport.name}-de.png`),fullPage:true});
 if(viewport.name==='mobile'){await page.getByRole('button',{name:'Sprache wählen',exact:true}).click();await page.locator('[data-language-option="fr"]').click();await expect(insight).toContainText('La variété récente de tes repas');await page.screenshot({path:testInfo.outputPath('meal-variety-mobile-fr.png'),fullPage:true});}
});
