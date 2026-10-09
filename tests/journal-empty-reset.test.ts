import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const component=fs.readFileSync(path.join(process.cwd(),'src/components/FoodCalendarView.tsx'),'utf8');

describe('journal empty-search recovery',()=>{
  it('clears the query and restores the all filter in one action',()=>{
    expect(component).toContain("const resetSearch=()=>{setQuery('');setFilter('all');setSearchScope('all');};");
    expect(component).toContain('onClick={resetSearch}');
    expect(component).toContain('data-testid="timeline-search-reset"');
  });

  it('only offers recovery for an empty active search and keeps all supported locales',()=>{
    expect(component).toContain('query.trim()&&groupedMoments.length===0');
    for(const label of ['Reset search','Suche zurücksetzen','Réinitialiser la recherche','إعادة ضبط البحث']) expect(component).toContain(label);
  });
});
