import { expect, test } from '@playwright/test';

type LegacyLanguage='en'|'ar'|'de'|'fr';

const legacyLanguages:LegacyLanguage[]=['de','en','fr','ar'];
const arabic={prompt:'ما الذي أتى بك إلينا؟ احكِ لي قليلاً عنك.',start:'ابدأ بالكلام',type:'أفضل الكتابة',form:'نموذج سريع'};

async function seedNewUser(page:any,language:LegacyLanguage){
  await page.addInitScript(({language})=>{
    localStorage.setItem('rhythm_language_v1',language);
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('nimmapp_moments_v1','[]');
    localStorage.setItem('nimmapp_checkins_v1','[]');
    if(sessionStorage.getItem('required_intro_test_seeded')!=='true'){
      localStorage.removeItem('rhythm_intro_profile_v1');
      sessionStorage.setItem('required_intro_test_seeded','true');
    }
    localStorage.setItem('rhythm_voice_entry_seen_v1','true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  },{language});
}

for(const legacyLanguage of legacyLanguages){
  test(`legacy ${legacyLanguage} requires the Arabic onboarding path`,async({page})=>{
    await seedNewUser(page,legacyLanguage);
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang','ar');
    await expect(page.locator('html')).toHaveAttribute('dir','rtl');
    const overlay=page.getByTestId('voice-first-entry-overlay');
    await expect(overlay).toBeVisible();
    await expect(overlay.getByRole('heading',{name:arabic.prompt,exact:true})).toBeVisible();
    const mic=overlay.getByRole('button',{name:arabic.start,exact:true});
    const type=overlay.getByRole('button',{name:arabic.type,exact:true});
    const form=overlay.getByRole('button',{name:arabic.form,exact:true});
    await expect(mic).toBeFocused();
    await page.keyboard.press('Tab');await expect(type).toBeFocused();
    await page.keyboard.press('Tab');await expect(form).toBeFocused();
    await page.keyboard.press('Tab');await expect(mic).toBeFocused();
    await expect(overlay.getByText(/later|später|لاحق|plus tard/i)).toHaveCount(0);
    await expect(page.locator('#root')).toHaveAttribute('inert','');
  });
}

test('closing profile voice capture returns to the required gate',async({page})=>{
  await seedNewUser(page,'de');
  await page.goto('/');
  await page.getByTestId('voice-first-entry-mic').click();
  await expect(page.getByTestId('voice-first-entry-overlay')).toHaveCount(0);
  await expect(page.locator('[data-profile-onboarding="true"]')).toBeVisible();
  await page.getByRole('button',{name:'رجوع'}).click();
  await expect(page.getByTestId('voice-first-entry-overlay')).toBeVisible();
  await expect(page.locator('#root')).toHaveAttribute('inert','');
});

test('closing free writing returns to the required gate',async({page})=>{
  await seedNewUser(page,'de');
  await page.goto('/');
  await page.getByTestId('voice-first-entry-type').click();
  await expect(page.getByTestId('profile-intro-modal')).toBeVisible();
  await page.getByRole('button',{name:'رجوع'}).click();
  await expect(page.getByTestId('voice-first-entry-overlay')).toBeVisible();
  await expect(page.locator('#root')).toHaveAttribute('inert','');
});

test('typing path creates a semantic personal plan and unlocks only after confirmation',async({page})=>{
  await seedNewUser(page,'de');
  await page.route('**/api/coach-chat',async route=>{
    const body=JSON.parse(route.request().postData()||'{}');
    expect(body.query).toContain('Choose the plan semantically from the whole message');
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({reply:JSON.stringify({
      summary:'تريد أن تفهم يومك بوعي أكبر.',priorities:['الأكل بانتظام','فهم الطاقة'],preferences:['روتين بسيط'],
      firstPlan:{title:'مراقبة الغداء والطاقة',rationale:'نبدأ من العلاقة التي لاحظتها بنفسك.',focusAreas:['الغداء','طاقة بعد الظهر'],firstStep:'سجّل ما أكلته وطاقة جسمك في تسجيل الظهر القادم.',phase:'midday'}
    })})});
  });
  await page.goto('/');
  await page.getByTestId('voice-first-entry-type').click();
  await page.getByTestId('profile-intro-textarea').fill('آكل غالباً في أوقات غير منتظمة وأريد أن أفهم لماذا تنخفض طاقتي بعد الظهر. الروتين البسيط يناسبني.');
  await page.getByTestId('profile-intro-build').click();
  await expect(page.getByRole('heading',{name:'هكذا فهمتك'})).toBeVisible();
  await expect(page.getByTestId('personal-first-plan')).toContainText('مراقبة الغداء والطاقة');
  await expect.poll(()=>page.evaluate(()=>localStorage.getItem('rhythm_intro_profile_v1'))).toBeNull();
  await page.getByTestId('profile-confirm').click();
  await expect.poll(()=>page.evaluate(()=>Boolean(localStorage.getItem('rhythm_intro_profile_v1')))).toBe(true);
  await expect(page.getByTestId('voice-first-entry-overlay')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'سجّل لحظة',exact:true}).filter({visible:true}).first()).toBeVisible();
});

