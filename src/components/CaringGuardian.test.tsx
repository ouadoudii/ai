import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CaringGuardian } from './CaringGuardian';
import type { GuardianStatus } from '../utils/interventionEngine';

const render = (activeAlarms: GuardianStatus['activeAlarms'] = []) =>
  renderToStaticMarkup(
    React.createElement(CaringGuardian, {
      guardianStatus: {
        hasAlarms: activeAlarms.length > 0,
        activeAlarms,
        statusText: '',
        statusBadge: activeAlarms.length ? 'amber' : 'green',
        lastEvaluated: '',
      },
      userArchetype: 'intuitive_mindful',
    }),
  );

describe('Caring Guardian Arabic-only and non-judgmental UI', () => {
  it('keeps an empty journal neutral, Arabic and RTL without claiming good health', () => {
    const html = render();
    expect(html).toContain('dir="rtl"');
    expect(html).toContain('لا حاجة إلى يوم مثالي');
    expect(html).not.toMatch(/Alles im grünen|harmonisch|Protein-Performer|Für dich da/);
    expect(html).not.toMatch(/⚠️|Überessen|Küchenschluss/);
  });

  it('shows an Arabic, screen-reader-labelled dismissal with gentle advice', () => {
    const html = render([{
      id: 'alarm-sleep-1',
      triggerKey: 'sleep_deficit',
      severity: 'high',
      title: 'قد تحتاج إلى بعض الراحة اليوم',
      subtitle: 'سجّلت ساعات نوم أقل',
      archetype: 'intuitive_mindful',
      reason: 'قد تحتاج إلى الراحة',
      recommendation: 'خذ وقتك',
      actionableStep: 'استرح قليلًا',
      timestamp: 'هذا الصباح',
    }]);
    expect(html).toContain('dir="rtl"');
    expect(html).toContain('type="button"');
    expect(html).toContain('aria-label="إخفاء هذا الاقتراح');
    expect(html).toContain('لماذا ظهر هذا الاقتراح؟');
    expect(html).toContain('شكرًا، أخفِ الاقتراح');
    expect(html).not.toMatch(/Danke, erledigt|Warum ich mich melde|Sofort-Tipp|Sanfter Tagesimpuls/);
  });
});
