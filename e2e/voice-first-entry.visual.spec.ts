import { expect, test } from '@playwright/test';

type AppLanguage='en'|'ar'|'de'|'fr';

const cases:Array<{language:AppLanguage;prompt:string;start:string;skip:string}>=[
  {language:'de',prompt:'Erzähl mir, wie dein Tag war.',start:'Erzählen',skip:'Ohne Spracheingabe weiter'},
  {language:'en',prompt:'Tell me how your day was.',start:'Tell me',skip:'Continue without voice'},
  {language:'fr',prompt:'Raconte-moi ta journée.',start:'Raconter',skip:'Continuer sans parler'},
  {language:'ar',prompt:'احكي لي كيف كان يومك.',start:'ابدأ بالكلام',skip:'متابعة بدون صوت'},
];

async function seedFirstVoiceEntry(page:any,language:AppLanguage){
  await page.addInitScript(({language})=>{
    localStorage.setItem('rhythm_language_v1',language);
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('nimmapp_moments_v1','[]');
    localStorage.setItem('nimmapp_checkins_v1','[]');
    localStorage.removeItem('rhythm_voice_entry_seen_v1');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  },{language});
}

for(const copy of cases){
  test(`${copy.language} shows the localized voice-first entry with a keyboard-accessible skip`,async({page})=>{
    await seedFirstVoiceEntry(page,copy.language);
    await page.goto('/');
    const overlay=page.getByTestId('voice-first-entry-overlay');
    await expect(overlay).toBeVisible();
    await expect(overlay.getByRole('heading',{name:copy.prompt,exact:true})).toBeVisible();
    const mic=overlay.getByRole('button',{name:copy.start,exact:true});
    const skip=overlay.getByRole('button',{name:copy.skip,exact:true});
    await expect(mic).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(skip).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(mic).toBeFocused();
    await expect(page.locator('#root')).toHaveAttribute('inert','');
    await expect(page.locator('#root')).toHaveAttribute('aria-hidden','true');
  });
}

test('voice-first microphone unlocks the app and opens the existing recorder directly',async({page})=>{
  await seedFirstVoiceEntry(page,'de');
  await page.goto('/');
  await page.getByTestId('voice-first-entry-mic').click();
  await expect(page.getByTestId('voice-first-entry-overlay')).toHaveCount(0);
  await expect(page.locator('#root')).not.toHaveAttribute('inert','');
  await expect(page.getByRole('heading',{name:'Erzähl mir, was du gegessen hast'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Aufnahme starten'})).toBeVisible();
  await expect.poll(()=>page.evaluate(()=>localStorage.getItem('rhythm_voice_entry_seen_v1'))).toBe('true');
});

test('guest can continue without microphone and the entry does not interrupt again',async({page})=>{
  await seedFirstVoiceEntry(page,'en');
  await page.goto('/');
  await page.getByTestId('voice-first-entry-skip').click();
  await expect(page.getByTestId('voice-first-entry-overlay')).toHaveCount(0);
  await expect(page.locator('#root')).not.toHaveAttribute('inert','');
  await expect(page.getByTestId('primary-capture-button')).toBeVisible();
  await expect(page.getByRole('heading',{name:'Tell me what you ate'})).toHaveCount(0);
  await expect.poll(()=>page.evaluate(()=>localStorage.getItem('rhythm_voice_entry_seen_v1'))).toBe('true');
  await page.reload();
  await expect(page.getByTestId('voice-first-entry-overlay')).toHaveCount(0);
});
