import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.resolve('src/components/DailyCheckInModal.tsx'), 'utf8');

describe('DailyCheckInModal fresh-session state', () => {
  it('resets every answer field whenever a fresh modal session opens', () => {
    expect(source).toMatch(/if\s*\(isOpen\)[\s\S]*setStep\(1\)/);
    expect(source).toMatch(/if\s*\(isOpen\)[\s\S]*setMealItems\(\[\]\)/);
    expect(source).toMatch(/if\s*\(isOpen\)[\s\S]*setHungerBefore\(3\)/);
    expect(source).toMatch(/if\s*\(isOpen\)[\s\S]*setFullnessAfter\(4\)/);
    expect(source).toMatch(/if\s*\(isOpen\)[\s\S]*setEnergyLevel\(3\)/);
    expect(source).toMatch(/if\s*\(isOpen\)[\s\S]*setMood\('satisfied'\)/);
    expect(source).toMatch(/if\s*\(isOpen\)[\s\S]*setSleepHours\(7\.5\)/);
    expect(source).toMatch(/if\s*\(isOpen\)[\s\S]*setSleepQuality\(4\)/);
    expect(source).toMatch(/if\s*\(isOpen\)[\s\S]*setBedtime\('23:00'\)/);
    expect(source).toMatch(/if\s*\(isOpen\)[\s\S]*setWakeTime\('07:00'\)/);
    expect(source).toMatch(/if\s*\(isOpen\)[\s\S]*setWakeFeeling\('normal'\)/);
  });
});
