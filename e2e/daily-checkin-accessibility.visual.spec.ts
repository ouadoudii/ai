import { expect, test, type Page } from '@playwright/test';

async function seedPersonalPlan(page:Page){
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
}

test('daily check-in traps keyboard focus, names sliders, and restores focus after Escape',async({page})=>{
  // Keep this accessibility flow deterministic: step 1 has the meal sliders only
  // during midday/evening. A fixed midday clock prevents CI wall-clock changes
  // from silently switching the modal to the morning sleep flow.
  await page.clock.setFixedTime(new Date('2026-09-25T12:00:00'));
  await seedPersonalPlan(page);
  await page.goto('/');

  const trigger=page.getByTestId('personal-plan-start');
  await expect(trigger).toBeVisible();
  await trigger.focus();
  await trigger.click();

  const dialog=page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-labelledby','daily-checkin-title');
  await expect(dialog).toHaveAttribute('aria-describedby','daily-checkin-description');
  await expect(page.getByRole('button',{name:'Schließen'})).toBeFocused();

  await expect(dialog.getByRole('slider',{name:'Wie hungrig warst du?'})).toBeVisible();
  await expect(dialog.getByRole('slider',{name:'Wie satt hast du dich danach gefühlt?'})).toBeVisible();
  await page.getByRole('button',{name:'Noch ein Schritt'}).click();
  await expect(dialog.getByRole('slider',{name:'Wie ist deine Energie gerade?'})).toBeVisible();
  await page.getByRole('button',{name:'Zurück'}).click();

  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button',{name:'Noch ein Schritt'})).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.getByRole('button',{name:'Schließen'})).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await page.screenshot({path:'test-results/daily-checkin-accessible-sliders.png',fullPage:true});
});