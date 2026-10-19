import { describe, expect, it } from 'vitest';
import { getLocalDateKey } from './dateKey';

describe('getLocalDateKey non-hour timezone regressions', () => {
  it('uses Casablanca GMT during the 2026 Ramadan DST suspension', () => {
    const instant = new Date('2026-03-01T23:30:00.000Z');
    expect(getLocalDateKey(instant, 'Africa/Casablanca')).toBe('2026-03-01');
    expect(getLocalDateKey(instant, 'Europe/Berlin')).toBe('2026-03-02');
  });

  it('respects Casablanca calendar dates before and after the 2026 DST suspension', () => {
    expect(getLocalDateKey(new Date('2026-02-14T23:30:00.000Z'), 'Africa/Casablanca')).toBe('2026-02-15');
    expect(getLocalDateKey(new Date('2026-02-16T23:30:00.000Z'), 'Africa/Casablanca')).toBe('2026-02-16');
    expect(getLocalDateKey(new Date('2026-03-21T23:30:00.000Z'), 'Africa/Casablanca')).toBe('2026-03-21');
    expect(getLocalDateKey(new Date('2026-03-23T23:30:00.000Z'), 'Africa/Casablanca')).toBe('2026-03-24');
  });

  it('does not roll Casablanca into tomorrow at 23:59:59 UTC during Ramadan', () => {
    expect(getLocalDateKey(new Date('2026-03-01T23:59:59.000Z'), 'Africa/Casablanca')).toBe('2026-03-01');
  });

  it('rolls Casablanca to the next date at exactly 23:00 UTC after DST resumes', () => {
    expect(getLocalDateKey(new Date('2026-04-01T22:59:59.000Z'), 'Africa/Casablanca')).toBe('2026-04-01');
    expect(getLocalDateKey(new Date('2026-04-01T23:00:00.000Z'), 'Africa/Casablanca')).toBe('2026-04-02');
  });

  it('handles the exact quarter-hour rollover in Kathmandu', () => {
    expect(getLocalDateKey(new Date('2026-04-01T18:14:59.000Z'), 'Asia/Kathmandu')).toBe('2026-04-01');
    expect(getLocalDateKey(new Date('2026-04-01T18:15:00.000Z'), 'Asia/Kathmandu')).toBe('2026-04-02');
  });

  it('handles the exact 45-minute rollover in Chatham during southern DST', () => {
    expect(getLocalDateKey(new Date('2026-10-04T10:14:59.000Z'), 'Pacific/Chatham')).toBe('2026-10-04');
    expect(getLocalDateKey(new Date('2026-10-04T10:15:00.000Z'), 'Pacific/Chatham')).toBe('2026-10-05');
  });

  it('does not conflate the extreme positive and negative offsets at New Year', () => {
    const instant = new Date('2026-12-31T10:00:00.000Z');
    expect(getLocalDateKey(instant, 'Pacific/Kiritimati')).toBe('2027-01-01');
    expect(getLocalDateKey(instant, 'Pacific/Pago_Pago')).toBe('2026-12-30');
  });

  it('rolls Kolkata into tomorrow at the half-hour offset boundary', () => {
    expect(getLocalDateKey(new Date('2026-06-01T18:29:59.000Z'), 'Asia/Kolkata')).toBe('2026-06-01');
    expect(getLocalDateKey(new Date('2026-06-01T18:30:00.000Z'), 'Asia/Kolkata')).toBe('2026-06-02');
  });

  it('respects the 45-minute Eucla offset instead of rounding to an hour', () => {
    expect(getLocalDateKey(new Date('2026-06-01T15:14:59.000Z'), 'Australia/Eucla')).toBe('2026-06-01');
    expect(getLocalDateKey(new Date('2026-06-01T15:15:00.000Z'), 'Australia/Eucla')).toBe('2026-06-02');
  });

  it('keeps yesterday in the Marquesas until the negative half-hour boundary', () => {
    expect(getLocalDateKey(new Date('2026-06-01T09:29:59.000Z'), 'Pacific/Marquesas')).toBe('2026-05-31');
    expect(getLocalDateKey(new Date('2026-06-01T09:30:00.000Z'), 'Pacific/Marquesas')).toBe('2026-06-01');
  });

  it('uses Chatham standard time after southern DST ends', () => {
    expect(getLocalDateKey(new Date('2026-06-01T11:14:59.000Z'), 'Pacific/Chatham')).toBe('2026-06-01');
    expect(getLocalDateKey(new Date('2026-06-01T11:15:00.000Z'), 'Pacific/Chatham')).toBe('2026-06-02');
  });

  it('rolls the local date at midnight before Lord Howe skips half an hour', () => {
    expect(getLocalDateKey(new Date('2026-10-03T13:29:59.000Z'), 'Australia/Lord_Howe')).toBe('2026-10-03');
    expect(getLocalDateKey(new Date('2026-10-03T13:30:00.000Z'), 'Australia/Lord_Howe')).toBe('2026-10-04');
  });

  it('preserves the date across Lord Howe’s spring-forward and autumn-back half-hour changes', () => {
    expect(getLocalDateKey(new Date('2026-10-03T15:29:59.000Z'), 'Australia/Lord_Howe')).toBe('2026-10-04');
    expect(getLocalDateKey(new Date('2026-10-03T15:30:00.000Z'), 'Australia/Lord_Howe')).toBe('2026-10-04');
    expect(getLocalDateKey(new Date('2026-04-04T14:59:59.000Z'), 'Australia/Lord_Howe')).toBe('2026-04-05');
    expect(getLocalDateKey(new Date('2026-04-04T15:00:00.000Z'), 'Australia/Lord_Howe')).toBe('2026-04-05');
  });

  it('handles Newfoundland half-hour offsets at both summer and winter midnight', () => {
    expect(getLocalDateKey(new Date('2026-06-01T02:29:59.000Z'), 'America/St_Johns')).toBe('2026-05-31');
    expect(getLocalDateKey(new Date('2026-06-01T02:30:00.000Z'), 'America/St_Johns')).toBe('2026-06-01');
    expect(getLocalDateKey(new Date('2026-01-01T03:29:59.000Z'), 'America/St_Johns')).toBe('2025-12-31');
    expect(getLocalDateKey(new Date('2026-01-01T03:30:00.000Z'), 'America/St_Johns')).toBe('2026-01-01');
  });

  it('uses Adelaide winter and summer offsets at their distinct UTC midnight boundaries', () => {
    expect(getLocalDateKey(new Date('2026-06-01T14:29:59.999Z'), 'Australia/Adelaide')).toBe('2026-06-01');
    expect(getLocalDateKey(new Date('2026-06-01T14:30:00.000Z'), 'Australia/Adelaide')).toBe('2026-06-02');
    expect(getLocalDateKey(new Date('2026-01-01T13:29:59.999Z'), 'Australia/Adelaide')).toBe('2026-01-01');
    expect(getLocalDateKey(new Date('2026-01-01T13:30:00.000Z'), 'Australia/Adelaide')).toBe('2026-01-02');
  });

  it('does not leak timezone settings across alternating calls for the same instant', () => {
    const instant = new Date('2026-12-31T10:00:00.000Z');
    expect(getLocalDateKey(instant, 'UTC')).toBe('2026-12-31');
    expect(getLocalDateKey(instant, 'Pacific/Kiritimati')).toBe('2027-01-01');
    expect(getLocalDateKey(instant, 'Pacific/Pago_Pago')).toBe('2026-12-30');
    expect(getLocalDateKey(instant, 'UTC')).toBe('2026-12-31');
  });

  it('respects the last millisecond before and the first instant of a UTC year', () => {
    expect(getLocalDateKey(new Date('2026-12-31T23:59:59.999Z'), 'UTC')).toBe('2026-12-31');
    expect(getLocalDateKey(new Date('2027-01-01T00:00:00.000Z'), 'UTC')).toBe('2027-01-01');
  });
});
