import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import App from './App';

describe('Cary startup smoke test', () => {
  it('renders the initial app tree without crashing', () => {
    const html = renderToString(<App />);
    expect(html.length).toBeGreaterThan(100);
    expect(html).toContain('Cary');
  });
});
