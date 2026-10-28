import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

describe('onboarding explicit profile fields regression', () => {
  it('keeps the optional numeric weight field LTR inside the Arabic RTL form', () => {
    const source = fs.readFileSync('src/components/VoiceFirstEntryOverlay.tsx', 'utf8');
    expect(source).toMatch(/data-testid="onboarding-weight"\s+inputMode="decimal"\s+dir="ltr"/);
  });

  it('serializes optional hunger, energy and rhythm only after explicit interaction', () => {
    const source = fs.readFileSync('src/components/VoiceFirstEntryOverlay.tsx', 'utf8').replace(/\s+/g, '');

    expect(source).toContain('if(touched.hunger)parts.push');
    expect(source).toContain('if(touched.energy)parts.push');
    expect(source).toContain('if(touched.rhythm)');
    expect(source).toContain('setTouched((current)=>({...current,hunger:true}))');
    expect(source).toContain('setTouched((current)=>({...current,energy:true}))');
    expect(source).toContain('setTouched((current)=>({...current,rhythm:true}))');
    expect(source).not.toContain("const parts=[form.goal.trim(),`${copy.hunger}: ${form.hunger}/5`");
  });
});
