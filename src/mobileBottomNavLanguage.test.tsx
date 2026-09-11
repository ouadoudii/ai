import React from 'react';
import {beforeEach,describe,expect,it} from 'vitest';
import {renderToString} from 'react-dom/server';
import {LanguageProvider} from './i18n';
import {getNextMobileLanguage,MobileBottomNav} from './components/MobileBottomNav';

const noop=()=>{};

describe('mobile bottom navigation language behavior',()=>{
  beforeEach(()=>{
    (globalThis as any).localStorage={
      getItem:(key:string)=>key==='rhythm_language_v1'?'de':null,
      setItem:()=>{},
    };
  });

  it('renders the complete mobile navigation in German when German is persisted',()=>{
    const html=renderToString(
      <LanguageProvider>
        <MobileBottomNav activeTab="today" setActiveTab={noop} onCapture={noop} favoriteCount={0}/>
      </LanguageProvider>,
    );
    expect(html).toContain('Entdeckungen');
    expect(html).toContain('Meine Momente');
    expect(html).toContain('Heute');
    expect(html).toContain('Sprache');
    expect(html).not.toContain('Discoveries');
    expect(html).not.toContain('My moments');
  });

  it('cycles all supported languages without skipping German',()=>{
    expect(getNextMobileLanguage('en')).toBe('de');
    expect(getNextMobileLanguage('de')).toBe('ar');
    expect(getNextMobileLanguage('ar')).toBe('en');
  });
});
