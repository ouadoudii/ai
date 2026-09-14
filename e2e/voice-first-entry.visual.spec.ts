import { expect, test } from '@playwright/test';

type AppLanguage='en'|'ar'|'de'|'fr';

const cases:Array<{language:AppLanguage;prompt:string;start:string;type:string;skip:string}>=[
  {language:'de',prompt:'Was führt dich zu uns? Erzähl ein bisschen von dir.',start:'Erzählen',type:'Lieber tippen',skip:'Später erzählen'},
  {language:'en',prompt:'What brings you here? Tell me a little about you.',start:'Tell me',type:'I’d rather type',skip:'Tell you later'},
  {language:'fr',prompt:"Qu’est-ce qui t’amène ici ? Parle-moi un peu de toi.",start:'Raconter',type:'Je préfère écrire',skip:'Raconter plus tard'},
  {language:'ar',prompt:'ما الذي أتى بك إلينا؟ احكِ لي قليلاً عنك.',start:'ابدأ بالكلام',type:'أفضل الكتابة',skip:'أحكي لاحقاً'},
];

async function seedFirstVoiceEntry(page:any,language:AppLanguage){
  await page.addInitScript(({language})=>{
    localStorage.setItem('rhythm_language_v1',language);
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('nimmapp_moments_v1','[]');
    localStorage.setItem('nimmapp_checkins_v1','[]');
    if(sessionStorage.getItem('voice_entry_test_seeded')!=='true'){
      localStorage.removeItem('rhythm_intro_profile_v1');
      localStorage.removeItem('rhythm_voice_entry_seen_v1');
      sessionStorage.setItem('voice_entry_test_seeded','true');
    }
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  },{language});
}

for(const copy of cases){
  test(`${copy.language} shows localized profile onboarding with keyboard escape paths`,async({page})=>{
    await seedFirstVoiceEntry(page,copy.language);
    await page.goto('/');
    const overlay=page.getByTestId('voice-first-entry-overlay');
    await expect(overlay).toBeVisible();
    await expect(overlay.getByRole('heading',{name:copy.prompt,exact:true})).toBeVisible();
    const mic=overlay.getByRole('button',{name:copy.start,exact:true});
    const type=overlay.getByRole('button',{name:copy.type,exact:true});
    const skip=overlay.getByRole('button',{name:copy.skip,exact:true});
    await expect(mic).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(type).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(skip).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(mic).toBeFocused();
    await expect(page.locator('#root')).toHaveAttribute('inert','');
    await expect(page.locator('#root')).toHaveAttribute('aria-hidden','true');
  });
}

