import { describe, expect, it } from 'vitest';
import { getCheckInEditInitialState } from './components/DailyCheckInModal';

describe('DailyCheckInModal fresh-session state', () => {
  it('resets every answer field whenever a fresh modal session opens', () => {
    expect(getCheckInEditInitialState(null)).toMatchObject({
      mealItems:[],hungerBefore:3,fullnessAfter:4,energyLevel:3,mood:'satisfied',
      sleepHours:7.5,sleepQuality:4,bedtime:'23:00',wakeTime:'07:00',wakeFeeling:'normal',
      hungerTouched:false,fullnessTouched:false,energyTouched:false,moodTouched:false,
    });
  });
});
