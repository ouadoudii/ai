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
  });

  it('validates matched URLs',()=>{
    const photo=getDishPhoto('Pizza','dinner');
    expect(photo).not.toBeNull();
    expect(isDishPhotoMatch('Pizza','dinner',photo!.url)).toBe(true);
    expect(isDishPhotoMatch('Sushi','dinner',photo!.url)).toBe(false);

    const pokePhoto=getDishPhoto('Salmon poke bowl','lunch');
    expect(pokePhoto).not.toBeNull();
    expect(isDishPhotoMatch('بوكي السلمون','lunch',pokePhoto!.url)).toBe(true);
  });
});
