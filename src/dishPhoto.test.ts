import { describe,expect,it } from 'vitest';
import { getDishPhoto,isDishPhotoMatch } from './utils/dishPhoto';

describe('dish-specific photo matching',()=>{
  it('matches only known high-confidence dishes',()=>{
    expect(getDishPhoto('Pizza','dinner')?.title).toMatch(/Pizza/i);
    expect(getDishPhoto('بيتزا مارغريتا','dinner')?.title).toMatch(/Pizza/i);
    expect(getDishPhoto('Avocado toast','breakfast')?.title).toMatch(/Avocado/i);
    expect(getDishPhoto('توست بالأفوكادو','breakfast')?.title).toMatch(/Avocado/i);
    expect(getDishPhoto('Cheesecake','dessert')?.title).toMatch(/Cheesecake/i);
  });

  it('matches existing dish photos across English and Arabic names',()=>{
    expect(getDishPhoto('Salmon poke bowl with edamame','lunch')?.title).toMatch(/Poké/i);
    expect(getDishPhoto('بوكي السلمون مع ادامامي','lunch')?.title).toMatch(/Poké/i);
    expect(getDishPhoto('Truffle tagliatelle with parmesan','dinner')?.title).toMatch(/Tagliatelle/i);
    expect(getDishPhoto('باستا بالكمأة والبارميزان','dinner')?.title).toMatch(/Tagliatelle/i);
  });

  it('matches German and French names for every supported dish photo',()=>{
    const cases = [
      ['Avocado Sauerteig Toast mit Ei','Toast à l’avocat avec œuf','breakfast',/Avocado/i],
      ['Açai Bowl mit Banane','Bol d’açaï avec banane','breakfast',/Açai/i],
      ['Lachs Poké Bowl mit Edamame','Poké bowl saumon avec edamame','lunch',/Poké/i],
      ['Neapolitanische Pizza mit Basilikum','Pizza napolitaine au basilic','dinner',/Pizza/i],
      ['Trüffelpasta mit Parmesan','Pâtes à la truffe au parmesan','dinner',/Tagliatelle/i],
      ['Pistazien Käsekuchen','Cheesecake à la pistache','dessert',/Cheesecake/i],
    ] as const;

    for (const [german,french,category,title] of cases) {
      expect(getDishPhoto(german,category)?.title).toMatch(title);
      expect(getDishPhoto(french,category)?.title).toMatch(title);
    }
  });

  it('tolerates voice and keyboard accent/apostrophe variants',()=>{
    expect(getDishPhoto('toast a l avocat avec oeuf','breakfast')?.title).toMatch(/Avocado/i);
    expect(getDishPhoto('bol d acai avec banane','breakfast')?.title).toMatch(/Açai/i);
    expect(getDishPhoto('poke bowl saumon','lunch')?.title).toMatch(/Poké/i);
    expect(getDishPhoto('pates a la truffe au parmesan','dinner')?.title).toMatch(/Tagliatelle/i);
    expect(getDishPhoto('gateau au fromage pistache','dessert')?.title).toMatch(/Cheesecake/i);
    expect(getDishPhoto('توستٌ بالأفوكادو','breakfast')?.title).toMatch(/Avocado/i);
  });

  it('does not attach unrelated category photos',()=>{
    expect(getDishPhoto('Chicken tagine with preserved lemon','lunch')).toBeNull();
    expect(getDishPhoto('طاجين الدجاج بالحامض المصير','lunch')).toBeNull();
    expect(getDishPhoto('Sushi','dinner')).toBeNull();
    expect(getDishPhoto('Risotto','dinner')).toBeNull();
    expect(getDishPhoto('Harira','lunch')).toBeNull();
  });

  it('does not cross categories',()=>{
    expect(getDishPhoto('Pizza','breakfast')).toBeNull();
    expect(getDishPhoto('Cheesecake','dinner')).toBeNull();
    expect(getDishPhoto('Salmon poke bowl','dinner')).toBeNull();
    expect(getDishPhoto('Truffle tagliatelle','lunch')).toBeNull();
    expect(getDishPhoto('Lachs Poké Bowl','dinner')).toBeNull();
    expect(getDishPhoto('Pâtes à la truffe','lunch')).toBeNull();
    expect(getDishPhoto('pates a la truffe','lunch')).toBeNull();
  });

  it('validates matched URLs',()=>{
    const photo=getDishPhoto('Pizza','dinner');
    expect(photo).not.toBeNull();
    expect(isDishPhotoMatch('Pizza','dinner',photo!.url)).toBe(true);
    expect(isDishPhotoMatch('Sushi','dinner',photo!.url)).toBe(false);

    const pokePhoto=getDishPhoto('Salmon poke bowl','lunch');
    expect(pokePhoto).not.toBeNull();
    expect(isDishPhotoMatch('بوكي السلمون','lunch',pokePhoto!.url)).toBe(true);
    expect(isDishPhotoMatch('Lachs Poké Bowl','lunch',pokePhoto!.url)).toBe(true);
    expect(isDishPhotoMatch('Poké bowl saumon','lunch',pokePhoto!.url)).toBe(true);
    expect(isDishPhotoMatch('poke bowl saumon','lunch',pokePhoto!.url)).toBe(true);
  });
});
