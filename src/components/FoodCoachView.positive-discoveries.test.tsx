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
  it('keeps the Arabic voice badge and check-in action readable against their backgrounds', () => {
    const html = render(true);
    const badge = html.match(/<span[^>]*data-testid="coach-voice-badge"[^>]*>/)?.[0];
    const action = html.match(/<button[^>]*data-testid="coach-checkin-cta"[^>]*>/)?.[0];

    expect(badge).toBeDefined();
    expect(action).toBeDefined();
    expect(action).toContain('min-h-12');

    const contrastAgainstWhite = (element: string) => {
      expect(element).toContain('text-white');
      const hex = element.match(/bg-\[#([0-9a-f]{6})\]/i)?.[1];
      expect(hex).toBeDefined();
      const channels = hex!.match(/.{2}/g)!.map((part) => {
        const value = parseInt(part, 16) / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
      const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
      return 1.05 / (luminance + 0.05);
    };

    expect(contrastAgainstWhite(badge!)).toBeGreaterThanOrEqual(4.5);
    expect(contrastAgainstWhite(action!)).toBeGreaterThanOrEqual(4.5);
    expect(html).not.toContain('bg-[#25D366]');
  });

});
