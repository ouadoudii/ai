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
describe('Arabic-only UI overrides persisted legacy locales',()=>{
 it('renders the capture experience in Arabic without legacy language controls',()=>{const html=renderToString(<LanguageProvider><CaptureChoiceModal isOpen onClose={noop} onFood={noop} onTellCary={noop}/></LanguageProvider>);expect(html).toContain('ما اللحظة التي تريد تسجيلها؟');expect(html).toContain('صورة');expect(html).toContain('احكِ لي');expect(html).not.toContain('Deutsch');expect(html).not.toContain('English');expect(html).not.toContain('Français');expect(html).not.toContain('data-language-option');});
 it('uses Arabic capture accessibility labels without a language picker',()=>{const html=renderToString(<LanguageProvider><CaptureChoiceModal isOpen onClose={noop} onFood={noop} onTellCary={noop}/></LanguageProvider>);expect(html).toContain('aria-label="إغلاق"');expect(html).not.toContain('aria-label="اختر اللغة"');expect(html).not.toContain('aria-label="Choose language"');expect(html).not.toContain('aria-label="Close"');});
 it('renders the Today home experience in Arabic instead of falling back to legacy locales',()=>{const html=renderToString(<LanguageProvider><TodayHomeView moments={[]} checkIns={[]} onOpenAddModal={noop} onOpenSnack={noop} onOpenCheckInModal={noop as any} onSelectMoment={noop as any} onNavigateToCoach={noop} onNavigateToTypeAnalysis={noop} onNavigateToTimeline={noop}/></LanguageProvider>);expect(html).toContain('مرحباً بك');expect(html).toContain('سجّل يومك');expect(html).toContain('لحظاتك الأخيرة');expect(html).toContain('أضف لحظة');expect(html).toContain('ابدأ بلحظة واحدة بسيطة');expect(html).not.toContain('Welcome back');expect(html).not.toContain('Your recent moments');});
 it('renders the discoveries view in Arabic without crashing',()=>{let html='';expect(()=>{html=renderToString(<LanguageProvider><NutritionTypeAnalysisView moments={[]} checkIns={[]} onOpenCheckIn={noop} onOpenAddMoment={noop}/></LanguageProvider>)}).not.toThrow();expect(html).toContain('اكتشافاتك');expect(html).toContain('ملاحظات لا تصنيفات');expect(html).toContain('لا نختصر شخصيتك في نوع غذائي');expect(html).not.toContain('الثعلب · المشاعر والطعام');expect(html).not.toContain('Fox · Feelings & Food');});
 it('does not turn stored food names into Arabic in German mode',()=>{expect(localizeStoredFoodName('Pizza','dinner','de')).toBe('Pizza');expect(localizeStoredFoodName('بيتزا','dinner','de')).toBe('Pizza');});
});
