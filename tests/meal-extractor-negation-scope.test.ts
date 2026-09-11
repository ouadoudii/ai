import { describe, expect, it } from 'vitest';
import { extractMealItemsDeterministic } from '../api/meal-extractor';

describe('multilingual negation clause scope', () => {
  it.each([
    ['I did not eat eggs but bread', ['خبز'], ['بيض']],
    ["je n'ai pas mangé des oeufs mais pain", ['خبز'], ['بيض']],
    ['ما كليتش بيض ولكن خبز', ['خبز'], ['بيض']],
    ['ما كليتش بيض بس شربت شاي', ['شاي'], ['بيض']],
  ])('stops negation at a contrast boundary: %s', (speech, included, excluded) => {
    const result = extractMealItemsDeterministic(speech);
    expect(result.mealDetected).toBe(true);
    for (const item of included) expect(result.mealItems).toContain(item);
    for (const item of excluded) expect(result.mealItems).not.toContain(item);
  });

  it('keeps coordinated foods inside the same negated clause excluded', () => {
    const result = extractMealItemsDeterministic('I did not eat eggs or bread but tea');
    expect(result.mealItems).toContain('شاي');
    expect(result.mealItems).not.toContain('بيض');
    expect(result.mealItems).not.toContain('خبز');
  });

  it('preserves existing positive-verb recovery after a negated clause', () => {
    const result = extractMealItemsDeterministic('ما كليتش خبز وشربت قهوة');
    expect(result.mealItems).toContain('قهوة');
    expect(result.mealItems).not.toContain('خبز');
  });
});