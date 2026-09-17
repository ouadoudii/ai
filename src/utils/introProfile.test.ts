import { describe, expect, it } from 'vitest';
import { localizeIntroPlanFallback, PersonalFirstPlan } from './introProfile';

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
});
