import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

const source = readFileSync(new URL('../src/components/LanguagePicker.tsx', import.meta.url), 'utf8');

test('language picker captures and restores the opener independently of locale rerenders', () => {
  expect(source).toMatch(/openerRef\.current = document\.activeElement/);
  expect(source).toMatch(/if \(opener\?\.isConnected\) opener\.focus\(\);/);
  expect(source).toMatch(/\}, \[open\]\);/);
  expect(source).not.toMatch(/openerRef\.current\?\.focus\(\);\s*\n\s*\};\s*\n\s*\}, \[open, onClose, language\]\)/);
});
