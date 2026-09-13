import { afterEach, describe, expect, it, vi } from 'vitest';
import { createIntroProfileDraft, safeIntroProfileDraft } from './utils/introProfile';

afterEach(()=>vi.restoreAllMocks());

describe('intro profile drafting',()=>{
  it('keeps only bounded user-editable profile fields',()=>{
    const draft=safeIntroProfileDraft({summary:'  A short summary  ',priorities:[' one ','two',3],preferences:['simple']},'raw intro');
    expect(draft).toEqual({summary:'A short summary',priorities:['one','two'],preferences:['simple'],rawIntro:'raw intro'});
  });

  it('parses fenced JSON returned by the existing coach endpoint',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({reply:'```json\n{"summary":"Mehr Struktur im Alltag","priorities":["regelmäßig essen"],"preferences":["einfach"]}\n```'})}));
    const draft=await createIntroProfileDraft('Ich möchte regelmäßiger essen.','de');
    expect(draft.summary).toBe('Mehr Struktur im Alltag');
    expect(draft.priorities).toEqual(['regelmäßig essen']);
    expect(draft.preferences).toEqual(['einfach']);
    expect(draft.rawIntro).toBe('Ich möchte regelmäßiger essen.');
  });

  it('falls back to the users own words when AI is unavailable',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new Error('offline')));
    const draft=await createIntroProfileDraft('Ich möchte meinen Alltag besser verstehen.','de');
    expect(draft.summary).toBe('Ich möchte meinen Alltag besser verstehen.');
    expect(draft.priorities).toEqual([]);
    expect(draft.preferences).toEqual([]);
  });
});
