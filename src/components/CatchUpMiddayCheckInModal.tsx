import React from 'react';
import { createPortal } from 'react-dom';
import { Check, Clock3, Utensils, X } from 'lucide-react';
import { DailyCheckIn } from '../types';
import { getLocalDateKey } from '../utils/dateKey';
import { MealVisualPicker } from './MealVisualPicker';
import { AppLanguage, useLanguage } from '../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveCheckIn: (checkIn: Omit<DailyCheckIn, 'id' | 'createdAt'>) => void;
}

const FOCUSABLE_SELECTOR = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export type FocusTrapDestination = 'first' | 'last' | null;

export const getFocusTrapDestination = (
  shiftKey: boolean,
  activeInside: boolean,
  atFirst: boolean,
  atLast: boolean,
): FocusTrapDestination => {
  if (shiftKey && (!activeInside || atFirst)) return 'last';
  if (!shiftKey && (!activeInside || atLast)) return 'first';
  return null;
};

const copy: Record<AppLanguage, Record<string, string>> = {
  en: { eyebrow: 'A midday moment', now: 'now', title: 'Want to add what you ate?', intro: 'Completely optional. If this moment feels useful, capture it in a few seconds.', hunger: 'How hungry were you?', fullness: 'How full did you feel?', energy: 'And your energy after?', note: 'Anything worth remembering? (optional)', placeholder: 'For example: ate late, was out of the house…', later: 'Not now', add: 'Add this moment', close: 'Close', summary: 'Nice. You added another part of your day, helping the picture become clearer.' },
  de: { eyebrow: 'Ein Moment am Mittag', now: 'jetzt', title: 'Möchtest du ergänzen, was du gegessen hast?', intro: 'Ganz freiwillig. Wenn dieser Moment hilfreich ist, kannst du ihn in wenigen Sekunden festhalten.', hunger: 'Wie hungrig warst du?', fullness: 'Wie satt hast du dich gefühlt?', energy: 'Und deine Energie danach?', note: 'Möchtest du etwas festhalten? (optional)', placeholder: 'Zum Beispiel: spät gegessen, unterwegs gewesen…', later: 'Nicht jetzt', add: 'Moment hinzufügen', close: 'Schließen', summary: 'Gut. Du hast einen weiteren Teil deines Tages ergänzt und das Bild wird klarer.' },
  fr: { eyebrow: 'Un moment de midi', now: 'maintenant', title: 'Tu veux ajouter ce que tu as mangé ?', intro: 'C’est entièrement facultatif. Si ce moment t’est utile, note-le en quelques secondes.', hunger: 'À quel point avais-tu faim ?', fullness: 'À quel point étais-tu rassasié·e ?', energy: 'Et ton énergie après ?', note: 'Quelque chose à retenir ? (facultatif)', placeholder: 'Par exemple : mangé tard, à l’extérieur…', later: 'Pas maintenant', add: 'Ajouter ce moment', close: 'Fermer', summary: 'Bien. Tu as ajouté une autre partie de ta journée et l’image devient plus claire.' },
  ar: { eyebrow: 'لحظة من منتصف اليوم', now: 'الآن', title: 'تحب تضيف ما أكلته؟', intro: 'اختياري تماماً. إذا كانت هذه اللحظة مهمة لك، سجّلها في ثوانٍ.', hunger: 'كم كان جوعك؟', fullness: 'كم شعرت بالشبع؟', energy: 'وطاقتك بعدها؟', note: 'شيء تحب تتذكره؟ (اختياري)', placeholder: 'مثلاً: أكلت متأخراً، كنت خارج البيت…', later: 'ليس الآن', add: 'أضف اللحظة', close: 'إغلاق', summary: 'جميل. أضفت جزءاً آخر من يومك، وهذا يساعد الصورة على أن تصبح أوضح.' },
};

