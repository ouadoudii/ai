import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const workerPath = fileURLToPath(new URL('../public/local-ai-worker.js', import.meta.url));
const localAiPath = fileURLToPath(new URL('../src/utils/localAi.ts', import.meta.url));

describe('local Whisper language hints', () => {
  it('passes explicit language hints for every supported app language', () => {
    const source = readFileSync(workerPath, 'utf8');

    expect(source).toContain("language==='ar'||language==='en'||language==='de'||language==='fr'");
    expect(source).toContain('options.language=language');
  });

  it('keeps the Arabic retry explicitly pinned to Arabic', () => {
    const source = readFileSync(workerPath, 'utf8');

    expect(source).toContain("language:'ar'");
  });

  it('accepts French in the typed local transcription API', () => {
    const source = readFileSync(localAiPath, 'utf8');

    expect(source).toContain("language:'ar'|'en'|'de'|'fr'");
  });
});
