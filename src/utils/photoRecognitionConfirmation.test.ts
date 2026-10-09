import { describe, expect, it } from 'vitest';
import {
  acceptPhotoRecognition,
  createPhotoRecognitionState,
  resolveConfirmedMealInput,
} from './photoRecognitionConfirmation';

describe('photo recognition confirmation', () => {
  it('does not treat an AI suggestion as confirmed meal input', () => {
    const photoRecognition = createPhotoRecognitionState(['pizza', 'sandwich']);
    expect(resolveConfirmedMealInput({ typedTitle: '', items: [], photoRecognition })).toEqual({
      title: '',
      items: [],
    });
  });

  it('persists the exact suggestion only after explicit acceptance', () => {
    const suggested = createPhotoRecognitionState(['pizza', 'sandwich']);
    const photoRecognition = acceptPhotoRecognition(suggested, 'sandwich');
    expect(resolveConfirmedMealInput({ typedTitle: '', items: [], photoRecognition }).title).toBe('sandwich');
  });

  it('prefers an explicit user edit over an accepted model suggestion', () => {
    const suggested = createPhotoRecognitionState(['pizza']);
    const photoRecognition = acceptPhotoRecognition(suggested, 'pizza');
    expect(resolveConfirmedMealInput({ typedTitle: 'homemade flatbread', items: [], photoRecognition }).title).toBe('homemade flatbread');
  });

  it('prefers explicit selected meal items over an accepted model suggestion', () => {
    const suggested = createPhotoRecognitionState(['pizza']);
    const photoRecognition = acceptPhotoRecognition(suggested, 'pizza');
    expect(resolveConfirmedMealInput({ typedTitle: '', items: ['Harira'], photoRecognition })).toEqual({
      title: '',
      items: ['Harira'],
    });
  });

  it('cannot accept a value that was not proposed by recognition', () => {
    const suggested = createPhotoRecognitionState(['pizza']);
    const photoRecognition = acceptPhotoRecognition(suggested, 'burger');
    expect(photoRecognition.accepted).toBeNull();
  });

  it('drops blank recognition candidates', () => {
    expect(createPhotoRecognitionState([' pizza ', '', '   ', 'sandwich']).suggestions).toEqual(['pizza', 'sandwich']);
  });
});
