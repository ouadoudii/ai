import { describe, expect, it } from 'vitest';
import { shouldUseFullDayVoiceRecap, voiceHomePrompt } from './voiceHomePrompt';

describe('voice-first home prompt',()=>{
  it('uses granular capture before 18:00',()=>{
    expect(shouldUseFullDayVoiceRecap(17,['morning','midday'])).toBe(false);
  });

  it('collapses incomplete evening capture into one full-day recap from 18:00',()=>{
    expect(shouldUseFullDayVoiceRecap(18,[])).toBe(true);
    expect(shouldUseFullDayVoiceRecap(20,['morning','midday'])).toBe(true);
  });

  it('does not ask for a full-day recap once all three phases are complete',()=>{
    expect(shouldUseFullDayVoiceRecap(21,['morning','midday','evening'])).toBe(false);
  });

  it('localizes the full-day voice CTA including Darija',()=>{
    expect(voiceHomePrompt('ar',true).title).toBe('عاود ليا نهارك كامل');
    expect(voiceHomePrompt('de',true).title).toContain('ganzen Tag');
    expect(voiceHomePrompt('fr',true).title).toContain('journée');
    expect(voiceHomePrompt('en',true).title).toContain('whole day');
  });
});
