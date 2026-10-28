import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { FoodCoachView } from './FoodCoachView';

vi.mock('../i18n', () => ({ useLanguage: () => ({ language: 'ar' }) }));
vi.mock('../utils/coachSession', () => ({
  restoreCoachSessionOrDefault: (messages: unknown[]) => messages,
  writeCoachSession: () => undefined,
}));

const render = (withNavigation: boolean) => renderToStaticMarkup(
  <FoodCoachView
    moments={[]}
    checkIns={[]}
    onOpenAddModal={vi.fn()}
    onSelectMoment={vi.fn()}
    onNavigateToTypeAnalysis={withNavigation ? vi.fn() : undefined}
  />,
);

describe('Arabic coach discoveries invitation', () => {
  it('uses a real keyboard-operable button and avoids inferred nutrition labels', () => {
    const html = render(true);
    expect(html).toMatch(/<button[^>]*data-testid="coach-discoveries-link"[^>]*>/);
    expect(html).toContain('min-h-12');
    expect(html).toContain('focus-visible:outline-2');
    expect(html).toContain('اكتشف ما يتكرر في يومك');
    expect(html).toContain('ملاحظات من يومك، لا أحكام على طعامك');
    expect(html).not.toContain('نمط تغذيتك');
    expect(html).not.toContain('نمط الأكل الحدسي');
    expect(html).not.toContain('ما نمط تغذيتي؟');
  });

  it('does not offer an inert discovery control without a navigation callback', () => {
    expect(render(false)).not.toContain('data-testid="coach-discoveries-link"');
  });
});
