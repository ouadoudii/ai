import { describe, expect, it } from 'vitest';
import { momentCardCopy, momentCardDate } from './momentCardCopy';

describe('localized reusable meal card', () => {
 it('provides translated visible and accessible controls in every language', () => {
  expect(momentCardCopy.de.edit).toBe('Bearbeiten');
  expect(momentCardCopy.en.edit).toBe('Edit');
  expect(momentCardCopy.fr.edit).toBe('Modifier');
  expect(momentCardCopy.ar.edit).toBe('تعديل');
  for(const locale of ['de','en','fr','ar'] as const){
   const copy=momentCardCopy[locale];
   for(const field of ['home','favorite','unfavorite','feeling','hunger','fullness','slow','rushed','normal','details','options','edit','remove'] as const) expect(copy[field]).toBeTruthy();
   expect(copy.favorite).not.toBe(copy.unfavorite);
  }
 });
 it('uses locale-specific dates and preserves invalid stored dates', () => {
  expect(momentCardDate('2026-10-14','de')).not.toBe(momentCardDate('2026-10-14','en'));
  expect(momentCardDate('2026-10-14','fr')).toContain('oct');
  expect(momentCardDate('2026-13-14','ar')).toBe('2026-13-14');
 });
});
