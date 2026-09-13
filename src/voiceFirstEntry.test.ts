import { describe, expect, it } from 'vitest';
import { VOICE_FIRST_ENTRY_SEEN_KEY, voiceFirstEntryCopy } from './components/VoiceFirstEntryOverlay';

describe('voice-first entry copy',()=>{
  it('keeps a stable persistence key for the first-entry gate',()=>{
    expect(VOICE_FIRST_ENTRY_SEEN_KEY).toBe('rhythm_voice_entry_seen_v1');
  });

  it.each([
    ['de','Was führt dich zu uns? Erzähl ein bisschen von dir.','Erzählen','Lieber tippen','Später erzählen'],
    ['en','What brings you here? Tell me a little about you.','Tell me','I’d rather type','Tell you later'],
    ['fr','Qu’est-ce qui t’amène ici ? Parle-moi un peu de toi.','Raconter','Je préfère écrire','Raconter plus tard'],
    ['ar','ما الذي أتى بك إلينا؟ احكِ لي قليلاً عنك.','ابدأ بالكلام','أفضل الكتابة','أحكي لاحقاً'],
  ] as const)('localizes the first-run profile prompt for %s',(language,prompt,start,type,skip)=>{
    const copy=voiceFirstEntryCopy(language);
    expect(copy.prompt).toBe(prompt);
    expect(copy.start).toBe(start);
    expect(copy.type).toBe(type);
    expect(copy.skip).toBe(skip);
    expect(copy.helper.length).toBeGreaterThan(20);
    expect(copy.hint.length).toBeGreaterThan(10);
  });
});
