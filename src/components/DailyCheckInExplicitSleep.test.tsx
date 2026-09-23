import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('./DailyCheckInModal.tsx', import.meta.url), 'utf8');

describe('DailyCheckInModal explicit sleep', () => {
  it('does not persist untouched sleep defaults', () => {
    expect(source).toContain("timePhase==='morning'&&hasSleepAnswer?");
    expect(source).toContain('sleepHoursTouched||sleepQualityTouched||bedtimeTouched||wakeTimeTouched||wakeFeelingTouched');
  });

  it('persists each sleep field only after explicit interaction', () => {
    expect(source).toContain('...(sleepHoursTouched?{durationHours:sleepHours}:{})');
    expect(source).toContain('...(sleepQualityTouched?{quality:sleepQuality}:{})');
    expect(source).toContain('...(bedtimeTouched?{bedtime}:{})');
    expect(source).toContain('...(wakeTimeTouched?{wakeTime}:{})');
    expect(source).toContain('...(wakeFeelingTouched?{wakeFeeling}:{})');
  });

  it('marks all five sleep controls touched from their handlers', () => {
    for (const setter of ['setSleepHoursTouched(true)','setSleepQualityTouched(true)','setBedtimeTouched(true)','setWakeTimeTouched(true)','setWakeFeelingTouched(true)']) {
      expect(source).toContain(setter);
    }
  });

  it('resets explicit-answer state for every fresh check-in', () => {
    for (const setter of ['setSleepHoursTouched(false)','setSleepQualityTouched(false)','setBedtimeTouched(false)','setWakeTimeTouched(false)','setWakeFeelingTouched(false)']) {
      expect(source).toContain(setter);
    }
  });

  it('does not visually present default quality or wake feeling as user-selected', () => {
    expect(source).toContain("sleepQualityTouched&&sleepQuality===n?'bg-amber-500 text-white':'bg-white'");
    expect(source).toContain("wakeFeelingTouched&&wakeFeeling===v?'bg-amber-50 border-amber-400':'bg-white'");
  });
});