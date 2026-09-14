import { describe, expect, it } from 'vitest';
import { PROFILE_INTRO_KEY, shouldShowVoiceFirstEntry, voiceFirstEntryCopy } from './components/VoiceFirstEntryOverlay';

describe('required first onboarding',()=>{
  it('only unlocks once an intro profile exists',()=>{
    const storage={getItem:(key:string)=>key===PROFILE_INTRO_KEY?null:'true'};
    expect(shouldShowVoiceFirstEntry(storage)).toBe(true);
    expect(shouldShowVoiceFirstEntry({getItem:key=>key===PROFILE_INTRO_KEY?'saved-profile':null})).toBe(false);
  });

  it.each([
    ['de','Was führt dich zu uns? Erzähl ein bisschen von dir.','Erzählen','Frei schreiben','Kurzformular'],
    ['en','What brings you here? Tell me a little about you.','Tell me','Write freely','Quick form'],
    ['fr','Qu’est-ce qui t’amène ici ? Parle-moi un peu de toi.','Raconter','Écrire librement','Formulaire rapide'],
    ['ar','ما الذي أتى بك إلينا؟ احكِ لي قليلاً عنك.','ابدأ بالكلام','أفضل الكتابة','نموذج سريع'],
  ] as const)('localizes all required onboarding paths for %s',(language,prompt,start,type,form)=>{
    const copy=voiceFirstEntryCopy(language);
    expect(copy.prompt).toBe(prompt);
    expect(copy.start).toBe(start);
    expect(copy.type).toBe(type);
    expect(copy.form).toBe(form);
    expect(copy.helper.length).toBeGreaterThan(20);
    expect(copy.formTitle.length).toBeGreaterThan(10);
    expect(copy.goal.length).toBeGreaterThan(10);
  });
});
