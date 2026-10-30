import React from 'react';
import { Bookmark, Calendar, Check, Clock, Edit3, MapPin, Pin, Repeat2, Share2, Trash2, X } from 'lucide-react';
import { FoodMoment } from '../types';
import { hasExplicitMealRating } from '../utils/mealRating';
import { useLanguage } from '../i18n';
import { isPinnableMeal, readPinnedMealIds, togglePinnedMealId, writePinnedMealIds } from '../pinnedMeals';
import { repeatMeal } from '../utils/repeatMeal';
import { persistMoments } from '../utils/momentPersistence';
import { getMomentDetailCopy } from './momentDetailCopy';

interface Props {
  moment: FoodMoment | null;
  onClose: () => void;
  onEdit: (m: FoodMoment) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onRepeat?: (m: FoodMoment) => void;
}

export { getMomentDetailCopy } from './momentDetailCopy';

export const copyMealShareText = async (text: string, clipboard: Pick<Clipboard, 'writeText'> | undefined) => {
  if (!clipboard) throw new Error('clipboard-unavailable');
  await clipboard.writeText(text);
};

export const getMomentDetailFocusDestination = (
  shiftKey: boolean,
  activeInside: boolean,
  activeIsFirst: boolean,
  activeIsLast: boolean,
): 'first' | 'last' | null => {
  if (!activeInside) return shiftKey ? 'last' : 'first';
  if (shiftKey && activeIsFirst) return 'last';
  if (!shiftKey && activeIsLast) return 'first';
  return null;
};

const focusableSelector = [
  'button:not([disabled])', '[href]', 'input:not([disabled])', 'select:not([disabled])',
  'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
].join(',');

const pinCopy = {
  en: { pin: 'Pin meal', unpin: 'Unpin meal' }, de: { pin: 'Mahlzeit anheften', unpin: 'Mahlzeit lösen' },
  fr: { pin: 'Épingler le repas', unpin: 'Désépingler le repas' }, ar: { pin: 'ثبّت الوجبة', unpin: 'إلغاء تثبيت الوجبة' },
} as const;
const repeatCopy = { en: 'Eat again', de: 'Nochmal essen', fr: 'Manger à nouveau', ar: 'أكلها مرة أخرى' } as const;

const repeatFromDetail = (moment: FoodMoment, onRepeat?: Props['onRepeat']) => {
  if (onRepeat) { onRepeat(moment); return; }
  try {
    const raw = localStorage.getItem('nimmapp_moments_v1');
    const stored: FoodMoment[] = raw ? JSON.parse(raw) : [];
    const source = stored.find((item) => item.id === moment.id) ?? moment;
    const result = persistMoments([repeatMeal(source), ...stored]);
    if (result.ok) window.location.reload();
  } catch (error) { console.error('Failed to repeat moment', error); }
};

