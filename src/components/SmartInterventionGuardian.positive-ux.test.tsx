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

const render = (activeAlarms: NutritionAlarm[]) => {
  const status: GuardianStatus = {
    hasAlarms: activeAlarms.length > 0,
    activeAlarms,
    statusText: '',
    statusBadge: activeAlarms.length ? 'amber' : 'green',
    lastEvaluated: '',
  };
  return renderToStaticMarkup(
    <SmartInterventionGuardian guardianStatus={status} userArchetype="stress_craver" />,
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

  it('does not imply a medical all-clear when no suggestions are present', () => {
    const html = render([]);
    expect(html).toContain('هنا متى احتجت');
    expect(html).toContain('لكل يوم إيقاعه الخاص');
    expect(html).not.toMatch(/لا حاجة إلى تدخل|نمطك|فشل|ممتاز صحياً/);
  });
});
