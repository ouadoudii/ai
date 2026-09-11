import { describe, expect, it } from 'vitest';
import { assertSafeGeneratedFiles } from '../server/lib/security';

describe('generated file secret guard', () => {
  it('allows placeholders in .env.example', () => {
    expect(() => assertSafeGeneratedFiles([{ path: '.env.example', content: 'OPENAI_API_KEY=\n' }])).not.toThrow();
  });

  it('blocks real env files', () => {
    expect(() => assertSafeGeneratedFiles([{ path: '.env', content: 'TOKEN=placeholder' }])).toThrow(/forbidden/i);
  });

  it('blocks common leaked secret formats', () => {
    expect(() => assertSafeGeneratedFiles([{ path: 'config.ts', content: 'const x="ghp_123456789012345678901234567890"' }])).toThrow(/secret/i);
  });

  it('blocks path traversal', () => {
    expect(() => assertSafeGeneratedFiles([{ path: '../oops.txt', content: 'x' }])).toThrow(/unsafe/i);
  });
});
