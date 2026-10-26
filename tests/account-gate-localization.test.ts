import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const component=fs.readFileSync(path.join(process.cwd(),'src/components/CaryAccountGate.tsx'),'utf8');
const copy=fs.readFileSync(path.join(process.cwd(),'src/components/CaryAccountGateCopy.ts'),'utf8');

describe('Arabic-only account gate',()=>{
  it('does not expose historical language choices',()=>{
    expect(component).not.toContain('account-language');
    expect(component).not.toContain('<select');
    for(const value of ['de','en','fr']) expect(component).not.toContain(`<option value="${value}">`);
    expect(component).not.toContain('setLanguage');
    expect(component).not.toContain('AppLanguage');
  });

  it('keeps account, login and confirmation copy Arabic-only',()=>{
    expect(copy).toContain("back:'رجوع'");
    expect(copy).toContain("created:'تم إنشاء الحساب. أكّد بريدك الإلكتروني ثم سجّل الدخول.'");
    expect(copy).not.toContain("en:{");
    expect(copy).not.toContain("de:{");
    expect(copy).not.toContain("fr:{");
    expect(component).toContain('setMessage(c.created)');
  });

  it('uses the Arabic product brand and RTL account flow',()=>{
    expect(component).toContain('>ريثم</strong>');
    expect(component).not.toContain('>Moment</strong>');
    expect(component).toContain('const c=accountGateCopy');
    expect(component).toContain('rotate-180');
    for(const key of ['c.title','c.intro','c.signin','c.create','c.back','c.email','c.password']) expect(component).toContain(key);
  });
});
