import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const component=fs.readFileSync(path.join(process.cwd(),'src/components/CaryAccountGate.tsx'),'utf8');
const copy=fs.readFileSync(path.join(process.cwd(),'src/components/CaryAccountGateCopy.ts'),'utf8');

describe('account gate localization',()=>{
  it('keeps all four supported locales selectable instead of a binary Arabic/English toggle',()=>{
    for(const value of ['de','en','fr','ar']) expect(component).toContain(`<option value="${value}">`);
    expect(component).toContain('value={language}');
    expect(component).toContain('setLanguage(e.target.value as AppLanguage)');
    expect(component).not.toContain("setLanguage(ar?'en':'ar')");
  });

  it('provides German and French account, login and confirmation copy',()=>{
    expect(copy).toContain("de:{back:'Zurück'");
    expect(copy).toContain("created:'Konto erstellt. Bitte bestätige deine E-Mail und melde dich danach an.'");
    expect(copy).toContain("fr:{back:'Retour'");
    expect(copy).toContain("created:'Compte créé. Confirme ton e-mail, puis connecte-toi.'");
    expect(component).toContain('setMessage(c.created)');
  });

  it('uses the selected locale copy throughout the gate while preserving Arabic RTL handling',()=>{
    expect(component).toContain('const c=accountGateCopy[language]');
    expect(component).toContain("const ar=language==='ar'");
    for(const key of ['c.title','c.intro','c.signin','c.create','c.back','c.email','c.password']) expect(component).toContain(key);
  });
});
