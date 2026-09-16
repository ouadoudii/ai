import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const componentPath = fileURLToPath(new URL('./components/MomentOnboarding.tsx', import.meta.url));
const legacyPath = fileURLToPath(new URL('./components/CaryOnboarding.tsx', import.meta.url));
const mainPath = fileURLToPath(new URL('./main.tsx', import.meta.url));

describe('Moment onboarding naming', () => {
  it('uses MomentOnboarding and does not restore the Cary onboarding component', () => {
    expect(existsSync(componentPath)).toBe(true);
    expect(existsSync(legacyPath)).toBe(false);
    const main = readFileSync(mainPath, 'utf8');
    expect(main).toContain('MomentOnboarding');
    expect(main).not.toContain('CaryOnboarding');
  });
});
