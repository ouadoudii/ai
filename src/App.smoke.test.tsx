import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import App from './App';
describe('startup smoke test',()=>{it('renders the Arabic V2 shell without crashing',()=>{const html=renderToString(<App/>);expect(html.length).toBeGreaterThan(100);expect(html).toContain('إيقاع');expect(html).toContain('مرحباً بك');expect(html).toContain('اكتشافاتك');expect(html).toContain('ابدأ بلحظة واحدة بسيطة');expect(html).not.toContain('Heute');expect(html).not.toContain('Muster');});});
