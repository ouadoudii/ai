import { expect, test } from '@playwright/test';

test('evening check-in offers a missed midday moment before continuing',async({page},testInfo)=>{
  await page.setViewportSize({width:390,height:844});
  await page.clock.setFixedTime(new Date('2026-09-14T19:00:00'));
  await page.addInitScript(()=>{
    localStorage.setItem('rhythm_language_v1','en');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('rhythm_voice_entry_seen_v1','true');
    localStorage.setItem('nimmapp_moments_v1','[]');
    localStorage.setItem('nimmapp_checkins_v1','[]');
    localStorage.removeItem('rhythm_intro_profile_v1');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  });

  await page.goto('/');
  const eveningCard=page.getByRole('button').filter({hasText:'Good evening'});
  await expect(eveningCard).toBeVisible();
  await eveningCard.click();

  await expect(page.getByRole('heading',{name:'Want to add what you ate?'})).toBeVisible();
  await expect(page.getByText('A midday moment')).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('evening-missed-midday-catchup.png'),fullPage:true});

  await page.getByRole('button',{name:'Add this moment'}).click();
  await expect(page.getByRole('heading',{name:'Want to add what you ate?'})).toHaveCount(0);

  await eveningCard.click();
  await expect(page.getByRole('dialog')).toBeVisible();
});
