import { expect, test } from '@playwright/test';

const profile={summary:'I want to understand my rhythm.',priorities:[],preferences:[],rawIntro:'I want to understand my rhythm.',confirmedAt:Date.now(),firstPlan:{title:'Observe your rhythm',rationale:'Notice what repeats.',focusAreas:[],firstStep:'Capture your next midday check-in.',phase:'midday'}};
const acknowledgementStorageKey='moment.guardian.acknowledged-occurrences.v1';

const prepare=async(page:any)=>{await page.addInitScript((profile)=>{
  localStorage.setItem('rhythm_language_v1','de');
  localStorage.setItem('cary_access_mode_v1','guest');
  localStorage.setItem('cary_onboarding_v2_complete','true');
  localStorage.setItem('rhythm_voice_entry_seen_v1','true');
  localStorage.setItem('rhythm_intro_profile_v1',JSON.stringify(profile));
  localStorage.setItem('nimmapp_moments_v1','[]');
  localStorage.setItem('nimmapp_checkins_v1','[]');
  sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
},profile);};

for(const viewport of [{name:'desktop',width:1280,height:900},{name:'mobile',width:390,height:844}]){
  test(`guardian acknowledgement survives reload and does not suppress a later occurrence on ${viewport.name}`,async({page},testInfo)=>{
    await page.setViewportSize({width:viewport.width,height:viewport.height});
    await prepare(page);
    await page.goto('/');
    await page.getByTestId(viewport.name==='desktop'?'desktop-coach-nav':'mobile-coach-nav').click();

    await page.getByRole('button',{name:'Alarm testen'}).click();
    await page.getByRole('button',{name:/Schlafmangel/}).click();
    const resolve=page.getByRole('button',{name:'Als erledigt abhaken'}).first();
    await expect(resolve).toBeVisible();
    await resolve.click();
    await expect(page.getByText('Keine Intervention erforderlich')).toBeVisible();

    await expect.poll(async()=>page.evaluate((key)=>JSON.parse(localStorage.getItem(key)||'[]').length,acknowledgementStorageKey)).toBeGreaterThan(0);

    await page.reload();
    await page.getByTestId(viewport.name==='desktop'?'desktop-coach-nav':'mobile-coach-nav').click();
    await page.getByRole('button',{name:'Alarm testen'}).click();
    await page.getByRole('button',{name:/Schlafmangel/}).click();
    await expect(page.getByText('Keine Intervention erforderlich')).toBeVisible();

    // A different source occurrence must remain independently actionable. Use
    // the rushed-meal simulator because it is not gated by the runner's local
    // wall-clock hour (the afternoon-crash alarm intentionally is).
    await page.getByRole('button',{name:/Reset/}).click();
    await page.getByRole('button',{name:/Stress-Essen/}).click();
    await expect(page.getByRole('button',{name:'Als erledigt abhaken'}).first()).toBeVisible();
    await page.screenshot({path:testInfo.outputPath(`guardian-acknowledgement-${viewport.name}.png`),fullPage:true});
  });
}
