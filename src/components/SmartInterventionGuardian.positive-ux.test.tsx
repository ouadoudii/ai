import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { NutritionAlarm, GuardianStatus } from '../utils/interventionEngine';
import { SmartInterventionGuardian } from './SmartInterventionGuardian';

vi.mock('../i18n', () => ({ useLanguage: () => ({ language: 'ar' }) }));

const alarm: NutritionAlarm = {
  id: 'sleep-checkin-1',
  triggerKey: 'sleep_deficit',
  severity: 'high',
  title: 'قد تحتاج إلى بعض الراحة اليوم',
  subtitle: 'ليلة قصيرة',
  archetype: 'stress_craver',
  reason: 'قد تحتاج إلى راحة',
  recommendation: 'خذ وقتك',
  actionableStep: 'استرح إن أحببت',
  timestamp: 'هذا الصباح',
};

const render = (activeAlarms: NutritionAlarm[], isSimulated = false) => {
  const status: GuardianStatus = {
    hasAlarms: activeAlarms.length > 0,
    activeAlarms,
    statusText: '',
    statusBadge: activeAlarms.length ? 'amber' : 'green',
    lastEvaluated: '',
  };
  return renderToStaticMarkup(
    <SmartInterventionGuardian guardianStatus={status} userArchetype="stress_craver" isSimulated={isSimulated} />,
  );
};

describe('optional, non-diagnostic Arabic Guardian suggestions', () => {
  it('never labels a person by an inferred eating archetype or raises visual urgency', () => {
    const html = render([alarm]);
    expect(html).toContain('dir="rtl"');
    expect(html).toContain('أفكار يمكنك تجاهلها');
    expect(html).toContain('aria-label="إخفاء الفكرة: قد تحتاج إلى بعض الراحة اليوم"');
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('ما قد يساعدك');
    expect(html).not.toMatch(/نمطك|نمط الأكل تحت الضغط|اقتراح عاجل|تدخل فوري|إنذار|عقاب|فشل/);
    expect(html).not.toMatch(/bg-rose|bg-red|animate-pulse|animate-ping/);
  });

  it('makes the real suggestion dismiss action accessible by keyboard and touch', () => {
    const html = render([alarm]);
    const button = html.match(/<button[^>]*aria-label="إخفاء الفكرة: قد تحتاج إلى بعض الراحة اليوم"[^>]*>/)?.[0];
    expect(button).toBeDefined();
    expect(button).toContain('type="button"');
    expect(button).toContain('min-h-11');
    expect(button).toContain('focus-visible:outline-2');
    expect(button).toContain('focus-visible:outline-offset-2');
    // The disappearing dismiss button hands keyboard focus to a calm status.
    expect(html).toMatch(/tabindex="-1"[^>]*role="status"/i);
    expect(html).toContain('aria-live="polite"');
    expect(button).toContain('focus-visible:outline-[#526B48]');
    expect(html).not.toMatch(/bg-red|bg-rose|animate-pulse|عقاب|فشل/);
  });

  it('clearly marks simulated suggestions as examples, not personal observations', () => {
    const normal = render([alarm]);
    const demo = render([alarm], true);
    expect(normal).not.toContain('وضع تجريبي');
    expect(demo).toContain('role="note"');
    expect(demo).toContain('data-testid="guardian-demo-notice"');
    expect(demo).toContain('هذه أمثلة وليست تسجيلاتك');
    expect(demo).toContain('data-testid="guardian-demo-exit"');
    expect(demo).toContain('العودة إلى يومك');
    expect(demo).not.toMatch(/Simuliert|Warnung|Alarm|Ghrelin|28%|animate-pulse|bg-red/);
  });

  it('renders supportive Arabic guidance when a privacy mode denies the localStorage getter', () => {
    vi.stubGlobal('window', {
      get localStorage() { throw new Error('SecurityError: storage access denied'); },
    });
    try {
      const html = render([alarm]);
      expect(html).toContain('dir="rtl"');
      expect(html).toContain('قد تحتاج إلى بعض الراحة اليوم');
      expect(html).toContain('إخفاء الفكرة');
      expect(html).not.toMatch(/bg-red|animate-pulse|عقاب|فشل/);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('does not imply a medical all-clear when no suggestions are present', () => {
    const html = render([]);
    expect(html).toContain('هنا متى احتجت');
    expect(html).toContain('لكل يوم إيقاعه الخاص');
    expect(html).not.toMatch(/لا حاجة إلى تدخل|نمطك|فشل|ممتاز صحياً/);
  });
});
