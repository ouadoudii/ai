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
  });

  it('validates matched URLs',()=>{
    const photo=getDishPhoto('Pizza','dinner');
    expect(photo).not.toBeNull();
    expect(isDishPhotoMatch('Pizza','dinner',photo!.url)).toBe(true);
    expect(isDishPhotoMatch('Sushi','dinner',photo!.url)).toBe(false);
  });
});
