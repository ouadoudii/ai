import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SmartInterventionGuardian } from './SmartInterventionGuardian';
import type { GuardianStatus } from '../utils/interventionEngine';

const calmStatus: GuardianStatus = {
  hasAlarms: false,
  activeAlarms: [],
  statusText: '',
  statusBadge: 'green',
  lastEvaluated: '',
};

const renderGuardian = (isSimulated: boolean) => renderToStaticMarkup(
  createElement(SmartInterventionGuardian, {
    guardianStatus: calmStatus,
    userArchetype: 'intuitive_mindful',
    isSimulated,
    onSimulateAlarm: () => {},
  }),
);

describe('Guardian demo escape accessibility', () => {
  it('provides a visible Arabic, RTL, keyboard-operable exit in the collapsed demo notice', () => {
    const html = renderGuardian(true);
    expect(html).toContain('dir="rtl"');
    expect(html).toContain('role="note"');
    expect(html).toContain('data-testid="guardian-demo-exit"');
    expect(html).toContain('type="button"');
    expect(html).toContain('العودة إلى يومك');
    expect(html).toContain('هذه أمثلة وليست تسجيلاتك');
    expect(html).not.toMatch(/animate-pulse|animate-ping|bg-red|Ghrelin|28%/);
  });

  it('exposes a named, keyboard-discernible demo toggle with a 44px touch target', () => {
    const html = renderGuardian(false);
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-controls="guardian-demo-scenarios"');
    expect(html).toMatch(/min-h-11[^"]*focus-visible:outline-2/);
    expect(html).toContain('تجربة لطيفة');
    expect(html).not.toMatch(/bg-red|animate-pulse|عقاب|فشل/);
  });

  it('does not show the demo exit or synthetic disclaimer during normal personal guidance', () => {
    const html = renderGuardian(false);
    expect(html).not.toContain('guardian-demo-exit');
    expect(html).not.toContain('guardian-demo-notice');
  });
});