export const MomentDetailModal: React.FC<Props> = ({ moment, onClose, onEdit, onDelete, onToggleFavorite, onRepeat }) => {
  const { language } = useLanguage();
  const copy = getMomentDetailCopy(language);
  const ar = language === 'ar';
  const repeatLabel = repeatCopy[language as keyof typeof repeatCopy] ?? repeatCopy.en;
  const [copied, setCopied] = React.useState(false);
  const [pinnedIds, setPinnedIds] = React.useState<string[]>(() => readPinnedMealIds());
  const [shareFailed, setShareFailed] = React.useState(false);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const dialogRef = React.useRef<HTMLElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const openerRef = React.useRef<HTMLElement | null>(null);
  const skipFocusRestoreRef = React.useRef(false);
  const titleId = React.useId();

  React.useEffect(() => { setPinnedIds(readPinnedMealIds()); }, [moment?.id]);

  React.useEffect(() => {
    if (!moment || typeof document === 'undefined') return;
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    skipFocusRestoreRef.current = false;
    const overlay = overlayRef.current;
    const siblings: HTMLElement[] = overlay?.parentElement
      ? Array.from(overlay.parentElement.children)
          .filter((element) => element !== overlay)
          .map((element) => element as HTMLElement)
      : [];
    const previous = siblings.map((element) => ({
      element,
      inert: element.inert,
      ariaHidden: element.getAttribute('aria-hidden'),
    }));
    previous.forEach(({ element }) => { element.inert = true; element.setAttribute('aria-hidden', 'true'); });
    closeButtonRef.current?.focus();
    return () => {
      previous.forEach(({ element, inert, ariaHidden }) => {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute('aria-hidden'); else element.setAttribute('aria-hidden', ariaHidden);
      });
      if (!skipFocusRestoreRef.current && openerRef.current?.isConnected) openerRef.current.focus();
    };
  }, [moment?.id]);

  const requestClose = React.useCallback(() => onClose(), [onClose]);
  React.useEffect(() => {
    if (!moment || typeof document === 'undefined') return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      requestClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [moment, requestClose]);

  if (!moment) return null;
  const lang = (language === 'de' || language === 'fr' || language === 'ar' ? language : 'en') as keyof typeof pinCopy;
  const pinned = pinnedIds.includes(String(moment.id));
  const pinnable = isPinnableMeal(moment);
  const cat = copy.categories[moment.category] || copy.meal;
  const togglePin = () => { const next = togglePinnedMealId(pinnedIds, moment); writePinnedMealIds(next); setPinnedIds(next); };
  const share = async () => {
    setCopied(false); setShareFailed(false);
    try {
      await copyMealShareText(`${moment.title} · ${cat} · ${moment.date} ${moment.time}`, navigator.clipboard);
      setCopied(true); setTimeout(() => setCopied(false), 1500);
    } catch { setShareFailed(true); }
  };
  const remove = () => { if (!window.confirm(copy.deleteConfirm(moment.title))) return; onClose(); onDelete(moment.id); };
  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab') return;
    const focusable: HTMLElement[] = dialogRef.current
      ? Array.from(dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector))
      : [];
    if (focusable.length === 0) { event.preventDefault(); dialogRef.current?.focus(); return; }
    const active = document.activeElement;
    const destination = getMomentDetailFocusDestination(
      event.shiftKey, Boolean(active && dialogRef.current?.contains(active)),
      active === focusable[0], active === focusable[focusable.length - 1],
    );
    if (!destination) return;
    event.preventDefault();
    focusable[destination === 'first' ? 0 : focusable.length - 1].focus();
  };

  return <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50">
    <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} onKeyDown={handleDialogKeyDown} data-testid="moment-detail-modal" className="w-full max-w-xl max-h-[92vh] overflow-hidden rounded-[30px] bg-[#F7F5F0] shadow-2xl flex flex-col">
      <div className="relative aspect-[16/9] bg-[#EAE6DE]">
        {moment.imageUrl && <img src={moment.imageUrl} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
        <button ref={closeButtonRef} type="button" onClick={requestClose} className={`absolute top-4 ${ar ? 'left-4' : 'right-4'} w-10 h-10 rounded-full bg-black/35 text-white flex items-center justify-center`} aria-label={copy.close}><X className="w-5 h-5" /></button>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <p data-testid="moment-detail-category" className="text-xs font-bold text-white/70">{cat}</p>
          <h1 id={titleId} className="mt-1 text-2xl font-display font-black">{moment.title}</h1>
          <div className="mt-2 flex gap-3 text-xs text-white/70"><span className="flex gap-1"><Calendar className="w-3.5 h-3.5" />{moment.date}</span><span className="flex gap-1"><Clock className="w-3.5 h-3.5" />{moment.time}</span></div>
        </div>
      </div>
      <div className="p-5 overflow-y-auto space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-[18px] bg-white border p-3"><span className="text-[10px] font-bold text-[#99958C]">{copy.location}</span><p className="mt-1 flex gap-1 text-xs font-bold"><MapPin className="w-3.5 h-3.5" />{moment.location || copy.unspecified}</p></div>
          <div className="rounded-[18px] bg-white border p-3"><span className="text-[10px] font-bold text-[#99958C]">{copy.rating}</span><p data-testid="moment-detail-rating" className="mt-1 text-xs font-bold">{hasExplicitMealRating(moment.rating) ? `${moment.rating}/5` : copy.unspecified}</p></div>
        </div>
        {(moment.hungerLevel || moment.fullnessLevel || moment.energyAfter) && <div className="rounded-[22px] bg-white border p-4"><h2 className="text-sm font-black">{copy.body}</h2><div className="mt-3 grid grid-cols-2 gap-3 text-xs">
          {moment.hungerLevel && <div><span className="text-[#8C8880]">{copy.hunger}</span><strong className="block mt-1">{moment.hungerLevel}/5</strong></div>}
          {moment.fullnessLevel && <div><span className="text-[#8C8880]">{copy.fullness}</span><strong className="block mt-1">{moment.fullnessLevel}/5</strong></div>}
          {moment.energyAfter && <div><span className="text-[#8C8880]">{copy.energy}</span><strong className="block mt-1">{copy.energyValues[moment.energyAfter] || moment.energyAfter}</strong></div>}
        </div></div>}
        {moment.notes && <div className="rounded-[22px] bg-[#EFE9DE] p-4"><span className="text-[10px] font-black">{copy.note}</span><p className="mt-2 text-sm">{moment.notes}</p></div>}
      </div>
      <footer className="p-4 border-t bg-white flex justify-between gap-3">
        <div className="flex gap-2">
          <button type="button" onClick={() => onToggleFavorite(moment.id)} className="w-10 h-10 rounded-full border flex items-center justify-center" aria-label={copy.favorite} aria-pressed={Boolean(moment.isFavorite)}><Bookmark className={`w-4 h-4 ${moment.isFavorite ? 'fill-current' : ''}`} /></button>
          {pinnable && <button type="button" data-testid="pin-meal-button" onClick={togglePin} className={`rounded-full border px-3 text-xs font-bold flex items-center gap-1.5 ${pinned ? 'bg-[#526B48] text-white border-[#526B48]' : ''}`} aria-label={pinned ? pinCopy[lang].unpin : pinCopy[lang].pin} aria-pressed={pinned}><Pin className={`w-3.5 h-3.5 ${pinned ? 'fill-current' : ''}`} /><span className="hidden sm:inline">{pinned ? pinCopy[lang].unpin : pinCopy[lang].pin}</span></button>}
          <button type="button" onClick={share} className="rounded-full border px-4 text-xs font-bold flex items-center gap-1.5" aria-live="polite">{copied ? <><Check className="w-3.5 h-3.5" />{copy.copied}</> : shareFailed ? <>{copy.copyFailed}</> : <><Share2 className="w-3.5 h-3.5" />{copy.share}</>}</button>
        </div>
        <div className="flex gap-2">
          <button type="button" data-testid="moment-detail-repeat" onClick={() => repeatFromDetail(moment, onRepeat)} className="rounded-full border px-4 py-2.5 text-xs font-black flex gap-1.5"><Repeat2 className="w-3.5 h-3.5" />{repeatLabel}</button>
          <button type="button" onClick={() => { skipFocusRestoreRef.current = true; onClose(); onEdit(moment); }} className="rounded-full bg-[#EFE9DE] px-4 py-2.5 text-xs font-black flex gap-1.5"><Edit3 className="w-3.5 h-3.5" />{copy.edit}</button>
          <button type="button" onClick={remove} className="w-10 h-10 rounded-full text-rose-600 flex items-center justify-center" aria-label={copy.delete}><Trash2 className="w-4 h-4" /></button>
        </div>
      </footer>
    </section>
  </div>;
};
