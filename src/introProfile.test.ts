import { afterEach, describe, expect, it, vi } from 'vitest';
import { createIntroProfileDraft, INTRO_PROFILE_STORAGE_KEY, loadIntroProfile, safeIntroProfileDraft } from './utils/introProfile';

afterEach(()=>{vi.restoreAllMocks();localStorage.removeItem(INTRO_PROFILE_STORAGE_KEY)});

describe('intro profile drafting',()=>{
  it('keeps only bounded user-editable profile and plan fields',()=>{
    const draft=safeIntroProfileDraft({
      summary:'  A short summary  ',
      priorities:[' one ','two',3],
      preferences:['simple'],
      firstPlan:{title:'  Notice lunch  ',rationale:'  Because afternoons matter  ',focusAreas:[' lunch ','energy','pace','extra'],firstStep:'  Capture lunch and afternoon energy.  ',phase:'midday'}
    },'raw intro','en');
    expect(draft).toEqual({
      summary:'A short summary',
      priorities:['one','two'],
      preferences:['simple'],
      rawIntro:'raw intro',
      firstPlan:{title:'Notice lunch',rationale:'Because afternoons matter',focusAreas:['lunch','energy','pace'],firstStep:'Capture lunch and afternoon energy.',phase:'midday'}
    });
  });

  it('parses fenced JSON with a semantic first plan returned by the coach endpoint',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({reply:'```json\n{"summary":"Mehr Struktur im Alltag","priorities":["regelmäßig essen"],"preferences":["einfach"],"firstPlan":{"title":"Mittag und Energie beobachten","rationale":"Du möchtest regelmäßiger essen und deine Energie besser verstehen.","focusAreas":["Mittagessen","Nachmittagsenergie"],"firstStep":"Halte beim nächsten Mittag-Check-in fest, was du gegessen hast und wie deine Energie danach ist.","phase":"midday"}}\n```'})}));
    const draft=await createIntroProfileDraft('Ich möchte regelmäßiger essen und meine Energie am Nachmittag verstehen.','de');
    expect(draft.summary).toBe('Mehr Struktur im Alltag');
    expect(draft.priorities).toEqual(['regelmäßig essen']);
    expect(draft.preferences).toEqual(['einfach']);
    expect(draft.firstPlan.title).toBe('Mittag und Energie beobachten');
    expect(draft.firstPlan.focusAreas).toEqual(['Mittagessen','Nachmittagsenergie']);
    expect(draft.firstPlan.phase).toBe('midday');
    expect(draft.rawIntro).toContain('regelmäßiger essen');
    const sent=JSON.parse(String((vi.mocked(fetch) as any).mock.calls[0][1]?.body||'{}'));
    expect(sent.query).toContain('Choose the plan semantically from the whole message');
  });

  it('falls back safely when AI is unavailable without blocking onboarding',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new Error('offline')));
    const draft=await createIntroProfileDraft('Ich möchte meinen Alltag besser verstehen.','de');
    expect(draft.summary).toBe('Ich möchte meinen Alltag besser verstehen.');
    expect(draft.priorities).toEqual([]);
    expect(draft.preferences).toEqual([]);
    expect(draft.firstPlan.title).toBe('Dein erster Schritt');
    expect(draft.firstPlan.firstStep).toContain('Check-in');
    expect(draft.firstPlan.phase).toBe('midday');
  });

  it('rejects an unsupported phase instead of trusting model output',()=>{
    const draft=safeIntroProfileDraft({firstPlan:{phase:'night'}},'Something I want to understand.','en');
    expect(draft.firstPlan.phase).toBe('midday');
  });

  it('loads only a confirmed persisted profile for the home experience',()=>{
    localStorage.setItem(INTRO_PROFILE_STORAGE_KEY,JSON.stringify({
      summary:'Mehr Regelmäßigkeit',priorities:['regelmäßig essen'],preferences:['einfach'],rawIntro:'Ich möchte regelmäßiger essen.',confirmedAt:123,
      firstPlan:{title:'Mittag beobachten',rationale:'Weil du Regelmäßigkeit möchtest.',focusAreas:['Mittagessen'],firstStep:'Mach einen kurzen Mittag-Check-in.',phase:'midday'}
    }));
    expect(loadIntroProfile()?.firstPlan.title).toBe('Mittag beobachten');
    expect(loadIntroProfile()?.confirmedAt).toBe(123);
    localStorage.setItem(INTRO_PROFILE_STORAGE_KEY,JSON.stringify({rawIntro:'unconfirmed'}));
    expect(loadIntroProfile()).toBeNull();
  });
});
