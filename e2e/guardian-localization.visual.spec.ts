import { expect, test } from '@playwright/test';

const profile={summary:'Rhythm',priorities:[],preferences:[],rawIntro:'Rhythm',confirmedAt:1,firstPlan:{title:'Observe',rationale:'Notice',focusAreas:[],firstStep:'Capture',phase:'midday'}};
const labels={
  de:{title:'Moment Fürsorge- & Frühwarn-System',clear:'Keine Intervention erforderlich',test:'Alarm testen',sleep:'Schlafmangel',done:'Als erledigt abhaken'},
  en:{title:'Moment Care & Early Warning System',clear:'No intervention needed',test:'Test alarm',sleep:'Sleep deficit',done:'Mark as handled'},
  fr:{title:'Système de vigilance et d’accompagnement Moment',clear:'Aucune intervention nécessaire',test:'Tester une alerte',sleep:'Manque de sommeil',done:'Marquer comme traité'},
  ar:{title:'مساحة لطيفة للاهتمام بنفسك',clear:'هنا متى احتجت',test:'تجربة لطيفة',sleep:'نوم أقل من المعتاد',done:'إخفاء الفكرة'},
} as const;

for(const viewport of [{name:'desktop',width:1280,height:900},{name:'mobile',width:390,height:844}]){
  for(const language of ['de','en','fr','ar'] as const){
    test(`legacy ${language} renders Arabic guardian chrome on ${viewport.name}`,async({page})=>{
      await page.setViewportSize({width:viewport.width,height:viewport.height});
      await page.addInitScript(({profile,language})=>{
        localStorage.setItem('rhythm_language_v1',language);
        localStorage.setItem('cary_access_mode_v1','guest');
        localStorage.setItem('cary_onboarding_v2_complete','true');
        localStorage.setItem('rhythm_voice_entry_seen_v1','true');
        localStorage.setItem('rhythm_intro_profile_v1',JSON.stringify(profile));
        localStorage.setItem('nimmapp_moments_v1','[]');
        localStorage.setItem('nimmapp_checkins_v1','[]');
        localStorage.removeItem('moment.guardian.acknowledged-occurrences.v1');
        sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
      },{profile,language});
      await page.goto('/');
      await page.getByTestId(viewport.name==='desktop'?'desktop-coach-nav':'mobile-coach-nav').click();
      const guardian=page.getByTestId('guardian');
      await expect(guardian.getByText(labels.ar.title)).toBeVisible();
      await expect(guardian.getByText(labels.ar.clear)).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('dir','rtl');
      await expect(page.locator('html')).toHaveAttribute('lang','ar');
      await guardian.getByRole('button',{name:labels.ar.test}).click();
      await expect(guardian.getByTestId('guardian-demo-notice')).toHaveCount(0);
      await guardian.getByRole('button',{name:/الأكل تحت الضغط/}).click();
      await expect(guardian.getByRole('note')).toContainText('هذه أمثلة وليست تسجيلاتك');
      await expect(guardian.getByRole('note')).toHaveAttribute('aria-live','polite');
      await expect(guardian).toContainText('حريرة تناولتها على عجل أمام الشاشة');
      await expect(guardian).not.toContainText(/Schnelles Pastagericht|Mittagessen|Schreibtisch|Simuliert/);
      await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]').length)).toBe(0);
      await expect(guardian).not.toContainText('اختبار تنبيه');
      await expect(guardian).not.toContainText('نقص النوم');
      await guardian.getByRole('button',{name:new RegExp(labels.ar.sleep)}).click();
      await expect(guardian.getByRole('button',{name:new RegExp(labels.ar.done)}).first()).toBeVisible();
      await expect(guardian.getByText('قد تحتاج إلى بعض الراحة اليوم')).toBeVisible();
      await expect(guardian.locator('.animate-pulse, .animate-ping')).toHaveCount(0);
      await expect(guardian.getByText('نمط الأكل الحدسي')).toHaveCount(0);
      await expect(guardian.getByRole('status')).toContainText('أفكار يمكنك تجاهلها');
      await expect(guardian.locator('[class*="bg-rose"], [class*="text-rose"]')).toHaveCount(0);
      await expect(guardian).not.toContainText(/Ghrelin|Ghrelin-Hoch|Küchenschluss|Überessen|28%|Akute Intervention|Heißhunger/);
      await guardian.getByRole('button',{name:/إعادة ضبط/}).click();
      await expect(guardian.getByTestId('guardian-demo-notice')).toHaveCount(0);
      await expect(guardian.getByText(labels.ar.clear)).toBeVisible();
    });
  }
}

