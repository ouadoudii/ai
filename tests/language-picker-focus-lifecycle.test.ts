import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/components/LanguagePicker.tsx', import.meta.url), 'utf8');

test('language picker captures and restores the opener independently of locale rerenders', () => {
  assert.match(source, /openerRef\.current = document\.activeElement/);
  assert.match(source, /if \(opener\?\.isConnected\) opener\.focus\(\);/);
  assert.match(source, /\}, \[open\]\);/);
  assert.doesNotMatch(source, /openerRef\.current\?\.focus\(\);\s*\n\s*\};\s*\n\s*\}, \[open, onClose, language\]\)/);
});
