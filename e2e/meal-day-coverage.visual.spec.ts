import {expect,test} from '@playwright/test';

const profile={summary:'I want to understand my rhythm.',priorities:[],preferences:[],rawIntro:'I want to understand my rhythm.',confirmedAt:Date.now(),firstPlan:{title:'Observe your rhythm',rationale:'Notice what repeats.',focusAreas:[],firstStep:'Capture your next meal.',phase:'midday'}};

async function seed(page:any,language:string){
  await page.addInitScript(({profile,language})=>{
    const dateKey=(daysAgo:number)=>{const d=new Date();d.setDate(d.getDate()-daysAgo);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
    const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);
    const future=`${tomorrow.getFullYear()}-${String(tomorrow.getMonth()+1).padStart(2,'0')}-${String(tomorrow.getDate()).padStart(2,'0')}`;
    localStorage.setItem('rhythm_language_v1',language);
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('rhythm_voice_entry_seen_v1','true');
    localStorage.setItem('rhythm_intro_profile_v1',JSON.stringify(profile));
    localStorage.setItem('nimmapp_moments_v1',JSON.stringify([
      {id:'coverage-today',title:'Harira حريرة',category:'dinner',date:dateKey(0),time:'19:00',createdAt:Date.now()},
      {id:'coverage-yesterday-a',title:'Couscous',category:'lunch',date:dateKey(1),time:'12:00',createdAt:Date.now()-86400000},
      {id:'coverage-yesterday-b',title:'Tea',category:'coffee',date:dateKey(1),time:'16:00',createdAt:Date.now()-82800000},
      {id:'coverage-four-days',title:'Salad',category:'lunch',date:dateKey(4),time:'12:30',createdAt:Date.now()-345600000},
      {id:'moment-1',title:'Demo meal',category:'breakfast',date:dateKey(2),time:'08:00',createdAt:Date.now()-172800000},
      {id:'coverage-old',title:'Old meal',category:'lunch',date:dateKey(8),time:'12:00',createdAt:Date.now()-691200000},
      {id:'coverage-future',title:'Future meal',category:'dinner',date:future,time:'19:00',createdAt:Date.now()+86400000},
      {id:'coverage-invalid',title:'Invalid meal',category:'snack',date:'2026-02-31',time:'15:00',createdAt:0},
    ]));
    localStorage.setItem('nimmapp_checkins_v1','[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  },{profile,language});
}

for(const scenario of [
  {name:'desktop-english',language:'en',width:1280,height:900,title:'3 of the last 7 days are represented'},
  {name:'mobile-arabic',language:'ar',width:390,height:844,title:'سجّلت لحظات في 3 من آخر 7 أيام'},
]){
  test(`shows distinct real meal-day coverage on ${scenario.name}`,async({page},testInfo)=>{
    await page.setViewportSize({width:scenario.width,height:scenario.height});
    await seed(page,scenario.language);
    await page.goto('/');
    const card=page.getByTestId('meal-day-coverage');
    await expect(card).toBeVisible();
    await expect(card).toContainText(scenario.title);
    await expect(card.getByLabel('3/7')).toBeVisible();
    await page.screenshot({path:testInfo.outputPath(`meal-day-coverage-${scenario.name}.png`),fullPage:true});
  });
}
