import React from 'react';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { LanguageProvider } from './i18n';
import { TodayHomeView } from './components/TodayHomeView';

const liveFiles = [
  'index.html',
  'src/main.tsx',
  'src/App.tsx',
  'src/components/Header.tsx',
  'src/components/MobileBottomNav.tsx',
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

const noop=()=>{};

describe('English live V2', () => {
  it.each(liveFiles)('%s has no accidental hard-coded German UI copy', (file) => {
    const source = readFileSync(file, 'utf8');
    for (const term of forbiddenVisibleGerman) expect(source, `${file} contains ${term}`).not.toContain(term);
  });

  it('renders the multilingual Today screen in English without leaking German copy',()=>{
    (globalThis as any).localStorage={getItem:(key:string)=>key==='rhythm_language_v1'?'en':null,setItem:()=>{}};
    const tree=React.createElement(LanguageProvider,null,React.createElement(TodayHomeView,{moments:[],checkIns:[],onOpenAddModal:noop,onOpenSnack:noop,onOpenCheckInModal:noop as any,onSelectMoment:noop as any,onNavigateToCoach:noop,onNavigateToTypeAnalysis:noop,onNavigateToTimeline:noop}));
    const html=renderToString(tree);
    expect(html).toContain('Welcome back');
    expect(html).toContain('Your recent moments');
    expect(html).not.toContain('Willkommen zurück');
    expect(html).not.toContain('Deine letzten Momente');
    expect(html).not.toContain('Guten Morgen');
  });
});
