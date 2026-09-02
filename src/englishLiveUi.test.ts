import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const liveFiles = [
  'index.html',
  'src/main.tsx',
  'src/App.tsx',
  'src/components/Header.tsx',
  'src/components/MobileBottomNav.tsx',
  'src/components/TodayHomeView.tsx',
  'src/components/NutritionTypeAnalysisView.tsx',
  'src/components/CaptureChoiceModal.tsx',
  'src/components/AddMomentModal.tsx',
  'src/components/DailyCheckInModal.tsx',
  'src/components/CatchUpMiddayCheckInModal.tsx',
  'src/components/MealVisualPicker.tsx',
  'src/components/MomentDetailModal.tsx',
  'src/components/CaryOnboarding.tsx',
  'src/components/CaryAccountGate.tsx',
  'src/utils/patternInsights.ts',
  'src/utils/dailyJourney.ts',
];

const forbiddenVisibleGerman = [
  'Heute', 'Muster', 'Hinzufügen', 'Zurück', 'Speichern', 'Frühstück', 'Mittagessen', 'Abendessen',
  'Schließen', 'Anmelden', 'Konto erstellen', 'Bewertung', 'Zuhause', 'Hunger davor', 'Sättigung',
  'Bearbeiten', 'Löschen', 'Teilen', 'Erschöpft', 'Müde', 'Einträge', 'Beobachtungen',
];

describe('English-only live V2', () => {
  it.each(liveFiles)('%s has no known German UI copy', (file) => {
    const source = readFileSync(file, 'utf8');
    for (const term of forbiddenVisibleGerman) expect(source, `${file} contains ${term}`).not.toContain(term);
  });
});
