import type { AppLanguage } from '../i18n';
import type { FoodMoment } from '../types';
import { getCheckInMomentCopy } from './checkInMomentLocalization';
import { CHECKIN_SOURCE_TAG } from './checkInMomentState';

const languages: AppLanguage[] = ['de', 'en', 'fr', 'ar'];

const isGeneratedFallback = (message: string) =>
  languages.some(language => message === getCheckInMomentCopy(language, 'dinner').fallbackSummary);

export const localizeCheckInMoment = (moment: FoodMoment, language: AppLanguage): FoodMoment => {
  const sourceTags = moment.tags ?? [];
  if (!sourceTags.some(tag => tag.startsWith(CHECKIN_SOURCE_TAG))) return moment;

  const copy = getCheckInMomentCopy(language, moment.category);
  const generatedBadges = new Set(languages.map(locale => getCheckInMomentCopy(locale, moment.category).badge));
  const generatedLocations = new Set(languages.map(locale => getCheckInMomentCopy(locale, moment.category).location));
  const tags = sourceTags.map(tag => generatedBadges.has(tag) ? copy.badge : tag);
  const coachFeedback = moment.coachFeedback
    ? {
        ...moment.coachFeedback,
        title: languages.some(locale => moment.coachFeedback?.title === getCheckInMomentCopy(locale, moment.category).captured)
          ? copy.captured
          : moment.coachFeedback.title,
        message: isGeneratedFallback(moment.coachFeedback.message) ? copy.fallbackSummary : moment.coachFeedback.message,
        badge: generatedBadges.has(moment.coachFeedback.badge) ? copy.badge : moment.coachFeedback.badge,
      }
    : undefined;

  return {
    ...moment,
    label: copy.label,
    location: moment.location && generatedLocations.has(moment.location)
      ? copy.location
      : moment.location,
    tags,
    coachFeedback,
  };
};