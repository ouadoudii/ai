import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const source=readFileSync(new URL('./components/TodayHomeView.tsx',import.meta.url),'utf8');

describe('Today repeatable snack capture',()=>{
  it('keeps the snack action enabled after an existing same-day snack',()=>{
    expect(source).toContain("const hasSnack=realMoments.some(m=>m.date===today&&m.category==='snack')");
    expect(source).toContain("const openSnack=()=>{trackUx({eventName:'snack_card_tapped'");
    expect(source).not.toContain("snack_card_ignored_completed");
    expect(source).not.toContain('aria-disabled={hasSnack}');
  });

  it('presents an explicit add-another affordance in every supported UI language',()=>{
    expect(source).toContain("'Add another snack':'Ajouter une autre collation'");
    expect(source).toContain("copy('Add another snack','أضف وجبة خفيفة أخرى','Weiteren Snack hinzufügen')");
    expect(source).toContain('<Plus className="w-7 h-7"/>');
  });
});
