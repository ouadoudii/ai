import { describe, expect, it } from 'vitest';
import { VOICE_FIRST_ENTRY_SEEN_KEY, voiceFirstEntryCopy } from './components/VoiceFirstEntryOverlay';

describe('voice-first entry copy',()=>{
  it('keeps a stable persistence key for the first-entry gate',()=>{
    expect(VOICE_FIRST_ENTRY_SEEN_KEY).toBe('rhythm_voice_entry_seen_v1');
  });

  it.each([
    ['de','Erzähl mir, wie dein Tag war.','Erzählen'],
    ['en','Tell me how your day was.','Tell me'],
    ['fr','Raconte-moi ta journée.','Raconter'],
    ['ar','احكي لي كيف كان يومك.','ابدأ بالكلام'],
  ] as const)('localizes the blocking voice prompt for %s',(language,prompt,start)=>{
    const copy=voiceFirstEntryCopy(language);
    expect(copy.prompt).toBe(prompt);
    expect(copy.start).toBe(start);
    expect(copy.helper.length).toBeGreaterThan(20);
    expect(copy.hint.length).toBeGreaterThan(10);
  });
});
