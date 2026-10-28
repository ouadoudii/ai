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
  await expect(plan).toContainText('خطوتك الأولى');
  await expect(page.getByTestId('personal-plan-first-step')).toContainText('في تسجيلك القادم');
  await expect(plan).not.toContainText('Mittag und Energie beobachten');
  await expect(plan).not.toContainText('Du möchtest verstehen');
  await expect(plan).not.toContainText('Mittagessen');
  // Presentation-only migration: the user's original plan remains intact.
  const savedTitle=await page.evaluate(()=>JSON.parse(localStorage.getItem('rhythm_intro_profile_v1')||'{}').firstPlan?.title);
  expect(savedTitle).toBe('Mittag und Energie beobachten');
  await expect(page.locator('html')).toHaveAttribute('lang','ar');
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  await expect(page.getByTestId('personal-plan-start')).toHaveText('ابدأ تسجيل منتصف اليوم');
  await page.screenshot({path:testInfo.outputPath('personal-plan-home-mobile.png'),fullPage:true});
  await page.getByTestId('personal-plan-start').click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('home stays generic and requires onboarding when no confirmed profile exists',async({page})=>{
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
  await expect(page.getByTestId('voice-first-entry-overlay')).toBeVisible();
  await expect(page.locator('#root')).toHaveAttribute('inert','');
  await expect(page.getByTestId('voice-first-entry-overlay').getByRole('button',{name:'أفضل الكتابة',exact:true})).toBeEnabled();
});

test('mobile My moments navigation opens the chronology instead of returning to Today',async({page},testInfo)=>{
  await page.setViewportSize({width:390,height:844});
  await page.addInitScript(()=>{
    localStorage.setItem('rhythm_language_v1','de');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('rhythm_voice_entry_seen_v1','true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  });
  await page.goto('/');
  await page.getByTestId('mobile-moments-nav').click();
  await expect(page.locator('html')).toHaveAttribute('lang','ar');
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  await expect(page.getByRole('heading',{name:'اليوميات والتسلسل الزمني'})).toBeVisible();
  await expect(page.getByText('الأرشيف الزمني')).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('mobile-moments-chronology.png'),fullPage:true});
});

test('mobile navigation exposes the active destination to assistive technology',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.addInitScript(()=>{
    localStorage.setItem('rhythm_language_v1','de');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('rhythm_voice_entry_seen_v1','true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang','ar');
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  await expect(page.getByRole('button',{name:'اليوم',exact:true})).toHaveAttribute('aria-current','page');
  await page.getByTestId('mobile-moments-nav').click();
  await expect(page.getByTestId('mobile-moments-nav')).toHaveAttribute('aria-current','page');
  await expect(page.getByRole('button',{name:'اليوم',exact:true})).not.toHaveAttribute('aria-current','page');
});


test('legacy French profile shows Arabic-only generic plan fallback',async({page},testInfo)=>{
  await page.setViewportSize({width:1280,height:900});
  await page.addInitScript(()=>{
    localStorage.setItem('rhythm_language_v1','fr');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('rhythm_voice_entry_seen_v1','true');
    localStorage.setItem('nimmapp_moments_v1','[]');
    localStorage.setItem('nimmapp_checkins_v1','[]');
    localStorage.setItem('rhythm_intro_profile_v1',JSON.stringify({
      summary:'Je veux mieux comprendre mon énergie.',
      priorities:[],
      preferences:[],
      rawIntro:'Je veux mieux comprendre mon énergie.',
      confirmedAt:Date.now(),
      firstPlan:{
        title:'Your first step',
        rationale:'Je veux mieux comprendre mon énergie.',
        focusAreas:[],
        firstStep:'At your next check-in, notice what stands out in your everyday rhythm.',
        phase:'midday'
      }
    }));
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  });
  await page.goto('/');
  const plan=page.getByTestId('personal-plan-home-card');
  await expect(plan).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang','ar');
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  await expect(plan).toContainText('خطوتك الأولى');
  await expect(page.getByTestId('personal-plan-first-step')).toContainText('في تسجيلك القادم');
  await expect(plan).not.toContainText('Your first step');
  await expect(plan).not.toContainText('At your next check-in');
  await expect(plan).not.toContainText('Je veux mieux comprendre mon énergie.');
  const savedRationale=await page.evaluate(()=>JSON.parse(localStorage.getItem('rhythm_intro_profile_v1')||'{}').firstPlan?.rationale);
  expect(savedRationale).toBe('Je veux mieux comprendre mon énergie.');
  await page.screenshot({path:testInfo.outputPath('personal-plan-home-legacy-french-arabic-desktop.png'),fullPage:true});
});
