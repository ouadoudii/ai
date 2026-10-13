import {test,expect} from '@playwright/test';

const meals=[
 {id:'keyboard-couscous',title:'کُسْکُسِی ۲',label:'Meal',category:'lunch',date:'2026-10-13',time:'12:00',location:'Home',imageUrl:'',rating:5,mood:'satisfied',tags:[],notes:'مع العائلة ٣',createdAt:1,isFavorite:true},
 {id:'keyboard-tajine',title:'طــاجين بالخضار',label:'Meal',category:'dinner',date:'2026-10-12',time:'19:00',location:'Home',imageUrl:'',rating:5,mood:'satisfied',tags:[],createdAt:2,isFavorite:false},
 {id:'unrelated',title:'شوربة',label:'Meal',category:'dinner',date:'2026-10-11',time:'19:00',location:'Home',imageUrl:'',rating:5,mood:'satisfied',tags:[],createdAt:3,isFavorite:false}
];
for(const viewport of [{name:'desktop',width:1280,height:900},{name:'mobile',width:390,height:844}]){
 test('Arabic journal search accepts keyboard variants on '+viewport.name,async({page},info)=>{
  await page.setViewportSize({width:viewport.width,height:viewport.height});
  await page.addInitScript(seed=>{
   localStorage.setItem('rhythm_language_v1','ar');
   localStorage.setItem('cary_access_mode_v1','guest');
   localStorage.setItem('cary_onboarding_v2_complete','true');
   localStorage.setItem('rhythm_voice_entry_seen_v1','true');
   localStorage.setItem('nimmapp_moments_v1',JSON.stringify(seed));
   localStorage.setItem('nimmapp_checkins_v1','[]');
   sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  },meals);
  await page.goto('/');
  if(viewport.name==='mobile')await page.getByTestId('mobile-moments-nav').click();
  else await page.getByRole('button',{name:'لحظاتي',exact:true}).click();
  const search=page.getByTestId('timeline-search');
  await expect(search).toBeVisible();
  await search.fill('كسكسى 2');
  await expect(page.getByTestId('timeline-moment-keyboard-couscous')).toBeVisible();
  await expect(page.getByTestId('timeline-moment-keyboard-tajine')).toHaveCount(0);
  await search.fill('طاجين');
  await expect(page.getByTestId('timeline-moment-keyboard-tajine')).toBeVisible();
  await expect(page.getByTestId('timeline-moment-keyboard-couscous')).toHaveCount(0);
  await search.fill('العائلة 3');
  await page.getByTestId('timeline-search-scope').selectOption('notes');
  await expect(page.getByTestId('timeline-moment-keyboard-couscous')).toBeVisible();
  await search.fill('كسكسي 9');
  await expect(page.getByTestId('timeline-search-empty')).toBeVisible();
  await page.screenshot({path:info.outputPath('arabic-search-'+viewport.name+'.png'),fullPage:true});
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('nimmapp_moments_v1')||'[]'));
  expect(stored[0].title).toBe('کُسْکُسِی ۲');
 });
}
