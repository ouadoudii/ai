import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { CHECKIN_SOURCE_TAG } from './utils/checkInMomentState';

const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');

describe('check-in meal deletion consistency', () => {
  it('links a check-in-derived timeline meal to its source check-in', () => {
    expect(CHECKIN_SOURCE_TAG).toBe('source-checkin:');
    expect(app).toContain('`${CHECKIN_SOURCE_TAG}${newCheckIn.id}`');
  });

  it('removes only the linked check-in meal when its derived timeline moment is deleted', () => {
    expect(app).toContain('tag.startsWith(CHECKIN_SOURCE_TAG)');
    expect(app).toContain("checkIn.id===sourceCheckInId?{...checkIn,food:undefined}:checkIn");
  });

  it('does not reconcile unrelated check-ins for standalone moments', () => {
    expect(app).toContain('if(sourceCheckInId)setCheckIns');
  });
});