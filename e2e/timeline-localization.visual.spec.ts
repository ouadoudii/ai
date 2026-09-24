import { expect, test } from '@playwright/test';

const cases=[
  {language:'en',title:'Journal & timeline',archive:'Chronological archive',add:'Add entry',today:'Today',category:'Lunch',location:'Not specified'},
  {language:'fr',title:'Journal & chronologie',archive:'Archive chronologique',add:'Ajouter une entrée',today:'Aujourd’hui',category:'Déjeuner',location:'Non précisé'},
  {language:'ar',title:'اليوميات والتسلسل الزمني',archive:'الأرشيف الزمني',add:'إضافة تدوينة',today:'اليوم',category:'غداء',location:'غير محدد'},
] as const;

for(const scenario of cases){
  test(`My moments chronology is localized in ${scenario.language}`,async({page},testInfo)=>{
    await page.setViewportSize({width:390,height:844});
    await page.addInitScript(({language})=>{
      const now=new Date();
      const date=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      localStorage.setItem('rhythm_language_v1',language);
      localStorage.setItem('cary_access_mode_v1','guest');
      localStorage.setItem('cary_onboarding_v2_complete','true');
      localStorage.setItem('rhythm_voice_entry_seen_v1','true');
      localStorage.setItem('rhythm_intro_profile_v1',JSON.stringify({summary:'Track my rhythm.',priorities:[],preferences:[],rawIntro:'Track my rhythm.',confirmedAt:Date.now(),firstPlan:{title:'Observe',rationale:'Notice patterns.',focusAreas:[],firstStep:'Capture the next check-in.',phase:'midday'}}));
      localStorage.setItem('nimmapp_checkins_v1','[]');
      localStorage.setItem('nimmapp_moments_v1',JSON.stringify([{id:'timeline-localization',title:'Pizza',label:'Mittagessen',category:'lunch',date,time:'12:30',location:'Nicht angegeben',imageUrl:'',rating:5,mood:'satisfied',tags:['Erfasst','midday','checkin-source:user-checkin-timeline'],coachFeedback:{title:'Erfasst',message:'Eigene Notiz',type:'praise',badge:'Check-in'},createdAt:Date.now()}]));
      sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
    },{language:scenario.language});
    await page.goto('/');
    await page.getByTestId('mobile-moments-nav').click();
    await expect(page.getByRole('heading',{name:scenario.title})).toBeVisible();
    await expect(page.getByText(scenario.archive)).toBeVisible();
    await expect(page.getByRole('button',{name:scenario.add})).toBeVisible();
    const timeline=page.getByTestId('moments-timeline');
    await expect(timeline).toContainText(scenario.today);
    await expect(timeline).toContainText(scenario.category);
    await expect(timeline).toContainText(scenario.location);
    await expect(timeline).not.toContainText('Chronologisches Archiv');
    await page.screenshot({path:testInfo.outputPath(`timeline-${scenario.language}.png`),fullPage:true});
  });
}