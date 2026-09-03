import { describe, expect, it } from 'vitest';
import { getFoodSuggestions } from './utils/foodSuggestions';
import { hasLatinLetters, localizeFoodSuggestions, localizeStoredFoodName } from './utils/arabicFoodNames';
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
          expect(hasLatinLetters(item.name), `${country}/${category}: ${item.name}`).toBe(false);
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

describe('legacy repeated meals in Arabic mode', () => {
  const cases: Array<[string, MomentCategory, string]> = [
    ['Sauerteig Toast','breakfast','توست العجين المخمر'],
    ['Avocado-Sauerteig-Toast','breakfast','توست العجين المخمر بالأفوكادو'],
    ['Neapolitanische Pizza','dinner','بيتزا نابولية'],
    ['Neapolitanische Pizza mit Mozzarella','dinner','بيتزا نابولية'],
    ['Napolitanische Pizza Margherita','dinner','بيتزا مارغريتا النابولية'],
    ['Homemade protein bowl','lunch','وجبة غداء سابقة'],
    ['Hausgemachtes Spezialgericht','dinner','وجبة عشاء سابقة'],
  ];

  for (const [stored, category, expected] of cases) {
    it(`never leaks Latin text for stored title: ${stored}`, () => {
      const visible = localizeStoredFoodName(stored, category, 'ar');
      expect(visible).toBe(expected);
      expect(hasArabic(visible)).toBe(true);
      expect(hasLatinLetters(visible)).toBe(false);
    });
  }

  it('keeps the original stored title in English mode', () => {
    expect(localizeStoredFoodName('Neapolitanische Pizza', 'dinner', 'en')).toBe('Neapolitanische Pizza');
  });
});
