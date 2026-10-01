import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const source=fs.readFileSync(path.resolve('src/components/MomentDetailModal.tsx'),'utf8');

describe('Moment detail clipboard share regression',()=>{
  it('awaits clipboard completion before reporting copied and catches rejection',()=>{
    expect(source).toContain('await navigator.clipboard.writeText');
    expect(source).toContain("setShareStatus('copied')");
    expect(source).toContain("catch{setShareStatus('error')}");
    expect(source.indexOf('await navigator.clipboard.writeText')).toBeLessThan(source.indexOf("setShareStatus('copied')"));
  });
  it('reports clipboard absence and localizes failure feedback',()=>{
    expect(source).toContain("if(!navigator.clipboard?.writeText){setShareStatus('error');return}");
    expect(source).toContain("failed:'Kopieren fehlgeschlagen'");
    expect(source).toContain("failed:'Copy failed'");
    expect(source).toContain("failed:'Échec de la copie'");
    expect(source).toContain("failed:'تعذر النسخ'");
    expect(source).toContain('aria-live="polite"');
  });
});
