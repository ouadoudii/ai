import React from 'react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { LanguageProvider } from './i18n';
import { TodayHomeView } from './components/TodayHomeView';
import { DailyCheckIn } from './types';
import { getPreviousLocalDateKey } from './utils/lateNightEveningCatchUp';

let oldStorage: unknown;
beforeAll(() => {
  oldStorage = globalThis.localStorage;
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: () => null, setItem: () => undefined },
  });
});
afterAll(() => {
  vi.useRealTimers();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: oldStorage });
});

const noop = () => undefined;
const renderToday = (checkIns: DailyCheckIn[]) => renderToString(
  <LanguageProvider>
    <TodayHomeView
      moments={[]}
      checkIns={checkIns}
      onOpenAddModal={noop}
      onOpenSnack={noop}
      onOpenCheckInModal={noop}
      onSelectMoment={noop}
      onNavigateToCoach={noop}
      onNavigateToTypeAnalysis={noop}
      onNavigateToTimeline={noop}
    />
  </LanguageProvider>,
);

const checkIn = (date: string, timeOfDay: DailyCheckIn['timeOfDay']): DailyCheckIn => ({
  id: `user-${timeOfDay}`,
  date,
  time: '12:00',
  timeOfDay,
  wellbeing: {},
  createdAt: 1,
});

describe('Today late-night catch-up card', () => {
  it('renders an explicit previous-date evening action at 02:00 when yesterday is incomplete', () => {
    vi.useFakeTimers();
    const now = new Date(2026, 9, 16, 2, 0);
    vi.setSystemTime(now);
    const previousDate = getPreviousLocalDateKey(now);

    const html = renderToday([checkIn(previousDate, 'morning'), checkIn(previousDate, 'midday')]);

    expect(html).toContain('data-testid="late-night-evening-catch-up"');
    expect(html).toContain(`data-target-date="${previousDate}"`);
    expect(html).toContain('كمّل عشاء البارح');
  });

  it('does not render the action when yesterday evening is already complete', () => {
    vi.useFakeTimers();
    const now = new Date(2026, 9, 16, 2, 0);
    vi.setSystemTime(now);
    const previousDate = getPreviousLocalDateKey(now);

    expect(renderToday([checkIn(previousDate, 'evening')])).not.toContain('late-night-evening-catch-up');
  });
});
