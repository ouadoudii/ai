import { describe, expect, it } from 'vitest';
import type { FoodMoment } from './types';
import { deriveRecurringMealMemory, mealIdentityKey } from './recurringMealMemory';

const moment = (id: string, title: string, createdAt: number, tags: string[] = []): FoodMoment => ({
  id,
  title,
  label: title,
  category: 'breakfast',
  date: '2026-10-03',
  time: '08:00',
  location: '',
  locationCategory: 'home',
  imageUrl: '',
  mood: 'satisfied',
  tags,
  createdAt,
});

describe('recurring meal memory', () => {
  it('matches harmless Arabic spacing and punctuation while preserving newest wording', () => {
    const memories = deriveRecurringMealMemory([
      moment('1', 'بيض مسلوق', 1),
      moment('2', '  بيض،   مسلوق! ', 2),
    ]);

    expect(memories).toHaveLength(1);
    expect(memories[0]).toMatchObject({ displayTitle: '  بيض،   مسلوق! ', occurrenceCount: 2 });
  });

  it('matches mixed-script case and spacing without rewriting display text', () => {
    const memories = deriveRecurringMealMemory([
      moment('1', 'Omelette avec خبز', 1),
      moment('2', 'OMELETTE   avec خبز', 3),
    ]);

    expect(memories[0].displayTitle).toBe('OMELETTE   avec خبز');
    expect(memories[0].occurrenceCount).toBe(2);
  });

  it('does not merge semantically different meals or expose one-off meals', () => {
    expect(mealIdentityKey('بيض مسلوق')).not.toBe(mealIdentityKey('بيض مقلي'));
    expect(deriveRecurringMealMemory([
      moment('1', 'بيض مسلوق', 1),
      moment('2', 'بيض مقلي', 2),
    ])).toEqual([]);
  });

  it('excludes demo, seed and sample moments from personal memory', () => {
    expect(deriveRecurringMealMemory([
      moment('1', 'Tajine', 1),
      moment('2', 'tajine', 2, ['demo']),
      moment('3', 'tajine', 3, ['seed']),
    ])).toEqual([]);
  });
});
