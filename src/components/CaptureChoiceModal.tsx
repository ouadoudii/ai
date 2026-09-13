import React from 'react';
import { Camera, Mic2, RotateCcw, X, Check, Languages } from 'lucide-react';
import type { FoodMoment } from '../types';
import { getRepeatCandidates, repeatMeal } from '../utils/repeatMeal';
import { localizeStoredFoodName } from '../utils/arabicFoodNames';
import { useLanguage, type AppLanguage } from '../i18n';
import { trackUx } from '../utils/uxAnalytics';

interface CaptureChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFood: () => void;
  onTellCary: () => void;
}

const KEY = 'nimmapp_moments_v1';
const FOCUSABLE_SELECTOR = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function read(): FoodMoment[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

const languageName: Record<AppLanguage, string> = {
  en: 'English',
  ar: 'العربية',
  de: 'Deutsch',
  fr: 'Français',
};

export const CaptureChoiceModal: React.FC<CaptureChoiceModalProps> = ({ isOpen, onClose, onFood, onTellCary }) => {
  const { language, setLanguage, t } = useLanguage();
  const [recent, setRecent] = React.useState<FoodMoment[]>([]);
  const dialogRef = React.useRef<HTMLElement | null>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (isOpen) setRecent(getRepeatCandidates(read(), 3));
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable: HTMLElement[] = dialogRef.current
        ? Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        : [];
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const choose = (fn: () => void) => {
    onClose();
    fn();
  };

  const repeat = (moment: FoodMoment) => {
    localStorage.setItem(KEY, JSON.stringify([repeatMeal(moment), ...read()]));
    onClose();
    window.location.reload();
  };

  const changeLanguage = (lang: AppLanguage) => {
    if (lang === language) return;
    trackUx({
      eventName: 'language_selected',
      surface: 'capture_choice',
      language: lang,
      metadata: { source: 'capture_language_picker' },
    });
    setLanguage(lang);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-[#25231F]/55 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="capture-choice-title"
    >
      <section ref={dialogRef} className="w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] bg-[#FCFAF6] p-5 sm:p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="inline-flex max-w-[calc(100%-3rem)] items-center gap-1 overflow-x-auto rounded-full border border-[#DED8CF] bg-white p-1 shadow-sm" aria-label={t('chooseLanguage')}>
            <Languages className="mx-1 h-4 w-4 shrink-0 text-[#718067]" />
            {(['en', 'de', 'fr', 'ar'] as AppLanguage[]).map((lang) => (
              <button
                type="button"
                key={lang}
                data-language-option="true"
                onClick={() => changeLanguage(lang)}
                className={`min-w-[68px] shrink-0 rounded-full px-2.5 py-2 text-xs font-black transition ${language === lang ? 'bg-[#526B48] text-white' : 'text-[#716D66] hover:bg-[#F0ECE4]'}`}
                aria-pressed={language === lang}
              >
                {language === lang && <Check className="me-1 inline h-3 w-3" />}
                {languageName[lang]}
              </button>
            ))}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="w-10 h-10 shrink-0 rounded-full bg-white border border-[#E6E1D8] flex items-center justify-center"
            aria-label={t('close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div>
          <p className="text-xs font-bold text-[#8A867E]">{t('addLabel')}</p>
          <h2 id="capture-choice-title" className="mt-1 text-3xl font-display font-black text-[#252824]">{t('addWhat')}</h2>
        </div>
        {recent.length > 0 && (
          <div className="mt-5">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-[#858078]"><RotateCcw className="w-3.5 h-3.5" />{t('again')}</p>
            <div className="mt-2 flex gap-2 overflow-x-auto">
              {recent.map((moment) => (
                <button key={moment.id} type="button" onClick={() => repeat(moment)} className="shrink-0 max-w-44 rounded-full bg-white border border-[#E6E1D8] px-4 py-2.5 text-sm font-bold truncate">
                  {localizeStoredFoodName(moment.title, moment.category, language)}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => choose(onFood)} className="col-span-2 min-h-24 rounded-[24px] bg-[#E76F45] text-white flex flex-col items-center justify-center gap-2">
            <Camera className="w-6 h-6" />
            <strong className="text-sm">{t('photo')}</strong>
          </button>
          <button type="button" onClick={() => choose(onTellCary)} className="col-span-2 min-h-24 rounded-[24px] bg-[#293D34] text-white flex flex-col items-center justify-center gap-2">
            <Mic2 className="w-6 h-6" />
            <strong className="text-sm">{t('speak')}</strong>
          </button>
        </div>
        <p className="mt-4 text-center text-xs text-[#8C8880]">{t('captureKinds')}</p>
      </section>
    </div>
  );
};
