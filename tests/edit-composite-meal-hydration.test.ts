import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('../src/components/AddMomentModal.tsx', import.meta.url), 'utf8');

describe('editing a composite meal', () => {
  it('hydrates the editor with parsed meal components instead of one opaque title', () => {
    expect(source).toContain('parseMealTitle');
    expect(source).toContain('setItems(parseMealTitle(editingMoment.title))');
    expect(source).not.toContain('setItems([editingMoment.title])');
  });
});
