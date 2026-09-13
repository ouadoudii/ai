import React from 'react';
import { Check, Languages, X } from 'lucide-react';
import { useLanguage, type AppLanguage } from '../i18n';
import { trackUx } from '../utils/uxAnalytics';

const languages: Array<{ code: AppLanguage; name: string; native: string }> = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  surface: 'header' | 'bottom_nav';
}

export const LanguagePicker: React.FC<Props> = ({ open, onClose, surface }) => {
  const { language, setLanguage, t } = useLanguage();
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const choose = (code: AppLanguage) => {
    if (code !== language) {
      trackUx({eventName:'language_selected',surface,language:code,metadata:{source:'language_picker',previousLanguage:language}});
      setLanguage(code);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#25231F]/45 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none" onMouseDown={(event)=>{if(event.target===event.currentTarget)onClose()}}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('chooseLanguage')}
        className="absolute inset-x-3 bottom-[max(5.6rem,env(safe-area-inset-bottom))] mx-auto max-w-md rounded-[28px] border border-[#E5DCCF] bg-[#FFFDF9] p-3 shadow-2xl md:inset-auto md:right-6 md:top-[4.5rem] md:w-72 md:rounded-2xl"
      >
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-2 text-sm font-black text-[#313B34]"><Languages className="h-4 w-4"/>{t('chooseLanguage')}</div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-[#F1ECE4]" aria-label={t('close')}><X className="h-4 w-4"/></button>
        </div>
        <div className="mt-1 grid gap-1">
          {languages.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => choose(item.code)}
              data-language-option={item.code}
              aria-pressed={language === item.code}
              className={`flex min-h-14 items-center justify-between rounded-2xl px-4 text-start transition ${language===item.code?'bg-[#EDF1E9] text-[#30412F]':'text-[#5E5A54] hover:bg-[#F5F0E8]'}`}
            >
              <span><span className="block text-sm font-black">{item.native}</span>{item.native!==item.name&&<span className="block text-[11px] font-semibold text-[#918B82]">{item.name}</span>}</span>
              {language===item.code&&<Check className="h-5 w-5 text-[#526B48]" aria-hidden="true"/>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
