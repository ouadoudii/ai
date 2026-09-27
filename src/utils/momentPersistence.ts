import { FoodMoment } from '../types';

export const MOMENTS_STORAGE_KEY = 'nimmapp_moments_v1';

export type MomentPersistenceResult =
  | { ok: true }
  | { ok: false; reason: 'quota' | 'storage'; error: unknown };

export function persistMoments(moments: FoodMoment[], storage: Pick<Storage, 'setItem'> = localStorage): MomentPersistenceResult {
  try {
    storage.setItem(MOMENTS_STORAGE_KEY, JSON.stringify(moments));
    return { ok: true };
  } catch (error) {
    const quota = error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED');
    return { ok: false, reason: quota ? 'quota' : 'storage', error };
  }
}

export function getMomentPersistenceMessage(language: string, reason: 'quota' | 'storage'): string {
  const messages: Record<string, Record<'quota' | 'storage', string>> = {
    de: {
      quota: 'Dieser Moment ist noch nicht dauerhaft gespeichert. Dein Browser-Speicher ist voll. Entferne große Fotos oder gib Speicher frei und versuche es erneut.',
      storage: 'Dieser Moment ist noch nicht dauerhaft gespeichert. Bitte versuche es erneut, bevor du die App schließt.',
    },
    fr: {
      quota: "Ce moment n’est pas encore enregistré durablement. Le stockage du navigateur est plein. Supprime de grandes photos ou libère de l’espace, puis réessaie.",
      storage: "Ce moment n’est pas encore enregistré durablement. Réessaie avant de fermer l’application.",
    },
    ar: {
      quota: 'لم يتم حفظ هذه اللحظة بشكل دائم بعد. مساحة تخزين المتصفح ممتلئة. احذف الصور الكبيرة أو حرّر مساحة ثم حاول مرة أخرى.',
      storage: 'لم يتم حفظ هذه اللحظة بشكل دائم بعد. حاول مرة أخرى قبل إغلاق التطبيق.',
    },
    en: {
      quota: 'This moment is not saved permanently yet. Browser storage is full. Remove large photos or free storage, then try again.',
      storage: 'This moment is not saved permanently yet. Try again before closing the app.',
    },
  };
  return (messages[language] ?? messages.en)[reason];
}
