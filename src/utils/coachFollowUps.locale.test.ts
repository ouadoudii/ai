import { describe, expect, it } from 'vitest';
import { buildCoachFollowUps } from './coachFollowUps';
describe('Cary coach follow-up language', () => {
 it('generates distinct follow-ups in all four supported locales',()=>{
  const outputs = (['de','en','fr','ar'] as const).map(lang=>buildCoachFollowUps('Sleep', 'Try consistency', lang));
  outputs.forEach(items=>expect(items).toHaveLength(3));
  expect(new Set(outputs.map(items=>items[1])).size).toBe(4);
  expect(outputs[3][1]).toMatch(/[\u0600-\u06ff]/);
 });
});
