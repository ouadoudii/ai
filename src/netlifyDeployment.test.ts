import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const config = readFileSync(new URL('../netlify.toml', import.meta.url), 'utf8');

describe('Netlify production configuration', () => {
  it('runs the same quality gate before building', () => {
    expect(config).toContain('command = "npm run quality:deploy && npm run build"');
    expect(config).toContain('publish = "dist"');
  });

  it('proxies API traffic before the SPA fallback', () => {
    const apiRule = config.indexOf('from = "/api/*"');
    const spaRule = config.indexOf('from = "/*"');

    expect(apiRule).toBeGreaterThan(-1);
    expect(spaRule).toBeGreaterThan(apiRule);
    expect(config).toContain('to = "https://ai-lyart-tau-91.vercel.app/api/:splat"');
    expect(config).toContain('force = true');
  });

  it('keeps microphone permissions and same-origin API calls allowed by CSP', () => {
    expect(config).toContain('Permissions-Policy = "camera=(self), geolocation=(), microphone=(self)"');
    expect(config).toContain("connect-src 'self' blob:");
  });
});
