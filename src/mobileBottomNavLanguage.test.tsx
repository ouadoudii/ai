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

  it('renders the complete mobile navigation in Arabic when French is persisted',()=>{
    const html=renderToString(
      <LanguageProvider>
        <MobileBottomNav activeTab="today" setActiveTab={noop} onCapture={noop} favoriteCount={0}/>
      </LanguageProvider>,
    );
    expect(html).toContain('اكتشافاتك');
    expect(html).toContain('لحظاتي');
    expect(html).toContain('اليوم');
    expect(html).toContain('اللغة');
    expect(html).not.toContain('My moments');
  });

  it('marks only the active mobile destination as the current page for assistive technology',()=>{
    const html=renderToString(
      <LanguageProvider>
        <MobileBottomNav activeTab="timeline" setActiveTab={noop} onCapture={noop} favoriteCount={0}/>
      </LanguageProvider>,
    );
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);
    expect(html).toMatch(/aria-current="page"[^>]*data-testid="mobile-moments-nav"|data-testid="mobile-moments-nav"[^>]*aria-current="page"/);
  });

  it('shows only Arabic for historical locale preferences while retaining personal-data export',()=>{
    for (const persistedLanguage of ['en','de','fr','ar']) {
      (globalThis as any).localStorage={
        getItem:(key:string)=>key==='rhythm_language_v1'?persistedLanguage:null,
        setItem:()=>{},
      };
      const html=renderToString(
        <LanguageProvider>
          <LanguagePicker open onClose={noop} surface="bottom_nav"/>
        </LanguageProvider>,
      );
      expect(html).toContain('aria-label="اختر اللغة"');
      expect(html).toContain('data-language-option="ar"');
      expect(html).toContain('aria-pressed="true"');
      expect(html).not.toMatch(/data-language-option="(?:en|de|fr)"/);
      expect(html).not.toContain('English');
      expect(html).not.toContain('Deutsch');
      expect(html).not.toContain('Français');
      expect(html).toContain('data-testid="personal-data-export"');
      expect(html).toContain('تصدير بياناتي');
    }
  });
});
