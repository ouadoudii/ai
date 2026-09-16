import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('morning sleep timing', () => {
  it('keeps bedtime and wake time wired from the morning inputs into the saved sleep entry', () => {
    const source = readFileSync(new URL('./components/DailyCheckInModal.tsx', import.meta.url), 'utf8');

    expect(source).toContain("const [bedtime,setBedtime]=React.useState('23:00')");
    expect(source).toContain("const [wakeTime,setWakeTime]=React.useState('07:00')");
    expect(source).toContain('value={bedtime} onChange={e=>setBedtime(e.target.value)}');
    expect(source).toContain('value={wakeTime} onChange={e=>setWakeTime(e.target.value)}');
    expect(source).toContain("sleep:timePhase==='morning'?{durationHours:sleepHours,quality:sleepQuality,bedtime,wakeTime,wakeFeeling}:undefined");
  });
});
