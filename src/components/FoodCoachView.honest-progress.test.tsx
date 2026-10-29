import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { FoodCoachView } from './FoodCoachView';

vi.mock('../i18n', () => ({ useLanguage: () => ({ language: 'ar' }) }));
vi.mock('../utils/coachSession', () => ({
  restoreCoachSessionOrDefault: (messages: unknown[]) => messages,
  writeCoachSession: () => undefined,
}));

describe('Arabic Coach empty journal', () => {
  it('shows a supportive, accessible empty state without invented achievements', () => {
    const html = renderToStaticMarkup(
      <FoodCoachView moments={[]} checkIns={[]} onOpenAddModal={vi.fn()} onSelectMoment={vi.fn()} />
    );
    expect(html).toContain('data-testid="coach-screen-free-metric"');
    expect(html).toContain('لا توجد ملاحظات عن الشاشات بعد');
    expect(html).toContain('data-testid="coach-goals-summary"');
    expect(html).toContain('0 / 4 مكتملة');
    expect(html).toContain('لا توجد وجبات مسجلة اليوم بعد');
    expect(html).toContain('دون أي ضغط');
    expect(html).not.toContain('وجبات دون شاشات: 100%');
    expect(html).not.toContain('3/3 وجبات');
    expect(html).not.toContain('2/2 وجبات');
    expect(html).not.toContain('onClick');
    expect(html).not.toContain('تغيير حالة الهدف');
    expect(html).toContain('aria-live="polite"');
  });
});