test('quick form persists context and unlocks the app',async({page})=>{
  await seedNewUser(page,'de');
  await page.route('**/api/coach-chat',async route=>{
    const body=JSON.parse(route.request().postData()||'{}');
    expect(body.query).toContain('الجوع الآن: 4/5');
    expect(body.query).toContain('الطاقة الآن: 2/5');
    expect(body.query).toContain('الوزن (اختياري): 82 كغ');
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({reply:JSON.stringify({summary:'تريد مزيداً من الاستقرار في يومك.',priorities:['فهم الجوع'],preferences:['خطوات بسيطة'],firstPlan:{title:'مراقبة الجوع',rationale:'نبدأ من يومك المعتاد.',focusAreas:['الجوع','الطاقة'],firstStep:'راقب الجوع والطاقة في تسجيلك القادم.',phase:'midday'}})})});
  });
  await page.goto('/');
  await page.getByTestId('voice-first-entry-form').click();
  await page.getByTestId('onboarding-goal').fill('أريد أن أفهم جوعي بشكل أفضل.');
  await page.getByTestId('onboarding-weight').fill('82');
  await page.getByTestId('onboarding-hunger').fill('4');
  await page.getByTestId('onboarding-energy').fill('2');
  await page.getByTestId('onboarding-rhythm').selectOption('irregular');
  await page.getByTestId('onboarding-form-save').click();
  await expect.poll(()=>page.evaluate(()=>Boolean(localStorage.getItem('rhythm_intro_profile_v1')))).toBe(true);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('rhythm_intro_profile_v1')||'{}'));
  expect(saved.rawIntro).toContain('82 كغ');
  expect(saved.rawIntro).toContain('الجوع الآن: 4/5');
  expect(saved.rawIntro).toContain('الطاقة الآن: 2/5');
  await expect(page.getByTestId('voice-first-entry-overlay')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'سجّل لحظة',exact:true}).filter({visible:true}).first()).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('voice-first-entry-overlay')).toHaveCount(0);
});

test('quick form same-tick double activation submits profile generation once',async({page},testInfo)=>{
  await seedNewUser(page,'en');
  let calls=0;
  await page.route('**/api/coach-chat',async route=>{
    calls+=1;
    await new Promise(resolve=>setTimeout(resolve,250));
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({reply:JSON.stringify({summary:'تريد طاقة أكثر استقراراً.',priorities:['الطاقة'],preferences:['خطوات بسيطة'],firstPlan:{title:'تتبّع الطاقة',rationale:'ابدأ بما تلاحظه.',focusAreas:['الطاقة'],firstStep:'لاحظ طاقتك في تسجيلك القادم.',phase:'midday'}})})});
  });
  await page.goto('/');
  await page.getByTestId('voice-first-entry-form').click();
  await page.getByTestId('onboarding-goal').fill('أريد طاقة أكثر استقراراً.');
  await page.getByTestId('onboarding-form-save').evaluate((button:HTMLButtonElement)=>{button.click();button.click();});
  await expect.poll(()=>calls).toBe(1);
  await expect.poll(()=>page.evaluate(()=>Boolean(localStorage.getItem('rhythm_intro_profile_v1')))).toBe(true);
  await expect(page.getByTestId('voice-first-entry-overlay')).toHaveCount(0);
  await page.screenshot({path:testInfo.outputPath('onboarding-double-submit-guard.png'),fullPage:true});
});

for (const [script, enteredWeight] of [
  ['Arabic-Indic', '٨٢٫٥'],
  ['Persian', '۸۲٫۵'],
] as const) {
  test(`quick form accepts ${script} numerals and stores normalized weight`, async ({ page }) => {
    await seedNewUser(page, 'en');
    await page.route('**/api/coach-chat', async route => {
      const body = JSON.parse(route.request().postData() || '{}');
      expect(body.query).toContain('الوزن (اختياري): 82.5 كغ');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reply: JSON.stringify({
            summary: 'أريد متابعة صحتي.',
            priorities: ['متابعة الوزن'],
            preferences: ['خطوات بسيطة'],
            firstPlan: {
              title: 'متابعة يومية',
              rationale: 'نبدأ بالملاحظة.',
              focusAreas: ['الوزن'],
              firstStep: 'سجّل ما تلاحظه اليوم.',
              phase: 'midday',
            },
          }),
        }),
      });
    });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await page.getByTestId('voice-first-entry-form').click();
    await page.getByTestId('onboarding-goal').fill('أريد متابعة صحتي.');
    const weight = page.getByTestId('onboarding-weight');
    await weight.focus();
    await weight.pressSequentially(enteredWeight);
    await expect(weight).toHaveValue(enteredWeight);
    await expect(weight).not.toHaveAttribute('aria-invalid', 'true');
    await page.getByTestId('onboarding-form-save').click();
    await expect.poll(() => page.evaluate(() => localStorage.getItem('rhythm_intro_profile_v1'))).not.toBeNull();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('rhythm_intro_profile_v1') || '{}'));
    expect(saved.rawIntro).toContain('82.5 كغ');
    await expect(page.getByTestId('voice-first-entry-overlay')).toHaveCount(0);
  });
}
