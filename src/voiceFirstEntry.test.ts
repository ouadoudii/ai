import { describe, expect, it } from 'vitest';
import { getModalFocusTargetIndex, getOnboardingWeightSelection, reconcileOnboardingWeightInput, PROFILE_INTRO_KEY, parseOnboardingWeight, sanitizeOnboardingWeightInput, shouldShowVoiceFirstEntry, updateOnboardingForm, voiceFirstEntryCopy } from './components/VoiceFirstEntryOverlay';

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
    expect(copy.weightError.length).toBeGreaterThan(10);
  });

  it.each([['72,5',72.5],['72.5',72.5],['72',72],[' 80,25 ',80.25],['٧٢٫٥',72.5],['۷۲٫۵',72.5],['٧٢,٥',72.5],['۸۲',82],['٨٢.٢٥',82.25],['٨٢٫٢٥',82.25]] as const)('normalizes valid weight %s',(value,expected)=>{
    expect(parseOnboardingWeight(value)).toBe(expected);
  });

  it.each(['72,5.3','72,,5','.',',','19.9','401','72.555','١٩٫٩','٤٠١','٧٢٫٥٥٥','٧٢٬٥','٨٢ كغ'])('rejects ambiguous or implausible weight %s',value=>{
    expect(parseOnboardingWeight(value)).toBeNull();
  });

  it('keeps optional empty weight valid',()=>{
    expect(parseOnboardingWeight('')).toBeUndefined();
  });

  it('keeps ASCII, Arabic-Indic, and Persian digits in logical input order',()=>{
    expect(sanitizeOnboardingWeightInput('82')).toBe('82');
    expect(sanitizeOnboardingWeightInput('٨٢٫٥')).toBe('٨٢٫٥');
    expect(sanitizeOnboardingWeightInput('۸۲٫۵')).toBe('۸۲٫۵');
  });

  it('restores the controlled-input caret after sanitization',()=>{
    expect(getOnboardingWeightSelection('82',2)).toBe(2);
    expect(getOnboardingWeightSelection('8a2',3)).toBe(2);
    expect(getOnboardingWeightSelection('٨٢٫٥',4)).toBe(4);
  });

  it('reconstructs the intended RTL numeric order from a pre-mutation keystroke',()=>{
    // Chromium can expose a reversed DOM value even when the previous caret
    // was at the end. The captured key must win over the raw reversed value.
    expect(reconcileOnboardingWeightInput('8','28','insertText','2',1,1)).toEqual({value:'82',selection:2});
    // Explicit Home/start edits must remain possible, not append-only.
    expect(reconcileOnboardingWeightInput('82','782','insertText','7',0,0)).toEqual({value:'782',selection:1});
    // Pasting and deletion continue to use the browser's actual value.
    expect(reconcileOnboardingWeightInput('8','82','insertFromPaste',null,1,1)).toEqual({value:'82',selection:1});
  });

  it('preserves sibling answers across rapid form field updates',()=>{
    const initial={goal:'',weight:'',hunger:3,energy:3,rhythm:'mixed' as const};
    const withGoal=updateOnboardingForm(initial,'goal','أفهم طاقتي');
    const withWeight=updateOnboardingForm(withGoal,'weight','72,5');
    expect(withWeight).toEqual({...initial,goal:'أفهم طاقتي',weight:'72,5'});
  });

  it('wraps focus at both modal boundaries and recovers focus that escaped',()=>{
    expect(getModalFocusTargetIndex(0,6,true)).toBe(5);
    expect(getModalFocusTargetIndex(5,6,false)).toBe(0);
    expect(getModalFocusTargetIndex(2,6,false)).toBeNull();
    expect(getModalFocusTargetIndex(-1,6,false)).toBe(0);
    expect(getModalFocusTargetIndex(-1,6,true)).toBe(5);
    expect(getModalFocusTargetIndex(-1,0,false)).toBeNull();
  });
});
