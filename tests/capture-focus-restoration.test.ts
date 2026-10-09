import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('../src/components/CaptureChoiceModal.tsx', import.meta.url), 'utf8');

describe('capture chooser focus restoration contract', () => {
  it('remembers the exact opener and restores it only when still connected', () => {
    expect(source).toContain('openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null');
    expect(source).toContain('restoreOpenerRef.current && opener?.isConnected');
    expect(source).toContain('opener.focus()');
  });

  it('does not steal focus when capture transitions to another flow or repeats a meal', () => {
    const suppressions = source.match(/restoreOpenerRef\.current=false/g) ?? [];
    expect(suppressions).toHaveLength(2);
  });
});
