import { describe, expect, it } from 'vitest';
import { calculateCoachingMetrics, getCoachChatResponse, INITIAL_COACHING_GOALS } from './coachEngine';
import { buildContextualCoachQuery, ensureArabicCoachReply } from '../apiClient';

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

  it('builds Arabic conversation context and rejects a non-Arabic backend reply', () => {
    const context = buildContextualCoachQuery('ملخص اليوم', [
      { id: 'u', sender: 'user', text: 'ملخص اليوم', timestamp: '12:00' },
      { id: 'c', sender: 'coach', text: 'أنا معك بلطف', timestamp: '12:00' },
    ]);
    expect(context).toContain('سياق المحادثة السابقة');
    expect(context).toContain('السؤال الحالي');
    expect(context).not.toMatch(/Bisheriges|Aktuelle Frage|Nutzer/);

    const guarded = ensureArabicCoachReply('Als deine Begleiterin bin ich da.', 'ملخص اليوم', []);
    expect(guarded).toMatch(/[\u0600-\u06ff]/);
    expect(guarded).not.toMatch(/[A-Za-z]/);
  });
});
