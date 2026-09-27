import { expect, test } from '@playwright/test';

test('mounted Today refreshes to the new local day after returning to the app',async({page})=>{
  await page.addInitScript(()=>{
    const RealDate=Date;
    const initial=new RealDate(2026,8,27,23,59,0,0).getTime();
    (window as any).__rhythmNow=initial;
    class MockDate extends RealDate {
      constructor(...args:any[]){super(...(args.length?args:[(window as any).__rhythmNow]) as [any]);}
      static now(){return (window as any).__rhythmNow;}
    }
    Object.setPrototypeOf(MockDate,RealDate);
    (window as any).Date=MockDate;
  });

  await page.goto('/');
  await page.evaluate(()=>{
    localStorage.setItem('rhythm_language_v1','de');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('rhythm_voice_entry_seen_v1','true');
    localStorage.setItem('nimmapp_moments_v1','[]');
    localStorage.setItem('nimmapp_checkins_v1',JSON.stringify([{
      id:'user-checkin-old-morning',date:'2026-09-27',time:'08:00',timeOfDay:'morning',
      food:{mealTitle:'Eier',category:'breakfast'},wellbeing:{mood:'good',energyLevel:4},createdAt:Date.now()
    }]));
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  });
  await page.reload();
  await expect(page.getByText(/Sonntag, 27\. September/i)).toBeVisible();

  await page.evaluate(()=>{
    (window as any).__rhythmNow=new Date(2026,8,28,8,5,0,0).getTime();
    window.dispatchEvent(new Event('focus'));
  });

  await expect(page.getByText(/Montag, 28\. September/i)).toBeVisible();
  const morning=page.getByRole('button').filter({hasText:'Guten Morgen'});
  await expect(morning).toBeVisible();
  await expect(morning).toContainText('Wie hat dein Tag begonnen?');
  await morning.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.screenshot({path:'test-results/reactive-local-day-after-focus.png',fullPage:true});
});
