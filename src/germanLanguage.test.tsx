import React from 'react';
import {beforeEach,describe,expect,it} from 'vitest';
import {renderToString} from 'react-dom/server';
import {LanguageProvider} from './i18n';
import {CaptureChoiceModal} from './components/CaptureChoiceModal';
import {TodayHomeView} from './components/TodayHomeView';
import {NutritionTypeAnalysisView} from './components/NutritionTypeAnalysisView';
import {localizeStoredFoodName} from './utils/arabicFoodNames';
const noop=()=>{};
beforeEach(()=>{(globalThis as any).localStorage={getItem:(k:string)=>k==='rhythm_language_v1'?'de':null,setItem:()=>{}}});
describe('German language',()=>{
 it('renders the capture experience in German and offers all languages',()=>{const html=renderToString(<LanguageProvider><CaptureChoiceModal isOpen onClose={noop} onFood={noop} onTellCary={noop}/></LanguageProvider>);expect(html).toContain('Was möchtest du festhalten?');expect(html).toContain('Foto');expect(html).toContain('Erzähl mir');expect(html).toContain('Deutsch');expect(html).toContain('English');expect(html).toContain('العربية');expect(html).toContain('aria-pressed="true"');});
 it('localizes capture accessibility labels instead of leaking English labels',()=>{const html=renderToString(<LanguageProvider><CaptureChoiceModal isOpen onClose={noop} onFood={noop} onTellCary={noop}/></LanguageProvider>);expect(html).toContain('aria-label="Sprache wählen"');expect(html).toContain('aria-label="Schließen"');expect(html).not.toContain('aria-label="Choose language"');expect(html).not.toContain('aria-label="Close"');});
 it('renders the Today home experience in German instead of falling back to English',()=>{const html=renderToString(<LanguageProvider><TodayHomeView moments={[]} checkIns={[]} onOpenAddModal={noop} onOpenSnack={noop} onOpenCheckInModal={noop as any} onSelectMoment={noop as any} onNavigateToCoach={noop} onNavigateToTypeAnalysis={noop} onNavigateToTimeline={noop}/></LanguageProvider>);expect(html).toContain('Willkommen zurück');expect(html).toContain('Halte deinen Tag fest');expect(html).toContain('Deine letzten Momente');expect(html).toContain('Moment hinzufügen');expect(html).toContain('Starte mit einem kleinen Moment');expect(html).not.toContain('Welcome back');expect(html).not.toContain('Your recent moments');});
 it('renders the discoveries view in German without crashing or leaking English profile copy',()=>{const html=renderToString(<LanguageProvider><NutritionTypeAnalysisView moments={[]} checkIns={[]} onOpenCheckIn={noop} onOpenAddMoment={noop}/></LanguageProvider>);expect(html).toContain('Entdeckungen');expect(html).toContain('Wir lernen dich kennen');expect(html).toContain('Dein persönlicher Rhythmus');expect(html).toContain('Fuchs · Gefühle & Essen');expect(html).toContain('Moment hinzufügen');expect(html).not.toContain('Your personal rhythm');expect(html).not.toContain('Fox · Feelings & Food');});
 it('does not turn stored food names into Arabic in German mode',()=>{expect(localizeStoredFoodName('Pizza','dinner','de')).toBe('Pizza');expect(localizeStoredFoodName('بيتزا','dinner','de')).toBe('Pizza');});
});
