import { expect,test } from '@playwright/test';

const translations={
 de:{label:'Suchbereich',all:'Alle Felder',notes:'Nur Notizen'},
 en:{label:'Search in',all:'All fields',notes:'Notes only'},
 fr:{label:'Rechercher dans',all:'Tous les champs',notes:'Notes uniquement'},
 ar:{label:'نطاق البحث',all:'كل الحقول',notes:'الملاحظات فقط'},
} as const;
const moments=[
 {id:'scope-one',title:'Training bowl',label:'Meal',category:'lunch',date:'2026-10-01',time:'12:00',location:'Home',imageUrl:'',rating:5,mood:'satisfied',tags:[],createdAt:1,isFavorite:true,notes:'بَعْدَ التَّمْرِين avec ami'},
 {id:'scope-two',title:'After training',label:'Meal',category:'lunch',date:'2026-10-02',time:'12:00',location:'Paris',imageUrl:'',rating:4,mood:'satisfied',tags:[],createdAt:2,isFavorite:true,notes:'ordinary lunch'},
 {id:'scope-three',title:'Soup',label:'Meal',category:'dinner',date:'2026-10-03',time:'19:00',location:'Home',imageUrl:'',rating:5,mood:'comfort',tags:[],createdAt:3,isFavorite:false,notes:'réunion importante'},
];
for(const [language,copy] of Object.entries(translations)){
 for(const viewport of [{name:'desktop',width:1280,height:900},{name:'mobile',width:390,height:844}]){
  test(`journal note-only scope in ${language} on ${viewport.name}`,async({page},testInfo)=>{
   await page.setViewportSize({width:viewport.width,height:viewport.height});
   await page.addInitScript(({language,moments})=>{
    localStorage.setItem('rhythm_language_v1',language);
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('rhythm_voice_entry_seen_v1','true');
    localStorage.setItem('nimmapp_moments_v1',JSON.stringify(moments));
    localStorage.setItem('nimmapp_checkins_v1','[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
   },{language,moments});
   await page.goto('/');
   if(viewport.name==='mobile')await page.getByTestId('mobile-moments-nav').click();
   else await page.locator('header nav').getByRole('button').nth(1).click();
   const scope=page.getByTestId('timeline-search-scope');
   await expect(scope).toHaveValue('all');
   await expect(page.getByText(copy.label,{exact:true})).toBeVisible();
   await expect(scope.locator('option[value="all"]')).toHaveText(copy.all);
   await expect(scope.locator('option[value="notes"]')).toHaveText(copy.notes);
   const search=page.getByTestId('timeline-search');
   await search.fill('training');
   await expect(page.getByTestId('timeline-moment-scope-one')).toBeVisible();
   await expect(page.getByTestId('timeline-moment-scope-two')).toBeVisible();
   await scope.selectOption('notes');
   await expect(page.getByTestId('timeline-search-empty')).toBeVisible();
   await search.fill('بعد التمرين');
   await expect(page.getByTestId('timeline-moment-scope-one')).toBeVisible();
   await expect(page.getByTestId('timeline-moment-scope-two')).toHaveCount(0);
   await search.fill('réunion');
   await expect(page.getByTestId('timeline-moment-scope-three')).toBeVisible();
   await page.getByTestId('timeline-filter-favorites').click();
   await expect(page.getByTestId('timeline-search-empty')).toBeVisible();
   await page.getByTestId('timeline-search-reset').click();
   await expect(scope).toHaveValue('all');
   await expect(search).toHaveValue('');
   await expect(page.getByTestId('timeline-filter-all')).toHaveAttribute('aria-pressed','true');
   await expect(page.getByTestId('timeline-moment-scope-one')).toBeVisible();
   await expect(page.getByTestId('timeline-moment-scope-three')).toBeVisible();
   await page.screenshot({path:testInfo.outputPath(`journal-note-scope-${language}-${viewport.name}.png`),fullPage:true});
  });
 }
}
