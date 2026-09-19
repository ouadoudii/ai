import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./components/CaptureChoiceModal.tsx', import.meta.url), 'utf8');

describe('capture method parity', () => {
  it('offers photo, voice and text as first-class capture paths', () => {
    expect(source).toContain('data-capture-method="photo"');
    expect(source).toContain('data-capture-method="voice"');
    expect(source).toContain('data-capture-method="text"');
  });

  it('localizes the explicit text capture path in every supported language', () => {
    expect(source).toContain("en: 'Type'");
    expect(source).toContain("de: 'Tippen'");
    expect(source).toContain("fr: 'Écrire'");
    expect(source).toContain("ar: 'اكتب'");
  });
});
