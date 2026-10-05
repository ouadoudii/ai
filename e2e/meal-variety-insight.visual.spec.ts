import { expect,test } from '@playwright/test';

const moments=[
 {id:'real-1',title:'Harira',category:'dinner',date:'2026-09-25',time:'19:00',createdAt:10},
 {id:'real-2',title:' harira ',category:'dinner',date:'2026-09-26',time:'19:00',createdAt:20},
 {id:'real-3',title:'Couscous',category:'lunch',date:'2026-09-27',time:'13:00',createdAt:30},
 {id:'real-4',title:'بيض مسلوق',category:'breakfast',date:'2026-09-28',time:'08:00',createdAt:40},
 {id:'real-5',title:'Salad',category:'lunch',date:'2026-09-29',time:'13:00',createdAt:50},
 {id:'real-6',title:'Soup',category:'dinner',date:'2026-09-30',time:'19:00',createdAt:60},
 {id:'moment-1',title:'Demo meal',category:'lunch',date:'2026-09-30',time:'12:00',createdAt:999}
];
const prepare=async(page:any)=>page.addInitScript((seed)=>{localStorage.setItem('rhythm_language_v1','de');localStorage.setItem('cary_access_mode_v1','guest');localStorage.setItem('cary_onboarding_v2_complete','true');localStorage.setItem('rhythm_voice_entry_seen_v1','true');localStorage.setItem('nimmapp_moments_v1',JSON.stringify(seed));localStorage.setItem('nimmapp_checkins_v1','[]');sessionStorage.setItem('nimmapp_checkin_auto_opened','true');},moments);

for(const viewport of [{name:'desktop',width:1280,height:900},{name:'mobile',width:390,height:844}])test(`meal variety is visible and localized in discoveries on ${viewport.name}`,async({page},testInfo)=>{
 await page.setViewportSize({width:viewport.width,height:viewport.height});await prepare(page);await page.goto('/');await page.getByRole('button',{name:'Entdeckungen',exact:true}).click();
 const insight=page.getByTestId('meal-variety-insight');await expect(insight).toBeVisible();await expect(insight).toContainText('Deine Mahlzeitenvielfalt zuletzt');await expect(page.getByTestId('meal-variety-summary')).toContainText('5 verschiedene Mahlzeiten');await expect(insight).not.toContainText('Demo meal');
 await page.screenshot({path:testInfo.outputPath(`meal-variety-${viewport.name}-de.png`),fullPage:true});
 if(viewport.name==='mobile'){await page.getByRole('button',{name:'Sprache wählen',exact:true}).click();await page.locator('[data-language-option="fr"]').click();await expect(insight).toContainText('La variété récente de tes repas');await page.screenshot({path:testInfo.outputPath('meal-variety-mobile-fr.png'),fullPage:true});}
});
