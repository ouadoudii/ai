import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import App from './App';
describe('startup smoke test',()=>{it('renders the English V2 shell without crashing',()=>{const html=renderToString(<App/>);expect(html.length).toBeGreaterThan(100);expect(html).toContain('Rhythm');expect(html).toContain('Today');expect(html).toContain('Discoveries');expect(html).toContain('Start with one small moment');expect(html).not.toContain('Heute');expect(html).not.toContain('Muster');});});
