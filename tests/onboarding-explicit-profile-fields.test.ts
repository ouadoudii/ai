import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

describe('onboarding explicit profile fields regression', () => {
  it('serializes optional hunger, energy and rhythm only after explicit interaction', () => {
    const source = fs.readFileSync('src/components/VoiceFirstEntryOverlay.tsx', 'utf8');

    expect(source).toContain('if(touched.hunger)parts.push');
    expect(source).toContain('if(touched.energy)parts.push');
    expect(source).toContain('if(touched.rhythm)');
    expect(source).toContain('setTouched({...touched,hunger:true})');
    expect(source).toContain('setTouched({...touched,energy:true})');
    expect(source).toContain('setTouched({...touched,rhythm:true})');
    expect(source).not.toContain("const parts=[form.goal.trim(),`${copy.hunger}: ${form.hunger}/5`");
  });
});