export const CatchUpMiddayCheckInModal: React.FC<Props> = ({ isOpen, onClose, onSaveCheckIn }) => {
  const { language } = useLanguage();
  const c = copy[language];
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const onCloseRef = React.useRef(onClose);
  const [mealTitle, setMealTitle] = React.useState('');
  const [hungerBefore, setHungerBefore] = React.useState(3);
  const [fullnessAfter, setFullnessAfter] = React.useState(3);
  const [energyLevel, setEnergyLevel] = React.useState(3);
  const [hungerTouched, setHungerTouched] = React.useState(false);
  const [fullnessTouched, setFullnessTouched] = React.useState(false);
  const [energyTouched, setEnergyTouched] = React.useState(false);
  const [note, setNote] = React.useState('');

  React.useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  React.useEffect(() => {
    if (!isOpen) return;
    setMealTitle('');
    setHungerBefore(3);
    setFullnessAfter(3);
    setEnergyLevel(3);
    setHungerTouched(false);
    setFullnessTouched(false);
    setEnergyTouched(false);
    setNote('');
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;

    const dialog = dialogRef.current;
    const appRoot = document.getElementById('root');
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const previousAriaHidden = appRoot?.getAttribute('aria-hidden') ?? null;
    const rootWasInert = appRoot?.hasAttribute('inert') ?? false;

    document.body.style.overflow = 'hidden';
    appRoot?.setAttribute('inert', '');
    appRoot?.setAttribute('aria-hidden', 'true');

    const frame = window.requestAnimationFrame(() => closeButtonRef.current?.focus({ preventScroll: true }));
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;

      const candidates = Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTOR)) as HTMLElement[];
      const focusable = candidates.filter(element => element.offsetParent !== null);
      if (!focusable.length) {
        event.preventDefault();
        dialog.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const destination = getFocusTrapDestination(
        event.shiftKey,
        dialog.contains(document.activeElement),
        document.activeElement === first,
        document.activeElement === last,
      );
      if (destination) {
        event.preventDefault();
        (destination === 'first' ? first : last).focus({ preventScroll: true });
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.body.style.overflow = previousOverflow;
      if (appRoot) {
        if (!rootWasInert) appRoot.removeAttribute('inert');
        if (previousAriaHidden === null) appRoot.removeAttribute('aria-hidden');
        else appRoot.setAttribute('aria-hidden', previousAriaHidden);
      }
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const hasMeaningfulInput = Boolean(mealTitle.trim() || note.trim() || hungerTouched || fullnessTouched || energyTouched);
  const save = () => {
    if (!hasMeaningfulInput) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const food = mealTitle ? {
      mealTitle,
      category: 'lunch' as const,
      ...(hungerTouched ? { hungerBefore } : {}),
      ...(fullnessTouched ? { fullnessAfter } : {}),
    } : undefined;
    const wellbeing = {
      ...(energyTouched ? { energyLevel } : {}),
      ...(note.trim() ? { note: note.trim() } : {}),
      voiceTranscription: '',
    };
    onSaveCheckIn({ date: getLocalDateKey(), time, timeOfDay: 'midday', food, wellbeing, coachSummary: c.summary });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4" dir={language === 'ar' ? 'rtl' : 'ltr'} data-testid="catchup-midday-overlay">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="catchup-midday-title"
        aria-describedby="catchup-midday-description"
        data-testid="catchup-midday-dialog"
        tabIndex={-1}
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white"
      >
        <div className="flex items-start justify-between gap-4 border-b bg-stone-50/70 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white"><Utensils className="h-5 w-5" /></div>
            <div>
              <div className="flex items-center gap-2"><span className="text-[11px] font-bold text-amber-800">{c.eyebrow}</span><span className="text-[10px] text-stone-600"><Clock3 className="inline h-3 w-3" /> {c.now} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
              <h2 id="catchup-midday-title" className="mt-1 font-display font-bold">{c.title}</h2>
              <p id="catchup-midday-description" className="mt-1 text-xs text-stone-600">{c.intro}</p>
            </div>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label={c.close} className="p-2"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-5 overflow-y-auto p-5">
          <MealVisualPicker value={mealTitle} onChange={setMealTitle} timePhase="midday" />
          <div className="grid grid-cols-2 gap-3">
            <label className="rounded-2xl border bg-stone-50 p-3 text-xs"><span className="mb-2 flex justify-between"><span>{c.hunger}</span><strong>{hungerTouched ? `${hungerBefore}/5` : '—'}</strong></span><input aria-label={c.hunger} className="w-full accent-amber-600" type="range" min="1" max="5" value={hungerBefore} onChange={event => { setHungerBefore(+event.target.value); setHungerTouched(true); }} /></label>
            <label className="rounded-2xl border bg-stone-50 p-3 text-xs"><span className="mb-2 flex justify-between"><span>{c.fullness}</span><strong>{fullnessTouched ? `${fullnessAfter}/5` : '—'}</strong></span><input aria-label={c.fullness} className="w-full accent-amber-600" type="range" min="1" max="5" value={fullnessAfter} onChange={event => { setFullnessAfter(+event.target.value); setFullnessTouched(true); }} /></label>
          </div>
          <label className="block rounded-2xl border bg-stone-50 p-3 text-xs"><span className="mb-2 flex justify-between"><span>{c.energy}</span><strong>{energyTouched ? `${energyLevel}/5` : '—'}</strong></span><input aria-label={c.energy} className="w-full accent-emerald-700" type="range" min="1" max="5" value={energyLevel} onChange={event => { setEnergyLevel(+event.target.value); setEnergyTouched(true); }} /></label>
          <label className="block text-xs font-semibold">{c.note}<textarea rows={2} value={note} onChange={event => setNote(event.target.value)} placeholder={c.placeholder} className="mt-1.5 w-full rounded-2xl border bg-stone-50 p-3 text-sm font-normal" /></label>
        </div>
        <div className="flex justify-between border-t bg-stone-50/70 p-4">
          <button type="button" onClick={onClose} className="px-4 py-2.5 text-xs">{c.later}</button>
          <button type="button" onClick={save} disabled={!hasMeaningfulInput} aria-disabled={!hasMeaningfulInput} className="flex gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"><Check className="h-4 w-4" />{c.add}</button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
