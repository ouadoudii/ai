import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('DailyCheckInModal slider accessibility',()=>{
  it('gives every range control a localized accessible name',()=>{
    const source=fs.readFileSync(path.resolve(process.cwd(),'src/components/DailyCheckInModal.tsx'),'utf8');
    const sliders=[...source.matchAll(/<input[^>]*type="range"[^>]*>/g)].map(match=>match[0]);
    expect(sliders).toHaveLength(3);
    expect(sliders.every(slider=>slider.includes('aria-label='))).toBe(true);
    expect(source).toContain('aria-label={copy.sleepHours} type="range"');
    expect(source).toContain('aria-label={String(label)} type="range"');
    expect(source).toContain('aria-label={copy.energy} type="range"');
  });
});