for (const viewport of [{ name: 'desktop', width: 1280, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
  test(`Guardian demo never mixes real journal observations on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.addInitScript(({ profile }) => {
      const now = new Date();
      const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
      const realMeal = {
        id: 'private-rushed-meal', title: 'وجبتي الشخصية الخاصة', label: 'غداء',
        category: 'lunch', date, time: '12:40', location: 'المنزل',
        locationCategory: 'home', imageUrl: '', tags: [], createdAt: Date.now() - 1000,
        eatingPace: 'rushed', distraction: 'screen',
      };
      const realCheckIn = {
        id: 'private-sleep', date, time: '07:00', timeOfDay: 'morning',
        sleep: { durationHours: 4.5, quality: 2, wakeFeeling: 'exhausted' },
        wellbeing: { energyLevel: 4 }, createdAt: Date.now() - 1000,
      };
      localStorage.setItem('rhythm_language_v1', 'ar');
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
      localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify(profile));
      localStorage.setItem('nimmapp_moments_v1', JSON.stringify([realMeal]));
      localStorage.setItem('nimmapp_checkins_v1', JSON.stringify([realCheckIn]));
      localStorage.removeItem('moment.guardian.acknowledged-occurrences.v1');
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    }, { profile });

    await page.goto('/');
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    const guardian = page.getByTestId('guardian');
    await expect(guardian).toContainText('وجبتي الشخصية الخاصة');
    await expect(guardian).toContainText('4.5 ساعات نوم');
    const originalStorage = await page.evaluate(() => ({
      meals: localStorage.getItem('nimmapp_moments_v1'),
      checkIns: localStorage.getItem('nimmapp_checkins_v1'),
    }));

    await guardian.getByRole('button', { name: 'تجربة لطيفة' }).click();
    await guardian.getByRole('button', { name: /نوم أقل من المعتاد/ }).click();
    await expect(guardian.getByTestId('guardian-demo-notice')).toContainText('هذه أمثلة وليست تسجيلاتك');
    await expect(guardian).not.toContainText('وجبتي الشخصية الخاصة');
    await expect(guardian).not.toContainText('4.5 ساعات نوم');
    await expect(guardian).toContainText('5 ساعات نوم');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect.poll(() => page.evaluate(() => ({
      meals: localStorage.getItem('nimmapp_moments_v1'),
      checkIns: localStorage.getItem('nimmapp_checkins_v1'),
    }))).toEqual(originalStorage);

    await guardian.getByRole('button', { name: /إعادة ضبط/ }).click();
    await expect(guardian.getByTestId('guardian-demo-notice')).toHaveCount(0);
    await expect(guardian).toContainText('وجبتي الشخصية الخاصة');
    await expect(guardian).toContainText('4.5 ساعات نوم');
  });
}


for (const viewport of [{ name: 'desktop', width: 1280, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
  test(`Guardian demo controls are accessible by keyboard and touch on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.addInitScript((profile) => {
      localStorage.setItem('rhythm_language_v1', 'ar');
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
      localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify(profile));
      localStorage.setItem('nimmapp_moments_v1', '[]');
      localStorage.setItem('nimmapp_checkins_v1', '[]');
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    }, profile);
    await page.goto('/');
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    const guardian = page.getByTestId('guardian');
    const toggle = guardian.getByRole('button', { name: 'تجربة لطيفة' });
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(toggle).toHaveAttribute('aria-controls', 'guardian-demo-scenarios');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toHaveClass(/focus-visible:outline-2/);
    const toggleBox = await toggle.boundingBox();
    expect(toggleBox?.height).toBeGreaterThanOrEqual(44);

    await toggle.focus();
    await expect(toggle).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const scenarios = guardian.getByRole('group', { name: /تجربة اقتراحات الدعم/ });
    await expect(scenarios).toBeVisible();
    const buttons = scenarios.getByRole('button');
    await expect(buttons).toHaveCount(4);
    for (const button of await buttons.all()) {
      const box = await button.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
      await expect(button).toHaveAttribute('type', 'button');
      await expect(button).toHaveClass(/focus-visible:outline-2/);
    }
    const sleep = scenarios.getByRole('button', { name: /نوم أقل من المعتاد/ });
    await sleep.focus();
    await page.keyboard.press('Enter');
    await expect(guardian.getByTestId('guardian-demo-notice')).toContainText('هذه أمثلة وليست تسجيلاتك');
    await expect(guardian).not.toContainText(/Ghrelin|28%|فشل|عقاب|إنذار/);
    await expect(guardian.locator('.animate-pulse, .animate-ping, [class*="bg-red"], [class*="bg-rose"]')).toHaveCount(0);

    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(guardian.getByTestId('guardian-demo-exit')).toBeVisible();
    await guardian.getByTestId('guardian-demo-exit').click();
    await expect(guardian.getByTestId('guardian-demo-notice')).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('nimmapp_checkins_v1'))).toBe('[]');
    expect(await page.evaluate(() => localStorage.getItem('nimmapp_moments_v1'))).toBe('[]');
  });
}