test('voice-first microphone opens the dedicated profile recorder without completing onboarding',async({page})=>{
  await seedFirstVoiceEntry(page,'de');
  await page.goto('/');
  await page.getByTestId('voice-first-entry-mic').click();
  await expect(page.getByTestId('voice-first-entry-overlay')).toHaveCount(0);
  await expect(page.locator('#root')).not.toHaveAttribute('inert','');
  await expect(page.getByRole('heading',{name:'Erzähl mir ein bisschen von dir'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Aufnahme starten'})).toBeVisible();
  await expect.poll(()=>page.evaluate(()=>localStorage.getItem('rhythm_voice_entry_seen_v1'))).toBeNull();
});

test('aborted microphone onboarding is offered again on the next app launch',async({page})=>{
  await seedFirstVoiceEntry(page,'de');
  await page.goto('/');
  await page.getByTestId('voice-first-entry-mic').click();
  await page.getByRole('button',{name:'Schließen'}).click();
  await expect.poll(()=>page.evaluate(()=>localStorage.getItem('rhythm_voice_entry_seen_v1'))).toBeNull();
  await page.reload();
  await expect(page.getByTestId('voice-first-entry-overlay')).toBeVisible();
  await expect(page.getByRole('heading',{name:'Was führt dich zu uns? Erzähl ein bisschen von dir.',exact:true})).toBeVisible();
});

test('typing path creates a semantic personal plan and only saves after confirmation',async({page})=>{
  await seedFirstVoiceEntry(page,'de');
  await page.route('**/api/coach-chat',async route=>{
    const body=JSON.parse(route.request().postData()||'{}');
    expect(body.query).toContain('Choose the plan semantically from the whole message');
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({reply:JSON.stringify({
      summary:'Du möchtest deinen Alltag bewusster verstehen.',
      priorities:['regelmäßiger essen','Energie verstehen'],
      preferences:['einfache Routinen'],
      firstPlan:{
        title:'Mittag und Energie beobachten',
        rationale:'Wir starten dort, wo du selbst einen Zusammenhang vermutest.',
        focusAreas:['Mittagessen','Nachmittagsenergie'],
        firstStep:'Halte beim nächsten Mittag-Check-in fest, was du gegessen hast und wie deine Energie danach ist.',
        phase:'midday'
      }
    })})});
  });
  await page.goto('/');
  await page.getByTestId('voice-first-entry-type').click();
  await expect(page.getByRole('heading',{name:'Erzähl mir ein bisschen von dir'})).toBeVisible();
  await expect.poll(()=>page.evaluate(()=>localStorage.getItem('rhythm_voice_entry_seen_v1'))).toBeNull();
  await page.getByTestId('profile-intro-textarea').fill('Ich esse oft unregelmäßig und möchte verstehen, warum meine Energie nachmittags absackt. Einfache Routinen passen gut zu mir.');
  await page.getByTestId('profile-intro-build').click();
  await expect(page.getByRole('heading',{name:'So habe ich dich verstanden'})).toBeVisible();
  await expect(page.getByTestId('profile-summary')).toHaveValue('Du möchtest deinen Alltag bewusster verstehen.');
  const plan=page.getByTestId('personal-first-plan');
  await expect(plan).toBeVisible();
  await expect(plan).toContainText('Mittag und Energie beobachten');
  await expect(plan).toContainText('Mittagessen');
  await expect(plan).toContainText('Nachmittagsenergie');
  await expect(page.getByTestId('personal-first-step')).toContainText('Mittag-Check-in');
  await expect.poll(()=>page.evaluate(()=>localStorage.getItem('rhythm_intro_profile_v1'))).toBeNull();
  await page.getByTestId('profile-confirm').click();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('rhythm_intro_profile_v1')||'{}'));
  expect(saved.summary).toBe('Du möchtest deinen Alltag bewusster verstehen.');
  expect(saved.priorities).toEqual(['regelmäßiger essen','Energie verstehen']);
  expect(saved.preferences).toEqual(['einfache Routinen']);
  expect(saved.firstPlan.title).toBe('Mittag und Energie beobachten');
  expect(saved.firstPlan.phase).toBe('midday');
  expect(saved.firstPlan.focusAreas).toEqual(['Mittagessen','Nachmittagsenergie']);
  expect(saved.rawIntro).toContain('unregelmäßig');
  expect(typeof saved.confirmedAt).toBe('number');
  await page.reload();
  await expect(page.getByTestId('voice-first-entry-overlay')).toHaveCount(0);
});

test('guest can continue without microphone and the entry does not interrupt again',async({page})=>{
  await seedFirstVoiceEntry(page,'en');
  await page.goto('/');
  await page.getByTestId('voice-first-entry-skip').click();
  await expect(page.getByTestId('voice-first-entry-overlay')).toHaveCount(0);
  await expect(page.locator('#root')).not.toHaveAttribute('inert','');
  await expect(page.getByTestId('primary-capture-button')).toBeVisible();
  await expect.poll(()=>page.evaluate(()=>localStorage.getItem('rhythm_voice_entry_seen_v1'))).toBe('true');
  await page.reload();
  await expect(page.getByTestId('voice-first-entry-overlay')).toHaveCount(0);
  await expect(page.getByTestId('primary-capture-button')).toBeVisible();
});
