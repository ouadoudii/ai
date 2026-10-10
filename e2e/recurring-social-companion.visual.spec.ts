import { test, expect } from '@playwright/test';

const profile={summary:'I want to understand my rhythm.',priorities:[],preferences:[],rawIntro:'I want to understand my rhythm.',confirmedAt:Date.now(),firstPlan:{title:'Observe your rhythm',rationale:'Notice what repeats.',focusAreas:[],firstStep:'Capture your next meal.',phase:'midday'}};

async function seed(page:any) {
  await page.addInitScript((profile:any) => {
    const dateKey=(daysAgo:number)=>{const d=new Date();d.setDate(d.getDate()-daysAgo);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
    localStorage.setItem('rhythm_language_v1','en');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('rhythm_voice_entry_seen_v1','true');
    localStorage.setItem('rhythm_intro_profile_v1',JSON.stringify(profile));
    localStorage.setItem('nimmapp_moments_v1',JSON.stringify([
      { id:'social-a', title:'Boiled eggs', category:'breakfast', date:dateKey(4), time:'08:00', companions:'Sara', tags:[], createdAt:Date.now()-345600000 },
      { id:'social-b', title:'Coffee', category:'breakfast', date:dateKey(2), time:'08:15', companions:'Sara', tags:[], createdAt:Date.now()-172800000 },
      { id:'social-c', title:'Toast', category:'breakfast', date:dateKey(0), time:'08:10', companions:'Sara', tags:[], createdAt:Date.now() },
    ]));
    localStorage.setItem('nimmapp_checkins_v1','[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  }, profile);
}

for (const viewport of [
  { name:'desktop', width:1280, height:900 },
  { name:'mobile', width:390, height:844 },
]) {
  test(`shows factual recurring meal companion insight on ${viewport.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width:viewport.width, height:viewport.height });
    await seed(page);
    await page.goto('/');
    const card=page.getByTestId('recurring-social-companion-insight');
    await expect(card).toBeVisible();
    await expect(card).toContainText('Sara');
    await expect(card).toContainText('3 times');
    await page.screenshot({path:testInfo.outputPath(`recurring-social-companion-${viewport.name}.png`),fullPage:true});
  });
}
