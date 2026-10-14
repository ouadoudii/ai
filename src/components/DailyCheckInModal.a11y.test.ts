import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Daily Check-In choice accessibility regression', () => {
 const source = readFileSync(resolve(process.cwd(), 'src/components/DailyCheckInModal.tsx'), 'utf8');
 it('exposes the selected state for sleep quality, wake feeling and mood', () => {
  expect(source).toContain('aria-pressed={sleepQualityTouched&&sleepQuality===n}');
  expect(source).toContain('aria-pressed={wakeFeelingTouched&&wakeFeeling===v}');
  expect(source).toContain('aria-pressed={moodTouched&&mood===v}');
 });
 it('does not announce untouched defaults as deliberate answers', () => {
  for(const name of ['sleepQualityTouched','wakeFeelingTouched','moodTouched']){
   expect(source).toContain(name+'&&');
  }
 });
});
