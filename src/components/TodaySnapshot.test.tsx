import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { TodaySnapshot } from './TodaySnapshot';

describe('TodaySnapshot', () => {
  it('turns missing wellbeing metrics into accessible check-in actions', () => {
    const html = renderToString(
      <TodaySnapshot moments={[]} checkIns={[]} onOpenCheckIn={() => undefined} />,
    );

    expect(html).toContain('Energie für heute eintragen');
    expect(html).toContain('Schlaf für heute eintragen');
    expect(html.match(/Eintragen/g)?.length).toBeGreaterThanOrEqual(2);
    expect(html).toContain('min-h-11');
  });
});
