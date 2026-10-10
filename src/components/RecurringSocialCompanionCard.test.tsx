import { describe, expect, it } from 'vitest';
import type { FoodMoment } from '../types';
import { deriveRecurringSocialCompanion } from '../recurringSocialCompanion';
import { getRecurringSocialCompanionCopy } from './RecurringSocialCompanionCard';

const meal = (id:string, companions:string, createdAt:number): FoodMoment => ({ id, title:'بيض مسلوق', label:'Breakfast', category:'breakfast', date:'2026-10-01', time:'08:00', location:'', locationCategory:'home', imageUrl:'', mood:'satisfied', tags:[], companions, createdAt });
const moments = [meal('a','أُمّي',1), meal('b','أمي',2), meal('c','أُمّي',3)];

describe('RecurringSocialCompanionCard contract', () => {
  it('surfaces the observed companion without inferring a relationship', () => {
    const insight = deriveRecurringSocialCompanion(moments, 'breakfast');
    expect(insight).not.toBeNull();
    expect(insight?.companion).toBe('أُمّي');
    expect(insight?.count).toBe(3);
    expect(getRecurringSocialCompanionCopy('en').body(insight!.companion, insight!.count)).toContain('أُمّي 3 times');
  });

  it.each([
    ['de','Ein vertrauter gemeinsamer Moment'],
    ['fr','Un moment partagé familier'],
    ['ar','لحظة مشتركة مألوفة'],
  ] as const)('localizes the insight in %s', (language, title) => {
    expect(getRecurringSocialCompanionCopy(language).title).toBe(title);
  });

  it('stays hidden below the evidence threshold', () => {
    expect(deriveRecurringSocialCompanion(moments.slice(0,2), 'breakfast')).toBeNull();
  });
});
