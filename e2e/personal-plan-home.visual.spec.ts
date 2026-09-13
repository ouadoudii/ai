import { expect, test } from '@playwright/test';

test('confirmed profile makes the personal plan the primary mobile home action',async({page},testInfo)=>{
  await page.setViewportSize({width:390,height:844});
  await page.addInitScript(()=>{
    localStorage.setItem('rhythm_language_v1','de');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('rhythm_voice_entry_seen_v1','true');
    localStorage.setItem('nimmapp_moments_v1','[]');
    localStorage.setItem('nimmapp_checkins_v1','[]');
    localStorage.setItem('rhythm_intro_profile_v1',JSON.stringify({
      summary:'Du möchtest regelmäßiger essen und deine Energie besser verstehen.',
      priorities:['regelmäßiger essen','Energie verstehen'],
      preferences:['einfache Routinen'],
      rawIntro:'Ich esse oft spät und möchte verstehen, warum meine Energie am Nachmittag absackt.',
      confirmedAt:Date.now(),
      firstPlan:{
        title:'Mittag und Energie beobachten',
        rationale:'Du möchtest verstehen, wie dein Essrhythmus mit deiner Nachmittagsenergie zusammenhängt.',
        focusAreas:['Mittagessen','Nachmittagsenergie'],
        firstStep:'Halte beim nächsten Mittag-Check-in fest, was du gegessen hast und wie deine Energie danach ist.',
        phase:'midday'
      }
    }));
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  });
  await page.goto('/');
  const plan=page.getByTestId('personal-plan-home-card');
  await expect(plan).toBeVisible();
  await expect(plan).toContainText('Mittag und Energie beobachten');
  await expect(page.getByTestId('personal-plan-first-step')).toContainText('Mittag-Check-in');
  await expect(page.getByTestId('personal-plan-start')).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('personal-plan-home-mobile.png'),fullPage:true});
  await page.getByTestId('personal-plan-start').click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('home stays generic when no confirmed profile exists',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('rhythm_language_v1','en');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('rhythm_voice_entry_seen_v1','true');
    localStorage.removeItem('rhythm_intro_profile_v1');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  });
  await page.goto('/');
  await expect(page.getByTestId('personal-plan-home-card')).toHaveCount(0);
  await expect(page.getByTestId('primary-capture-button')).toBeVisible();
});
