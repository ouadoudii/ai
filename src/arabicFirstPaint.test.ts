import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const recovery = readFileSync(new URL('../public/boot-recovery.js', import.meta.url), 'utf8');
const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')) as {
  headers: Array<{ headers: Array<{ key: string; value: string }> }>;
};
const productionCsp = vercel.headers.flatMap(entry => entry.headers)
  .find(header => header.key.toLowerCase() === 'content-security-policy')?.value;

describe('Arabic first-paint document contract', () => {
  it('declares Arabic RTL and Arabic branding before JavaScript hydrates', () => {
    expect(html).toContain('<html lang="ar" dir="rtl">');
    expect(html).toContain('<title>ريثم — الطعام والنوم وإيقاع الحياة اليومية</title>');
    expect(html).toContain('يتم تحميل ريثم…');
    expect(html).toContain('جارٍ تشغيل التطبيق.');
    expect(html).not.toContain('Moment');
  });

  it('keeps startup failure and timeout fallbacks Arabic-only without raw exception details', () => {
    expect(html).toContain('<script src="/boot-recovery.js"></script>');
    expect(html).toContain('id="rhythm-boot-status" role="status" aria-live="polite"');
    expect(recovery).toContain('تعذر بدء التطبيق. يُرجى تحديث الصفحة والمحاولة مرة أخرى.');
    expect(recovery).toContain('لم يبدأ التطبيق بعد 8 ثوانٍ. يُرجى تحديث الصفحة والمحاولة مرة أخرى.');

    expect(recovery).not.toContain('event.message');
    expect(recovery).not.toContain('String(event.reason');
    expect(recovery).not.toContain('Starting the app.');
    expect(recovery).not.toContain('Startup error:');
    expect(recovery).not.toContain('The app has not started after 8 seconds.');
  });
  it('keeps strict production CSP while loading the recovery script from the same origin', () => {
    expect(productionCsp).toContain("script-src 'self'");
    expect(productionCsp).not.toContain("'unsafe-inline'");
    expect(html).not.toMatch(/<script(?![^>]*\bsrc=)[^>]*>/);
    expect(html).toContain('<script src="/boot-recovery.js"></script>');
    expect(recovery).toContain("window.addEventListener('error'");
    expect(recovery).toContain("window.addEventListener('unhandledrejection'");
    expect(recovery).toContain('8000');
  });
});
