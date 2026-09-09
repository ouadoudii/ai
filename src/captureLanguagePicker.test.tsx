import React from 'react';
import {describe,expect,it,beforeEach} from 'vitest';
import {renderToString} from 'react-dom/server';
import {LanguageProvider} from './i18n';
import {CaptureChoiceModal} from './components/CaptureChoiceModal';

const noop=()=>{};
beforeEach(()=>{(globalThis as any).localStorage={getItem:(k:string)=>k==='rhythm_language_v1'?'ar':null,setItem:()=>{}}});

describe('capture language picker',()=>{
  it('shows both explicit language choices inside capture',()=>{
    const html=renderToString(<LanguageProvider><CaptureChoiceModal isOpen onClose={noop} onFood={noop} onTellCary={noop}/></LanguageProvider>);
    expect(html).toContain('English');
    expect(html).toContain('العربية');
    expect(html).toContain('ما اللحظة التي تريد تسجيلها؟');
    expect(html).toContain('صورة');
    expect(html).toContain('احكِ لي');
    expect(html).not.toContain('اختيار سريع');
  });
  it('marks the persisted Arabic language as selected',()=>{
    const html=renderToString(<LanguageProvider><CaptureChoiceModal isOpen onClose={noop} onFood={noop} onTellCary={noop}/></LanguageProvider>);
    expect(html).toContain('aria-pressed="true"');
    expect(html).not.toContain('What would you like to capture?');
  });
});