import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const runtimeFiles = [
  './components/Header.tsx',
  './components/FoodCoachView.tsx',
  './components/NutritionTypeAnalysisView.tsx',
  './components/CaringGuardian.tsx',
  './components/CaringVoiceHero.tsx',
  './utils/guardianLocalization.ts',
  './utils/coachEngine.ts',
  './apiClient.ts',
  './i18n/translations.ts',
  '../api/voice-checkin.ts',
  '../api/voice-intent.ts',
  '../api/[...path].ts',
  '../metadata.json',
  '../public/cary-animal-companions.svg',
] as const;

describe('legacy coach branding', () => {
  it.each(runtimeFiles)('does not expose the retired name in %s', (relativePath) => {
    const source = readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8');
    expect(source).not.toMatch(/\bCary\b|كاري/u);
  });

  it('renders the generic coach label in both responsive navigation surfaces', () => {
    const app = readFileSync(fileURLToPath(new URL('./App.tsx', import.meta.url)), 'utf8');
    const header = readFileSync(fileURLToPath(new URL('./components/Header.tsx', import.meta.url)), 'utf8');
    expect(app).toContain('data-testid="mobile-coach-nav"');
    expect(app).toContain('>Coach</button>');
    expect(header).toContain('data-testid="desktop-coach-nav"');
    expect(header).toMatch(/<MessageSquare[^>]*\/>\s*Coach/);
  });
});
