import {describe,expect,it} from 'vitest';
import {mergeAutocompleteSuggestions,rankLocalAutocomplete} from './utils/foodAutocomplete';

describe('meal autocomplete',()=>{
  it('puts prefix matches before looser contains matches',()=>{
    const names=['Chicken curry','Grilled chicken salad','Chicken and rice','Rice bowl'];
    expect(rankLocalAutocomplete(names,'chi')).toEqual(['Chicken curry','Chicken and rice','Grilled chicken salad']);
  });

  it('works with Arabic prefixes',()=>{
    const names=['طاجين الدجاج بالحامض المصير','كسكس بسبع خضار','طاجين اللحم بالبرقوق'];
    expect(rankLocalAutocomplete(names,'طاج')).toEqual(['طاجين الدجاج بالحامض المصير','طاجين اللحم بالبرقوق']);
  });

  it('merges AI suggestions without duplicates or echoing typed text',()=>{
    expect(mergeAutocompleteSuggestions(
      ['Chicken curry','Chicken and rice'],
      ['Chicken curry','Chicken pasta','chi'],
      'chi'
    )).toEqual(['Chicken curry','Chicken and rice','Chicken pasta']);
  });

  it('keeps the list intentionally short',()=>{
    const local=Array.from({length:10},(_,i)=>'Dish '+i);
    expect(mergeAutocompleteSuggestions(local,[],'x',6)).toHaveLength(6);
  });
});