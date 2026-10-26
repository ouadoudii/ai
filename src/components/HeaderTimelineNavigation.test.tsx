import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Header } from './Header';
import { LanguageProvider } from '../i18n';

describe('desktop Header timeline navigation', () => {
  it('exposes the full moments timeline as a primary desktop destination', () => {
    const html = renderToString(
      <LanguageProvider>
        <Header activeTab="timeline" setActiveTab={() => undefined} onOpenAddModal={() => undefined} />
      </LanguageProvider>,
    );

    expect(html).toContain('التنقل الرئيسي');
    expect(html).toContain('لحظات');
    expect(html).toContain('bg-[#526B48] text-white');
  });

  it('exposes the language picker as a collapsed dialog control', () => {
    const html = renderToString(
      <LanguageProvider>
        <Header activeTab="today" setActiveTab={() => undefined} onOpenAddModal={() => undefined} />
      </LanguageProvider>,
    );

    expect(html).toContain('data-testid="language-picker-opener"');
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('aria-expanded="false"');
  });
});
