import React from 'react';
import {beforeEach,describe,expect,it} from 'vitest';
import {renderToString} from 'react-dom/server';
import {LanguageProvider} from './i18n';
import {MobileBottomNav} from './components/MobileBottomNav';
import {LanguagePicker} from './components/LanguagePicker';

const noop=()=>{};

describe('mobile bottom navigation language behavior',()=>{
  beforeEach(()=>{
    (globalThis as any).localStorage={
      getItem:(key:string)=>key==='rhythm_language_v1'?'fr':null,
      setItem:()=>{},
    };
  });

  it('renders the complete mobile navigation in French when French is persisted',()=>{
    const html=renderToString(
      <LanguageProvider>
        <MobileBottomNav activeTab="today" setActiveTab={noop} onCapture={noop} favoriteCount={0}/>
      </LanguageProvider>,
    );
    expect(html).toContain('Découvertes');
    expect(html).toContain('Mes moments');
    expect(html).toContain('Aujourd’hui');
    expect(html).toContain('Langue');
    expect(html).not.toContain('My moments');
  });

  it('shows all supported languages in the direct picker instead of cycling',()=>{
    const html=renderToString(
      <LanguageProvider>
        <LanguagePicker open onClose={noop} surface="bottom_nav"/>
      </LanguageProvider>,
    );
    expect(html).toContain('English');
    expect(html).toContain('Deutsch');
    expect(html).toContain('Français');
    expect(html).toContain('العربية');
    expect(html).toContain('aria-pressed="true"');
  });
});
