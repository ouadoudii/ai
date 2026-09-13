import React from 'react';
import { Check, Languages, X } from 'lucide-react';
import { type AppLanguage, useLanguage } from '../i18n';
import { trackUx } from '../utils/uxAnalytics';

const options: Array<{ code: AppLanguage; label: string; native: string }> = [
  { code: 'de', label: 'German', native: 'Deutsch' },
  { code: 'en', label: 'English', native: 'English' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
];

const titleByLanguage: Record<AppLanguage, string> = {
  de: 'Sprache auswählen',
  en: 'Choose language',
  fr: 'Choisir la langue',
  ar: 'اختر اللغة',
};

export const languageOptions = options;

interface LanguageMenuProps {
  open: boolean;
  onClose: () => void;
  surface: 'header' | 'bottom_nav' | 'capture_choice';
  variant?: 'dropdown' | 'sheet';
}

export const LanguageMenu: React.FC<LanguageMenuProps> = ({ open, onClose, surface, variant = 'dropdown' }) => {
  const { language, setLanguage } = useLanguage();
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const choose = (next: AppLanguage) => {
    if (next !== language) {
      trackUx({ eventName: 'language_selected', surface, language: next, metadata: { source: 'language_menu', previousLanguage: language } });
      setLanguage(next);
    }
    onClose();
  };

  const choices = (
    <div className="grid gap-1.5" role="listbox" aria-label={titleByLanguage[language]}>
      {options.map((option) => {
        const selected = option.code === language;
        return (
          <button
            key={option.code}
            type="button"
            role="option"
            aria-selected={selected}
            data-testid={`language-option-${option.code}`}
            onClick={() => choose(option.code)}
            className={`min-h-12 w-full rounded-2xl px-3.5 flex items-center justify-between gap-3 text-start transition ${selected ? 'bg-[#EEF3E9] text-[#3E5940]' : 'text-[#4F504B] hover:bg-[#F4F0E9]'}`}
          >
            <span className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white border border-[#E7E0D7] grid place-items-center text-[11px] font-black uppercase">{option.code}</span>
              <span>
                <strong className="block text-sm font-black">{option.native}</strong>
                {option.native !== option.label && <span className="block text-[11px] text-[#8A867E]">{option.label}</span>}
              </span>
            </span>
            {selected && <Check className="w-4 h-4" aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );

  if (variant === 'sheet') {
    return (
      <div className="fixed inset-0 z-[100] flex items-end bg-[#25231F]/45 backdrop-blur-sm" onMouseDown={onClose}>
        <section
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={titleByLanguage[language]}
          onMouseDown={(event) => event.stopPropagation()}
          className="w-full rounded-t-[30px] bg-[#FFFDF9] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2"><Languages className="w-5 h-5 text-[#526B48]"/><h2 className="text-lg font-black text-[#2E302B]">{titleByLanguage[language]}</h2></div>
            <button type="button" onClick={onClose} className="w-10 h-10 rounded-full bg-[#F3EEE7] grid place-items-center" aria-label="Close"><X className="w-4 h-4"/></button>
          </div>
          {choices}
        </section>
      </div>
    );
  }

  return (
    <div ref={panelRef} role="dialog" aria-label={titleByLanguage[language]} className="absolute end-0 top-[calc(100%+.6rem)] z-[90] w-64 rounded-[22px] border border-[#E5DCCF] bg-[#FFFDF9] p-2 shadow-[0_18px_50px_rgba(48,38,28,.18)]">
      <p className="px-2.5 py-2 text-[11px] font-black uppercase tracking-[.12em] text-[#8A867E]">{titleByLanguage[language]}</p>
      {choices}
    </div>
  );
};
