import { describe, expect, it } from 'vitest';
import { calculateCoachingMetrics, getCoachChatResponse, INITIAL_COACHING_GOALS } from './coachEngine';

describe('Arabic-only supportive coach regression #447', () => {
  it('uses natural Arabic without inventing observations for an empty day', () => {
    const metrics = calculateCoachingMetrics([], '2026-11-05');
    expect(metrics.todayMomentsCount).toBe(0);
    expect(metrics.mindfulScore).toBe(0);
    for (const value of [metrics.dailyFocusTitle, metrics.dailyFocusTip, metrics.coachSummary]) {
      expect(value).toMatch(/[\u0600-\u06ff]/);
      expect(value).not.toMatch(/[A-Za-z]/);
    }
  });
  it('keeps every default goal in Arabic without shame language', () => {
    for (const goal of INITIAL_COACHING_GOALS) {
      for (const value of [goal.title, goal.description, goal.unit]) {
        expect(value).toMatch(/[\u0600-\u06ff]/);
        expect(value).not.toMatch(/[A-Za-z]/);
      }
    }
  });
  it('reports only meals from the local day and never fabricates a score', () => {
    const response = getCoachChatResponse('ملخص اليوم', []);
    expect(response).toMatch(/لا توجد وجبات/);
    expect(response).not.toMatch(/88%|Ghrelin|Blutzucker/);
  });
  it('supports Arabic and legacy input without German output or clinical claims', () => {
    for (const question of ['النوم', 'بروتين', 'جوع', 'heute', 'alarm', 'unknown']) {
      const response = getCoachChatResponse(question, []);
      expect(response).toMatch(/[\u0600-\u06ff]/);
      expect(response).not.toMatch(/[A-Za-z]|88%|28%/);
    }
  });
});
