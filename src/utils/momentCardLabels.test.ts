import { describe, expect, it } from 'vitest';
import { momentCategoryLabels, momentMoodLabels } from './momentCardCopy';
describe('localized MomentCard labels', () => {
 for(const lang of ['de','en','fr','ar'] as const){
  it('provides every category and mood in '+lang,()=>{
   for(const key of ['breakfast','lunch','dinner','snack','coffee','dessert','drinks','travel'])
    expect(momentCategoryLabels[lang][key]?.trim()).toBeTruthy();
   for(const key of ['energized','satisfied','light','indulgent','comfort','joyful'])
    expect(momentMoodLabels[lang][key]?.trim()).toBeTruthy();
  });
 }
 it('does not leak German default labels into English and Arabic',()=>{
  expect(momentCategoryLabels.en.breakfast).toBe('Breakfast');
  expect(momentCategoryLabels.ar.breakfast).toBe('فطور');
  expect(momentMoodLabels.fr.satisfied).toBe('Rassasié et satisfait');
 });
});
