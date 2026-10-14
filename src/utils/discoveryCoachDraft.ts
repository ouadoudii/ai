import type { AppLanguage } from '../i18n';

const prefixes: Record<AppLanguage, string> = {
  de: 'Hilf mir, diesen persönlichen Zusammenhang zu verstehen:',
  en: 'Help me understand this personal pattern:',
  fr: 'Aide-moi à comprendre ce lien personnel :',
  ar: 'ساعدني على فهم هذا النمط الشخصي:',
};

/** Builds an editable Cary draft from text already shown to the user. */
export function buildDiscoveryCoachDraft(observation: string, language: AppLanguage): string {
  const verbatimObservation = observation.trim();
  if (!verbatimObservation) return '';
  return `${prefixes[language]} ${verbatimObservation}`;
}
