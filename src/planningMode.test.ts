import { describe, expect, it } from 'vitest';
import { createPersonalPlan } from './planningMode';

describe('createPersonalPlan', () => {
  it('uses known sleep, meal and energy patterns in a short practical plan', () => {
    const plan = createPersonalPlan({
      event: 'important presentation',
      eventTime: '15:00',
      patterns: [
        { kind: 'sleep', observation: 'I feel steadier after my normal sleep window' },
        { kind: 'meal', observation: 'Late lunch often overlaps with evening snacking' },
        { kind: 'energy', observation: 'My energy is usually better late morning' },
      ],
    });

    expect(plan.steps).toHaveLength(3);
    expect(plan.steps.map((step) => step.basedOn)).toEqual(['sleep', 'meal', 'energy']);
    expect(plan.basis).toHaveLength(3);
    expect(plan.title).toContain('15:00');
  });

  it('stays useful with no learned patterns and clearly marks the plan provisional', () => {
    const plan = createPersonalPlan({ event: 'early train', patterns: [] });

    expect(plan.steps).toHaveLength(1);
    expect(plan.basis).toEqual([]);
    expect(plan.note.toLowerCase()).toContain('provisional');
  });

  it('never presents the plan as medical advice or a guaranteed outcome', () => {
    const plan = createPersonalPlan({
      event: 'exam',
      patterns: [{ kind: 'energy', observation: 'Morning focus has looked stronger recently' }],
    });

    expect(plan.note.toLowerCase()).toContain('not a medical');
    expect(plan.note.toLowerCase()).toContain('not a medical recommendation');
    expect(plan.note.toLowerCase()).toContain('not a medical recommendation or a guarantee');
  });

  it('incorporates user changes without letting the plan grow unbounded', () => {
    const plan = createPersonalPlan({
      event: 'long journey',
      patterns: [
        { kind: 'sleep', observation: 'sleep pattern' },
        { kind: 'meal', observation: 'meal pattern' },
        { kind: 'energy', observation: 'energy pattern' },
      ],
      userChanges: ['Leave home 30 minutes earlier', 'Pack my usual snack', 'This extra change should wait'],
    });

    expect(plan.steps.length).toBeLessThanOrEqual(4);
    expect(plan.steps.some((step) => step.text.includes('Leave home 30 minutes earlier'))).toBe(true);
  });
});
