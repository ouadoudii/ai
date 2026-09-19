import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const chooser = readFileSync(new URL('./components/CaptureChoiceModal.tsx', import.meta.url), 'utf8');
const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');

describe('text capture routing', () => {
  it('does not route Text through the Photo callback', () => {
    expect(chooser).toContain('onText: () => void');
    expect(chooser).toContain("choose(onText,'text')");
    expect(chooser).not.toContain("choose(onFood,'text')");
  });

  it('requires App to wire a dedicated text-first action', () => {
    expect(app).toContain('onText=');
  });
});
