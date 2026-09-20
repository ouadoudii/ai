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

    expect(html).toContain('Main navigation');
    expect(html).toContain('moments');
    expect(html).toContain('bg-[#526B48] text-white');
  });
});
