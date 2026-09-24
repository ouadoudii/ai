import { describe, expect, it } from 'vitest';
import { resolveCheckInPhase } from '../src/components/DailyCheckInModal';

describe('daily check-in session phase', () => {
  it('resolves implicit phase from the session-open time', () => {
    expect(resolveCheckInPhase(null, new Date(2026, 8, 24, 10, 59))).toBe('morning');
    expect(resolveCheckInPhase(null, new Date(2026, 8, 24, 11, 0))).toBe('midday');
    expect(resolveCheckInPhase(null, new Date(2026, 8, 24, 17, 59))).toBe('midday');
    expect(resolveCheckInPhase(null, new Date(2026, 8, 24, 18, 0))).toBe('evening');
  });

  it('preserves an explicitly requested phase regardless of wall clock', () => {
    expect(resolveCheckInPhase('morning', new Date(2026, 8, 24, 20, 0))).toBe('morning');
  });
});
