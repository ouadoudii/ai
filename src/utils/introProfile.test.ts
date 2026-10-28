import { describe, expect, it } from 'vitest';
import { localizeIntroPlanFallback, localizeIntroPlanForDisplay, PersonalFirstPlan } from './introProfile';

const fallbackPlan:PersonalFirstPlan={
  title:'Your first step',
  rationale:'Je veux mieux comprendre mon énergie.',
  focusAreas:[],
  firstStep:'At your next check-in, notice what stands out in your everyday rhythm.',
  phase:'midday',
};

describe('intro profile plan localization',()=>{
  it('renders app-owned fallback copy in the active French language',()=>{
    expect(localizeIntroPlanFallback(fallbackPlan,'fr')).toEqual({
      ...fallbackPlan,
      title:'Ton premier pas',
      firstStep:'Au prochain check-in, observe simplement ce qui ressort de ton quotidien.',
    });
  });

  it('preserves personalized plan content instead of translating or replacing it',()=>{
    const personalPlan={...fallbackPlan,title:'Observer mon déjeuner',firstStep:'Note ton énergie après le déjeuner.'};
    expect(localizeIntroPlanFallback(personalPlan,'fr')).toEqual(personalPlan);
  });

  it('shows a calm Arabic plan for legacy French/German fields without translating or altering saved data',()=>{
    const legacy:PersonalFirstPlan={
      title:'Mittag und Energie beobachten',
      rationale:'Je veux mieux comprendre mon énergie.',
      focusAreas:['Mittagessen','الغداء','طاقة energy'],
      firstStep:'Halte beim nächsten Mittag-Check-in fest, wie es dir geht.',
      phase:'evening',
    };
    const original=structuredClone(legacy);
    const visible=localizeIntroPlanForDisplay(legacy,'ar');
    expect(visible.title).toBe('خطوتك الأولى');
    expect(visible.rationale).toBe('');
    expect(visible.focusAreas).toEqual(['الغداء']);
    expect(visible.firstStep).toBe('في تسجيلك القادم، لاحظ ببساطة ما يبرز في إيقاع يومك.');
    expect(visible.phase).toBe('evening');
    expect(legacy).toEqual(original);
  });

  it('preserves naturally written Arabic plans and avoids leaking mixed Latin copy',()=>{
    const arabic:PersonalFirstPlan={
      title:'لاحظ إيقاع الغداء',
      rationale:'سجّلت أنك تحب الهدوء وقت الأكل.',
      focusAreas:['الغداء','الراحة'],
      firstStep:'لاحظ كيف تشعر بعد الغداء على راحتك.',
      phase:'midday',
    };
    expect(localizeIntroPlanForDisplay(arabic,'ar')).toEqual(arabic);
    expect(localizeIntroPlanForDisplay({...arabic,firstStep:'لاحظ lunch بعد الغداء'},'ar').firstStep)
      .toBe('في تسجيلك القادم، لاحظ ببساطة ما يبرز في إيقاع يومك.');
  });
});
