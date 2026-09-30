import React from 'react';
import { Check, Download, Languages, X } from 'lucide-react';
import { useLanguage, type AppLanguage } from '../i18n';
import type { DailyCheckIn, FoodMoment } from '../types';
import { downloadPersonalDataExport } from '../utils/personalDataExport';
import { trackUx } from '../utils/uxAnalytics';

const languages: Array<{ code: AppLanguage; name: string; native: string }> = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
];
const exportCopy:Record<AppLanguage,{label:string;hint:string}>={
  en:{label:'Export my data',hint:'Download a private JSON backup on this device'},
  de:{label:'Meine Daten exportieren',hint:'Private JSON-Sicherung auf dieses Gerät laden'},
  fr:{label:'Exporter mes données',hint:'Télécharger une sauvegarde JSON privée sur cet appareil'},
  ar:{label:'تصدير بياناتي',hint:'نزّل نسخة JSON خاصة على هذا الجهاز'},
};

interface Props {
  open: boolean;
  onClose: () => void;
  surface: 'header' | 'bottom_nav';
}

const readArray=<T,>(key:string,legacyKey:string):T[]=>{try{const raw=localStorage.getItem(key)||localStorage.getItem(legacyKey);const parsed=raw?JSON.parse(raw):[];return Array.isArray(parsed)?parsed:[];}catch{return [];}};

export const LanguagePicker: React.FC<Props> = ({ open, onClose, surface }) => {
  const { language, setLanguage, t } = useLanguage();
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const openerRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!open) return;

    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const panel = panelRef.current;
    const focusable = (): HTMLElement[] => panel
      ? Array.from(panel.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
      : [];
    const currentLanguage = panel?.querySelector<HTMLElement>(`[data-language-option="${language}"]`);
    (currentLanguage ?? focusable()[0])?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      openerRef.current?.focus();
    };
  }, [open, onClose, language]);

  if (!open) return null;

  const choose = (code: AppLanguage) => {
    if (code !== language) {
      trackUx({eventName:'language_selected',surface,language:code,metadata:{source:'language_picker',previousLanguage:language}});
      setLanguage(code);
    }
    onClose();
  };
  const exportData=()=>{
    const moments=readArray<FoodMoment>('nimmapp_moments_v1','food_journey_moments_v1');
    const checkIns=readArray<DailyCheckIn>('nimmapp_checkins_v1','getyourcoach_checkins_v1');
    downloadPersonalDataExport(moments,checkIns);
    trackUx({eventName:'personal_data_exported',surface,language,metadata:{moments: moments.length,checkins: checkIns.length}});
  };
  const copy=exportCopy[language];

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
        <div className="mt-2 border-t border-[#E9E1D6] pt-2">
          <button type="button" data-testid="personal-data-export" onClick={exportData} className="flex min-h-14 w-full items-center gap-3 rounded-2xl px-4 text-start text-[#5E5A54] hover:bg-[#F5F0E8]">
            <Download className="h-5 w-5 shrink-0 text-[#526B48]" aria-hidden="true"/>
            <span><span className="block text-sm font-black">{copy.label}</span><span className="block text-[10px] font-semibold text-[#918B82]">{copy.hint}</span></span>
          </button>
        </div>
      </div>
    </div>
  );
};
