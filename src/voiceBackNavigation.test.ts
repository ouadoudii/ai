import {describe,expect,it} from 'vitest';
import {getVoiceBackDestination} from './utils/voiceBackNavigation';

describe('voice back navigation',()=>{
  it('returns an unfinished profile voice flow to the required entry gate',()=>{
    expect(getVoiceBackDestination(true)).toBe('onboarding-entry');
  });

  it('returns a regular journal voice flow to capture choices',()=>{
    expect(getVoiceBackDestination(false)).toBe('capture-choice');
  });
});
