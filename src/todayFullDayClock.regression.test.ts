import {readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';
import {shouldUseFullDayVoiceRecap} from './utils/voiceHomePrompt';

const source=readFileSync(new URL('./components/TodayHomeView.tsx',import.meta.url),'utf8');

describe('Today full-day recap clock regression (#244)',()=>{
  it('derives the recap mode from the reactive local clock',()=>{
    expect(source).toContain('const now=useLocalNow();');
    expect(source).toContain('const hour=now.getHours();');
    expect(source).toContain('setFullDayMode(shouldUseFullDayVoiceRecap(hour,completed));');
    expect(source).toContain('[hour,completedKey]');
  });

  it('switches at 18:00 but never hides controls for a completed day',()=>{
    const incomplete=['morning','midday'];
    expect(shouldUseFullDayVoiceRecap(17,incomplete)).toBe(false);
    expect(shouldUseFullDayVoiceRecap(18,incomplete)).toBe(true);
    expect(shouldUseFullDayVoiceRecap(18,['morning','midday','evening'])).toBe(false);
  });
});
