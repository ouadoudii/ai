import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getLocalDateKey } from './dateKey';
import { useLocalNow } from './useLocalNow';

const Probe = () => {
  const now = useLocalNow();
  return <output data-testid="clock">{getLocalDateKey(now)}|{now.getHours()}</output>;
};

describe('useLocalNow', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('reacts when a mounted app crosses local midnight', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 27, 23, 59, 59, 900));
    render(<Probe />);
    expect(screen.getByTestId('clock').textContent).toBe('2026-09-27|23');

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByTestId('clock').textContent).toBe('2026-09-28|0');
  });

  it('refreshes immediately when the app regains focus', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 27, 15, 0, 0));
    render(<Probe />);
    expect(screen.getByTestId('clock').textContent).toBe('2026-09-27|15');

    vi.setSystemTime(new Date(2026, 8, 28, 7, 0, 0));
    act(() => window.dispatchEvent(new Event('focus')));

    expect(screen.getByTestId('clock').textContent).toBe('2026-09-28|7');
  });
});
