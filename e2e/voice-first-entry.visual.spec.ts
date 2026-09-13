import { expect, test } from '@playwright/test';

type AppLanguage='en'|'ar'|'de'|'fr';

const cases:Array<{language:AppLanguage;prompt:string;start:string}>=[
  {language:'de',prompt:'Erzähl mir, wie dein Tag war.',start:'Erzählen'},
  {language:'en',prompt:'Tell me how your day was.',start:'Tell me'},
  {language:'fr',prompt:'Raconte-moi ta journée.',start:'Raconter'},
  {language:'ar',prompt:'احكي لي كيف كان يومك.',start:'ابدأ بالكلام'},
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
  test(`${copy.language} shows the blocking localized voice-first entry`,async({page})=>{
    await seedFirstVoiceEntry(page,copy.language);
    await page.goto('/');
    const overlay=page.getByTestId('voice-first-entry-overlay');
    await expect(overlay).toBeVisible();
    await expect(overlay.getByRole('heading',{name:copy.prompt,exact:true})).toBeVisible();
    await expect(overlay.getByRole('button',{name:copy.start,exact:true})).toBeFocused();
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
