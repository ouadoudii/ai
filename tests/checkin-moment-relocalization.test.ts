import { describe, expect, it } from 'vitest';
import type { FoodMoment } from '../src/types';
import { localizeCheckInMoment } from '../src/utils/localizeCheckInMoment';
import { CHECKIN_SOURCE_TAG } from '../src/utils/checkInMomentState';

const germanMoment: FoodMoment = {
  id: 'meal-1', title: 'بيض مسلوق', label: 'Frühstück', category: 'breakfast', date: '2026-09-24', time: '08:15',
  location: 'Nicht angegeben', locationCategory: 'home', imageUrl: '', mood: 'satisfied',
  coachFeedback: { title: 'Erfasst', message: 'Für spätere Mustervergleiche gespeichert.', type: 'praise', badge: 'Check-in' },
  tags: ['Check-in', 'morning', `${CHECKIN_SOURCE_TAG}checkin-1`], createdAt: 1,
};

describe('persisted check-in moment relocalization', () => {
  it.each([
    ['en', 'Breakfast', 'Not specified', 'Captured', 'Check-in'],
    ['fr', 'Petit-déjeuner', 'Non précisé', 'Enregistré', 'Check-in'],
    ['ar', 'فطور', 'غير محدد', 'تم التسجيل', 'تسجيل'],
  ] as const)('derives generated chrome in %s without translating user content', (language, label, location, captured, badge) => {
    const localized = localizeCheckInMoment(germanMoment, language);
    expect(localized.label).toBe(label);
    expect(localized.location).toBe(location);
    expect(localized.coachFeedback?.title).toBe(captured);
    expect(localized.coachFeedback?.badge).toBe(badge);
    expect(localized.tags).toContain(badge);
    expect(localized.title).toBe('بيض مسلوق');
  });

  it('preserves user-authored coach summary and unrelated moments', () => {
    const withUserSummary = { ...germanMoment, coachFeedback: { ...germanMoment.coachFeedback!, message: 'Hat mich lange satt gehalten.' } };
    expect(localizeCheckInMoment(withUserSummary, 'ar').coachFeedback?.message).toBe('Hat mich lange satt gehalten.');
    const standalone = { ...germanMoment, tags: ['morning'] };
    expect(localizeCheckInMoment(standalone, 'ar')).toEqual(standalone);
  });
});
