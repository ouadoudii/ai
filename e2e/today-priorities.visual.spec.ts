import { expect, test } from '@playwright/test';

const profile={summary:'I want to understand my rhythm.',priorities:[],preferences:[],rawIntro:'I want to understand my rhythm.',confirmedAt:Date.now(),firstPlan:{title:'Observe your rhythm',rationale:'Notice what repeats.',focusAreas:[],firstStep:'Capture your next midday check-in.',phase:'midday'}};

const prepare=async(page:any,language:'de'|'ar')=>{await page.addInitScript(({language,profile})=>{
  localStorage.setItem('rhythm_language_v1',language);
  localStorage.setItem('cary_access_mode_v1','guest');
  localStorage.setItem('cary_onboarding_v2_complete','true');
  localStorage.setItem('rhythm_voice_entry_seen_v1','true');
  localStorage.setItem('rhythm_intro_profile_v1',JSON.stringify(profile));
  localStorage.setItem('nimmapp_moments_v1',JSON.stringify([
    {id:'user-lunch-1',title:'Lunch',category:'lunch',date:'2026-09-16',time:'14:20',createdAt:1},
    {id:'user-lunch-2',title:'Lunch',category:'lunch',date:'2026-09-17',time:'14:35',createdAt:2},
    {id:'user-lunch-3',title:'Lunch',category:'lunch',date:'2026-09-18',time:'14:10',createdAt:3}
  ]));
  localStorage.setItem('nimmapp_checkins_v1','[]');
  sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
},{language,profile});};

test('mobile home leads with a cautious data-derived priority',async({page},testInfo)=>{
  await page.setViewportSize({width:390,height:844});
  await prepare(page,'de');
  await page.goto('/');
  const card=page.getByTestId('personal-plan-home-card');
  await expect(card).toContainText('Heute wichtig');
  await expect(page.getByTestId('today-priorities')).toContainText('Dein Mittagsrhythmus');
  await expect(page.getByTestId('today-priorities')).toContainText('basiert auf 3 echten Einträgen');
  await expect(page.getByTestId('personal-plan-first-step')).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('today-priority-mobile-de.png'),fullPage:true});
});

test('desktop Arabic home keeps the same evidence transparent and localized',async({page},testInfo)=>{
  await page.setViewportSize({width:1280,height:900});
  await prepare(page,'ar');
  await page.goto('/');
  const card=page.getByTestId('personal-plan-home-card');
  await expect(card).toContainText('المهم اليوم');
  await expect(page.getByTestId('today-priorities')).toContainText('إيقاع الغداء');
  await expect(page.getByTestId('today-priorities')).toContainText('3 إدخالات حقيقية');
  await page.screenshot({path:testInfo.outputPath('today-priority-desktop-ar.png'),fullPage:true});
});
