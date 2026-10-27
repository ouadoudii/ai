import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');
const css = source('src/index.css');
const html = source('index.html');
const today = source('src/components/TodayHomeView.tsx');

const token = (name: string) => {
  const value = new RegExp(`--moment-${name}:(#[0-9a-f]{6})`, 'i').exec(css)?.[1];
  if (!value) throw new Error(`Missing design token: ${name}`);
  return value;
};

function luminance(hex: string) {
  const channels = [1, 3, 5].map(offset => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

describe('organic Arabic-first design foundation', () => {
  it('replaces repeating tile wallpaper across the app and Today hero', () => {
    expect(css).not.toMatch(/moment-mosaic|56px 98px|moment-animal-companions\.svg/);
    expect(today).not.toContain('zellige-wall.svg');
    expect(today).toContain('data-testid="today-organic-hero"');
    expect(css).toContain('radial-gradient(ellipse');
    expect(today).toContain('linear-gradient(145deg, #72563e');
  });

  it('loads and applies legible Arabic UI and display fonts', () => {
    expect(html).toContain('family=Cairo');
    expect(html).toContain('family=Noto+Sans+Arabic');
    expect(css).toContain("'Noto Sans Arabic', 'Cairo'");
    expect(css).toContain(".font-display");
  });

  it('keeps body text, muted copy and focus indicators accessible on ivory', () => {
    expect(contrast(token('ink'), token('bg'))).toBeGreaterThanOrEqual(7);
    expect(contrast(token('muted'), token('bg'))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(token('focus'), token('bg'))).toBeGreaterThanOrEqual(3);
    for (const heroColor of ['#72563e', '#526348', '#244f43']) {
      expect(contrast('#ffffff', heroColor)).toBeGreaterThanOrEqual(4.5);
    }
    expect(css).toContain(':focus-visible{outline:3px solid var(--moment-focus)');
    expect(css).toContain('prefers-reduced-motion:reduce');
  });
});
