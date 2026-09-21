import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('../src/components/AddMomentModal.tsx', import.meta.url), 'utf8');

describe('editing a meal with an unknown time', () => {
  it('preserves an explicitly unknown time instead of inventing the current time', () => {
    expect(source).toContain("time:editingMoment ? editingMoment.time : now.toTimeString().slice(0,5)");
    expect(source).not.toContain("time:editingMoment?.time||now.toTimeString().slice(0,5)");
  });
});
