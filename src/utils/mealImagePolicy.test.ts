import { describe, expect, it } from 'vitest';
import { shouldClearAutoMatchedMealImage } from './mealImagePolicy';

describe('meal image preservation policy', () => {
  it('preserves an existing image during text-only edits even when it matches an automatic dish photo', () => {
    expect(shouldClearAutoMatchedMealImage({
      isEditing: true,
      currentImageUrl: '/images/dishes/tajine.jpg',
      matchedImageUrl: '/images/dishes/tajine.jpg',
    })).toBe(false);
  });

  it('preserves an uploaded image during edits', () => {
    expect(shouldClearAutoMatchedMealImage({
      isEditing: true,
      currentImageUrl: 'data:image/jpeg;base64,user-photo',
      matchedImageUrl: '/images/dishes/pizza.jpg',
    })).toBe(false);
  });

  it('still allows automatic matched-photo cleanup while composing a new variable meal', () => {
    expect(shouldClearAutoMatchedMealImage({
      isEditing: false,
      currentImageUrl: '/images/dishes/kebab.jpg',
      matchedImageUrl: '/images/dishes/kebab.jpg',
    })).toBe(true);
  });

  it('never clears an unrelated image automatically', () => {
    expect(shouldClearAutoMatchedMealImage({
      isEditing: false,
      currentImageUrl: 'data:image/jpeg;base64,user-photo',
      matchedImageUrl: '/images/dishes/couscous.jpg',
    })).toBe(false);
  });
});
