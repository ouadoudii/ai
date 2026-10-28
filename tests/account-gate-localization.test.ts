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
    expect(component).toContain("catch{setError(screen==='signup'?c.signupFailed:c.failed)}");
    expect(copy).toContain("signupFailed:'تعذر إنشاء الحساب'");
    expect(copy).toContain("signupRecovery:'راجع البريد الإلكتروني وكلمة المرور أو حاول بعد قليل.");
    expect(component).not.toContain('x instanceof Error?x.message:c.failed');
  });

  it('uses the Arabic product brand and RTL account flow',()=>{
    expect(component).toContain('>ريثم</strong>');
    expect(component).not.toContain('>Moment</strong>');
    expect(component).toContain('const c=accountGateCopy');
    expect(component).toContain('rotate-180');
    for(const key of ['c.title','c.intro','c.signin','c.create','c.back','c.email','c.password']) expect(component).toContain(key);
  });
  it('offers calm, screen-reader-readable recovery instead of red alarm feedback',()=>{
    expect(copy).toContain("recovery:'راجع بياناتك أو حاول مرة أخرى بعد قليل.");
    expect(component).toContain('id="account-form-feedback" role="status" aria-live="polite"');
    expect(component).toContain("{screen==='signup'?c.signupRecovery:c.recovery}");
    expect(copy).not.toMatch(/(?:\bfailed:'Signup failed'|\bsignupRecovery:'Failed)/);
    expect(component).not.toContain('text-red-700');
    expect(component).toContain('bg-[#FFF8EB]');
    expect(component).toContain('text-[#544A3E]');
  });

  it('labels both fields, announces errors and clears stale feedback when changing screens',()=>{
    expect(component).toContain('aria-label={c.email}');
    expect(component).toContain('aria-label={c.password}');
    expect(component).toContain('aria-describedby={error ? "account-form-feedback" : undefined}');
    expect(component).toContain('autoComplete="email"');
    expect(component).toContain("autoComplete={screen==='login'?'current-password':'new-password'}");
    expect(component).toContain("const showScreen=(next:'choice'|'login'|'signup')=>{setError('');setMessage('');setScreen(next)}");
    expect(component).toContain('aria-busy={busy}');
    expect(component).toContain('focus-visible:outline');
  });

});
