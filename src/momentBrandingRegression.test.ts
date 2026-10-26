import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const indexPath = fileURLToPath(new URL('../index.html', import.meta.url));
const html = readFileSync(indexPath, 'utf8');

describe('Arabic browser branding', () => {
  it('uses ريثم consistently in title, social metadata and boot copy', () => {
    expect(html).toContain('<title>ريثم — الطعام والنوم وإيقاع الحياة اليومية</title>');
    expect(html).toContain('content="يساعدك ريثم على تسجيل الطعام والنوم والطاقة والعافية');
    expect(html).toContain('<meta property="og:title" content="ريثم" />');
    expect(html).toContain('يتم تحميل ريثم…');
    expect(html).not.toContain('Moment');
    expect(html).not.toContain('Cary');
  });
});
