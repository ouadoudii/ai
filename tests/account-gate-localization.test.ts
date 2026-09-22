import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source=fs.readFileSync(path.join(process.cwd(),'src/components/CaryAccountGate.tsx'),'utf8');

describe('account gate localization',()=>{
  it('keeps all four supported locales selectable instead of a binary Arabic/English toggle',()=>{
    for(const value of ['de','en','fr','ar']) expect(source).toContain(`<option value="${value}">`);
    expect(source).toContain('value={language}');
    expect(source).toContain('setLanguage(e.target.value as AppLanguage)');
    expect(source).not.toContain("setLanguage(ar?'en':'ar')");
  });

  it('provides German and French account, login and confirmation copy',()=>{
    expect(source).toContain("de:{back:'Zurück'");
    expect(source).toContain("created:'Konto erstellt. Bitte bestätige deine E-Mail und melde dich danach an.'");
    expect(source).toContain("fr:{back:'Retour'");
    expect(source).toContain("created:'Compte créé. Confirme ton e-mail, puis connecte-toi.'");
    expect(source).toContain('setMessage(c.created)');
  });

  it('uses the selected locale copy throughout the gate while preserving Arabic RTL handling',()=>{
    expect(source).toContain('const c=copy[language]');
    expect(source).toContain("const ar=language==='ar'");
    for(const key of ['c.title','c.intro','c.signin','c.create','c.back','c.email','c.password']) expect(source).toContain(key);
  });
});
