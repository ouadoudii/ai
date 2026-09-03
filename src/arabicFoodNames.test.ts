import { describe, expect, it } from 'vitest';
import { getFoodSuggestions } from './utils/foodSuggestions';
import { localizeFoodSuggestions } from './utils/arabicFoodNames';
import type { MomentCategory } from './types';

const supportedCountries = ['MA','DE','FR','IT','ES','TR','GB','US','IN','JP','MX','AE','SA','EG','DZ','TN','QA','KW','JO','LB','OM','BH','IQ','LY','SD','YE','PS','ZZ'];
const categories: MomentCategory[] = ['breakfast','lunch','dinner','snack','coffee','dessert'];
const hasArabic = (value:string) => /[\u0600-\u06FF]/.test(value);

describe('Arabic food suggestions across countries and the full day', () => {
  for (const country of supportedCountries) {
    for (const category of categories) {
      it(`${country} ${category} renders dish names in Arabic`, () => {
        const english = getFoodSuggestions(country, category);
        const arabic = localizeFoodSuggestions(english, 'ar');
        expect(arabic.length).toBeGreaterThan(0);
        for (const item of arabic.slice(0, 18)) {
          expect(hasArabic(item.name), `${country}/${category}: ${item.name}`).toBe(true);
        }
      });
    }
  }

  it('preserves English dish names in English mode', () => {
    const english = getFoodSuggestions('MA', 'breakfast');
    const localized = localizeFoodSuggestions(english, 'en');
    expect(localized[0].name).toBe(english[0].name);
  });
});
