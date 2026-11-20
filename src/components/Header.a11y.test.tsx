import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LanguageProvider } from '../i18n';
import { Header } from './Header';
import type { ActiveTab } from '../types';

describe('desktop Arabic navigation accessibility', () => {
  for (const activeTab of ['today', 'timeline', 'coach', 'type_analysis'] as ActiveTab[]) {
    it(`exposes exactly the active page for ${activeTab} without mislabeling capture`, () => {
      const html = renderToStaticMarkup(
        <LanguageProvider>
          <Header activeTab={activeTab} setActiveTab={() => {}} onOpenAddModal={() => {}} />
        </LanguageProvider>,
      );
      expect((html.match(/aria-current="page"/g) ?? [])).toHaveLength(1);
      expect(html).toContain('aria-label=');
      expect(html).toContain('type="button"');
      expect(html).toMatch(/[\u0600-\u06FF]/);
    });
  }
});