for (const viewport of [{ name: 'desktop', width: 1280, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
  test(`real Guardian suggestions can be dismissed with keyboard and a 44px touch target on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.addInitScript((profile) => {
      const now = new Date();
      const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
      localStorage.setItem('rhythm_language_v1', 'ar');
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
      localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify(profile));
      localStorage.setItem('nimmapp_moments_v1', '[]');
      localStorage.setItem('nimmapp_checkins_v1', JSON.stringify([{
        id: 'accessible-real-sleep', date, time: '07:00', timeOfDay: 'morning',
        sleep: { durationHours: 5, quality: 2, wakeFeeling: 'tired' },
        wellbeing: { energyLevel: 4 }, createdAt: Date.now(),
      }]));
      localStorage.removeItem('moment.guardian.acknowledged-occurrences.v1');
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    }, profile);

    await page.goto('/');
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    const guardian = page.getByTestId('guardian');
    const dismiss = guardian.getByRole('button', { name: 'إخفاء الفكرة: قد تحتاج إلى بعض الراحة اليوم' });
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(dismiss).toBeVisible();
    await expect(dismiss).toHaveClass(/focus-visible:outline-2/);
    const bounds = await dismiss.boundingBox();
    expect(bounds?.height).toBeGreaterThanOrEqual(44);
    await dismiss.focus();
    await expect(dismiss).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(dismiss).toHaveCount(0);
    await expect(guardian.getByRole('status')).toContainText('هنا متى احتجت');
    await expect(guardian).not.toContainText(/فشل|عقاب|إنذار|Ghrelin|28%/);
    await expect(guardian.locator('.animate-pulse, .animate-ping, [class*="bg-red"], [class*="bg-rose"]')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() =>
      JSON.parse(localStorage.getItem('moment.guardian.acknowledged-occurrences.v1') || '[]')
    )).toContain('alarm-sleep-accessible-real-sleep');
    await page.reload();
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    await expect(guardian.getByRole('button', { name: 'إخفاء الفكرة: قد تحتاج إلى بعض الراحة اليوم' })).toHaveCount(0);
    await expect(guardian.getByRole('status')).toContainText('هنا متى احتجت');
  });
}
