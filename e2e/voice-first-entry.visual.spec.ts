import { expect, test } from '@playwright/test';

type AppLanguage='en'|'ar'|'de'|'fr';

const cases:Array<{language:AppLanguage;prompt:string;start:string;type:string;form:string}>=[
  {language:'de',prompt:'Was führt dich zu uns? Erzähl ein bisschen von dir.',start:'Erzählen',type:'Frei schreiben',form:'Kurzformular'},
  {language:'en',prompt:'What brings you here? Tell me a little about you.',start:'Tell me',type:'Write freely',form:'Quick form'},
  {language:'fr',prompt:"Qu’est-ce qui t’amène ici ? Parle-moi un peu de toi.",start:'Raconter',type:'Écrire librement',form:'Formulaire rapide'},
  {language:'ar',prompt:'ما الذي أتى بك إلينا؟ احكِ لي قليلاً عنك.',start:'ابدأ بالكلام',type:'أفضل الكتابة',form:'نموذج سريع'},
];

async function seedNewUser(page:any,language:AppLanguage){
  await page.addInitScript(({language})=>{
    localStorage.setItem('rhythm_language_v1',language);
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('nimmapp_moments_v1','[]');
    localStorage.setItem('nimmapp_checkins_v1','[]');
    localStorage.removeItem('rhythm_intro_profile_v1');
    localStorage.setItem('rhythm_voice_entry_seen_v1','true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  },{language});
}

for(const copy of cases){
  test(`${copy.language} requires one localized onboarding path`,async({page})=>{
    await seedNewUser(page,copy.language);
    await page.goto('/');
    const overlay=page.getByTestId('voice-first-entry-overlay');
    await expect(overlay).toBeVisible();
    await expect(overlay.getByRole('heading',{name:copy.prompt,exact:true})).toBeVisible();
    const mic=overlay.getByRole('button',{name:copy.start,exact:true});
    const type=overlay.getByRole('button',{name:copy.type,exact:true});
    const form=overlay.getByRole('button',{name:copy.form,exact:true});
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
  await page.getByRole('button',{name:'Schließen'}).click();
  await expect(page.getByTestId('voice-first-entry-overlay')).toBeVisible();
  await expect(page.locator('#root')).toHaveAttribute('inert','');
});

test('closing free writing returns to the required gate',async({page})=>{
  await seedNewUser(page,'de');
  await page.goto('/');
  await page.getByTestId('voice-first-entry-type').click();
  await expect(page.getByTestId('profile-intro-modal')).toBeVisible();
  await page.getByRole('button',{name:'Zurück'}).click();
  await expect(page.getByTestId('voice-first-entry-overlay')).toBeVisible();
  await expect(page.locator('#root')).toHaveAttribute('inert','');
});

test('typing path creates a semantic personal plan and unlocks only after confirmation',async({page})=>{
  await seedNewUser(page,'de');
  await page.route('**/api/coach-chat',async route=>{
    const body=JSON.parse(route.request().postData()||'{}');
    expect(body.query).toContain('Choose the plan semantically from the whole message');
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({reply:JSON.stringify({
      summary:'Du möchtest deinen Alltag bewusster verstehen.',priorities:['regelmäßiger essen','Energie verstehen'],preferences:['einfache Routinen'],
      firstPlan:{title:'Mittag und Energie beobachten',rationale:'Wir starten dort, wo du selbst einen Zusammenhang vermutest.',focusAreas:['Mittagessen','Nachmittagsenergie'],firstStep:'Halte beim nächsten Mittag-Check-in fest, was du gegessen hast und wie deine Energie danach ist.',phase:'midday'}
    })})});
  });
  await page.goto('/');
  await page.getByTestId('voice-first-entry-type').click();
  await page.getByTestId('profile-intro-textarea').fill('Ich esse oft unregelmäßig und möchte verstehen, warum meine Energie nachmittags absackt. Einfache Routinen passen gut zu mir.');
  await page.getByTestId('profile-intro-build').click();
  await expect(page.getByRole('heading',{name:'So habe ich dich verstanden'})).toBeVisible();
  await expect(page.getByTestId('personal-first-plan')).toContainText('Mittag und Energie beobachten');
  await expect.poll(()=>page.evaluate(()=>localStorage.getItem('rhythm_intro_profile_v1'))).toBeNull();
  await page.getByTestId('profile-confirm').click();
  await expect.poll(()=>page.evaluate(()=>Boolean(localStorage.getItem('rhythm_intro_profile_v1')))).toBe(true);
  await expect(page.getByTestId('voice-first-entry-overlay')).toHaveCount(0);
  await expect(page.getByTestId('primary-capture-button')).toBeVisible();
});

test('quick form persists context and unlocks the app',async({page})=>{
  await seedNewUser(page,'de');
  await page.route('**/api/coach-chat',async route=>{
    const body=JSON.parse(route.request().postData()||'{}');
    expect(body.query).toContain('Hunger gerade: 4/5');
    expect(body.query).toContain('Energie gerade: 2/5');
    expect(body.query).toContain('Gewicht (optional): 82 kg');
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({reply:JSON.stringify({summary:'Du möchtest mehr Stabilität im Alltag.',priorities:['Hunger verstehen'],preferences:['einfache Schritte'],firstPlan:{title:'Hunger beobachten',rationale:'Wir starten mit deinem Alltag.',focusAreas:['Hunger','Energie'],firstStep:'Beobachte Hunger und Energie beim nächsten Check-in.',phase:'midday'}})})});
  });
  await page.goto('/');
  await page.getByTestId('voice-first-entry-form').click();
  await page.getByTestId('onboarding-goal').fill('Ich möchte meinen Hunger besser verstehen.');
  await page.getByTestId('onboarding-weight').fill('82');
  await page.getByTestId('onboarding-hunger').fill('4');
  await page.getByTestId('onboarding-energy').fill('2');
  await page.getByTestId('onboarding-rhythm').selectOption('irregular');
  await page.getByTestId('onboarding-form-save').click();
  await expect.poll(()=>page.evaluate(()=>Boolean(localStorage.getItem('rhythm_intro_profile_v1')))).toBe(true);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('rhythm_intro_profile_v1')||'{}'));
  expect(saved.rawIntro).toContain('82 kg');
  expect(saved.rawIntro).toContain('Hunger gerade: 4/5');
  expect(saved.rawIntro).toContain('Energie gerade: 2/5');
  await expect(page.getByTestId('voice-first-entry-overlay')).toHaveCount(0);
  await expect(page.getByTestId('primary-capture-button')).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('voice-first-entry-overlay')).toHaveCount(0);
});
