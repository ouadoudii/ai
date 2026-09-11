import { describe, expect, it } from 'vitest';
import { assertSafeGeneratedFiles } from '../server/lib/security';

describe('generated file secret guard', () => {
  it('allows placeholders in .env.example', () => {
    expect(() => assertSafeGeneratedFiles([{ path: '.env.example', content: 'OPENAI_API_KEY=\n' }])).not.toThrow();
  });

  it('allows nested .env.example documentation files but blocks real env files', () => {
    expect(() => assertSafeGeneratedFiles([{ path: 'apps/web/.env.example', content: 'API_URL=\n' }])).not.toThrow();
    expect(() => assertSafeGeneratedFiles([{ path: 'apps/web/.env.local', content: 'TOKEN=placeholder' }])).toThrow(/forbidden/i);
  });

  it('blocks real root env files', () => {
    expect(() => assertSafeGeneratedFiles([{ path: '.env', content: 'TOKEN=placeholder' }])).toThrow(/forbidden/i);
  });

  it('blocks common leaked secret formats', () => {
    expect(() => assertSafeGeneratedFiles([{ path: 'config.ts', content: 'const x="ghp_123456789012345678901234567890"' }])).toThrow(/secret/i);
  });

  it('blocks path traversal and duplicate paths', () => {
    expect(() => assertSafeGeneratedFiles([{ path: '../oops.txt', content: 'x' }])).toThrow(/unsafe/i);
    expect(() => assertSafeGeneratedFiles([{ path: 'a.txt', content: 'x' }, { path: 'a.txt', content: 'y' }])).toThrow(/duplicate/i);
  });
});
