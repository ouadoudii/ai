import React from 'react';
import {beforeEach,describe,expect,it} from 'vitest';
import {renderToString} from 'react-dom/server';
import {LanguageProvider} from './i18n';
import {CaptureChoiceModal} from './components/CaptureChoiceModal';
import {localizeStoredFoodName} from './utils/arabicFoodNames';
const noop=()=>{};
beforeEach(()=>{(globalThis as any).localStorage={getItem:(k:string)=>k==='rhythm_language_v1'?'de':null,setItem:()=>{}}});
describe('German language',()=>{
 it('renders the capture experience in German and offers all languages',()=>{const html=renderToString(<LanguageProvider><CaptureChoiceModal isOpen onClose={noop} onFood={noop} onTellCary={noop}/></LanguageProvider>);expect(html).toContain('Was möchtest du festhalten?');expect(html).toContain('Foto');expect(html).toContain('Erzähl mir');expect(html).toContain('Deutsch');expect(html).toContain('English');expect(html).toContain('العربية');expect(html).toContain('aria-pressed="true"');});
 it('localizes capture accessibility labels instead of leaking English labels',()=>{const html=renderToString(<LanguageProvider><CaptureChoiceModal isOpen onClose={noop} onFood={noop} onTellCary={noop}/></LanguageProvider>);expect(html).toContain('aria-label="Sprache wählen"');expect(html).toContain('aria-label="Schließen"');expect(html).not.toContain('aria-label="Choose language"');expect(html).not.toContain('aria-label="Close"');});
 it('does not turn stored food names into Arabic in German mode',()=>{expect(localizeStoredFoodName('Pizza','dinner','de')).toBe('Pizza');expect(localizeStoredFoodName('بيتزا','dinner','de')).toBe('Pizza');});
});
