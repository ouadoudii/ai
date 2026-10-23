import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

describe('Arabic first-paint document contract', () => {
  it('declares Arabic RTL before JavaScript hydrates', () => {
    expect(html).toContain('<html lang="ar" dir="rtl">');
    expect(html).toContain('<title>Moment — الطعام والنوم وإيقاع الحياة اليومية</title>');
    expect(html).toContain('يتم تحميل Moment…');
    expect(html).toContain('جارٍ تشغيل التطبيق.');
  });

  it('keeps startup failure and timeout fallbacks Arabic-only without raw exception details', () => {
    expect(html).toContain('تعذر بدء التطبيق. يُرجى تحديث الصفحة والمحاولة مرة أخرى.');
    expect(html).toContain('لم يبدأ التطبيق بعد 8 ثوانٍ. يُرجى تحديث الصفحة والمحاولة مرة أخرى.');

    expect(html).not.toContain('event.message');
    expect(html).not.toContain('String(event.reason');
    expect(html).not.toContain('Moment is loading…');
    expect(html).not.toContain('Starting the app.');
    expect(html).not.toContain('Startup error:');
    expect(html).not.toContain('The app has not started after 8 seconds.');
  });
});
