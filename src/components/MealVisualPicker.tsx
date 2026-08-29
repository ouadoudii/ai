import React from 'react';
import { Check } from 'lucide-react';
import { TimeOfDayPhase } from '../types';

type FoodKind = 'bowl' | 'toast' | 'eggs' | 'drink' | 'pastry' | 'plate' | 'salad' | 'soup' | 'pasta' | 'rice' | 'pizza' | 'fish' | 'meat' | 'wrap' | 'dessert';

interface MealOption {
  value: string;
  alt: string;
  kind: FoodKind;
  variant: number;
}

const makeOptions = (items: Array<[string, FoodKind]>): MealOption[] =>
  items.map(([value, kind], index) => ({ value, alt: value, kind, variant: index }));

const breakfastOptions = makeOptions([
  ['Porridge mit Beeren', 'bowl'], ['Avocado-Toast', 'toast'], ['Rührei mit Tomaten', 'eggs'], ['Joghurt mit Früchten', 'bowl'],
  ['Chia-Pudding', 'bowl'], ['Grüner Smoothie', 'drink'], ['Pancakes mit Obst', 'pastry'], ['French Toast', 'toast'],
  ['Smoothie Bowl', 'bowl'], ['Omelett mit Gemüse', 'eggs'], ['Gekochte Eier mit Brot', 'eggs'], ['Frühstücks-Bagel', 'toast'],
  ['Overnight Oats', 'bowl'], ['Granola mit Joghurt', 'bowl'], ['Tomaten-Mozzarella-Toast', 'toast'], ['Obstsalat', 'salad'],
  ['Orangensaft', 'drink'], ['Milchkaffee', 'drink'], ['Mango-Chia-Bowl', 'bowl'], ['Rührei mit Avocado', 'eggs'],
  ['Frühstücks-Crêpes', 'pastry'], ['Joghurt mit Heidelbeeren', 'bowl'], ['Bananen-Erdnuss-Toast', 'toast'], ['Lachs-Toast', 'toast'],
  ['Sesam-Bagel', 'pastry'], ['Croissant', 'pastry'], ['Schokocroissant', 'pastry'], ['Müsli mit Früchten', 'bowl'],
  ['Cappuccino', 'drink'], ['Tee', 'drink'], ['Wasser mit Zitrone', 'drink'], ['Milch', 'drink'],
  ['Kakao', 'drink'], ['Frühstücks-Waffeln', 'pastry'], ['Quark mit Nüssen', 'bowl'], ['Nur Kaffee oder Tee', 'drink'],
]);

const lunchOptions = makeOptions([
  ['Mediterraner Salat', 'salad'], ['Reis-Gemüse-Bowl', 'rice'], ['Pasta mit Tomatensauce', 'pasta'], ['Hähnchen mit Gemüse', 'meat'],
  ['Gemüsesuppe', 'soup'], ['Couscous-Bowl', 'rice'], ['Lachs mit Salat', 'fish'], ['Wrap mit Gemüse', 'wrap'],
  ['Falafel mit Hummus', 'plate'], ['Pizza Margherita', 'pizza'], ['Kartoffel-Gemüse-Teller', 'plate'], ['Linseneintopf', 'soup'],
  ['Quinoa-Salat', 'salad'], ['Nudel-Bowl', 'pasta'], ['Reis mit Curry', 'rice'], ['Fisch mit Reis', 'fish'],
  ['Burger mit Salat', 'meat'], ['Gemüse-Wrap', 'wrap'], ['Buddha Bowl', 'bowl'], ['Tomatensuppe', 'soup'],
  ['Sushi-Teller', 'fish'], ['Ofengemüse', 'plate'], ['Pasta mit Gemüse', 'pasta'], ['Kichererbsen-Curry', 'rice'],
  ['Caesar-Salat', 'salad'], ['Hähnchen-Reis-Teller', 'meat'], ['Gemüse-Pizza', 'pizza'], ['Bohneneintopf', 'soup'],
  ['Pita mit Hummus', 'wrap'], ['Lachs-Bowl', 'fish'], ['Gnocchi mit Gemüse', 'pasta'], ['Reis mit Bohnen', 'rice'],
  ['Gemüse-Lasagne', 'plate'], ['Protein-Bowl', 'bowl'], ['Leichter Lunch-Teller', 'plate'], ['Obst-Dessert', 'dessert'],
]);

const dinnerOptions = makeOptions([
  ['Gegrilltes Hähnchen mit Gemüse', 'meat'], ['Lachs mit Spargel', 'fish'], ['Steak mit Kartoffeln', 'meat'], ['Spaghetti am Abend', 'pasta'],
  ['Gemüse-Lasagne', 'plate'], ['Gefüllte Paprika', 'plate'], ['Warme Gemüse-Bowl', 'bowl'], ['Risotto', 'rice'],
  ['Nudeln mit Gemüse', 'pasta'], ['Hackbällchen mit Beilage', 'meat'], ['Zucchini-Nudeln', 'pasta'], ['Pilzpfanne', 'plate'],
  ['Kürbissuppe', 'soup'], ['Pilzsuppe', 'soup'], ['Gemüseeintopf', 'soup'], ['Großer Abendsalat', 'salad'],
  ['Hähnchensalat', 'salad'], ['Griechischer Salat', 'salad'], ['Ofenhähnchen', 'meat'], ['Rinderschmortopf', 'meat'],
  ['Ofengemüse mit Fisch', 'fish'], ['Kichererbsen-Bowl', 'bowl'], ['Gemüse-Curry', 'rice'], ['Lachs mit Kartoffeln', 'fish'],
  ['Pasta mit Pilzen', 'pasta'], ['Reis-Gemüse-Pfanne', 'rice'], ['Leichte Suppe', 'soup'], ['Abendbrot mit Gemüse', 'toast'],
  ['Hummus-Teller', 'plate'], ['Vegetarischer Wrap', 'wrap'], ['Pizza mit Gemüse', 'pizza'], ['Warmer Salat', 'salad'],
  ['Kleine Bowl', 'bowl'], ['Herzhafter Teller', 'plate'], ['Leichtes Abendessen', 'plate'], ['Kleines Dessert', 'dessert'],
]);

const ITEMS_PER_PAGE = 12;

const getOptionsForPhase = (timePhase: TimeOfDayPhase) => {
  if (timePhase === 'morning') return breakfastOptions;
  if (timePhase === 'midday') return lunchOptions;
  return dinnerOptions;
};

const makePages = (options: MealOption[]): MealOption[][] =>
  Array.from({ length: Math.ceil(options.length / ITEMS_PER_PAGE) }, (_, pageIndex) =>
    options.slice(pageIndex * ITEMS_PER_PAGE, (pageIndex + 1) * ITEMS_PER_PAGE)
  );

const FoodArtwork: React.FC<{ kind: FoodKind; variant: number }> = ({ kind, variant }) => {
  const hue = (variant * 37 + kind.length * 19) % 360;
  const accent = `hsl(${hue} 64% 52%)`;
  const accentSoft = `hsl(${(hue + 35) % 360} 70% 74%)`;
  const green = `hsl(${100 + (variant % 35)} 48% 44%)`;
  const warm = `hsl(${28 + (variant % 25)} 72% 57%)`;
  const seedDots = Array.from({ length: 7 }, (_, i) => ({
    x: 30 + ((variant * 17 + i * 29) % 140),
    y: 56 + ((variant * 23 + i * 19) % 92),
    r: 5 + ((variant + i) % 5),
  }));

  const garnish = seedDots.map((dot, i) => (
    <circle key={i} cx={dot.x} cy={dot.y} r={dot.r} fill={i % 2 ? green : accentSoft} opacity="0.92" />
  ));

  return (
    <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`bg-${kind}-${variant}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fffaf1" />
          <stop offset="1" stopColor="#efe4d5" />
        </linearGradient>
        <filter id={`shadow-${kind}-${variant}`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#5b4632" floodOpacity="0.2" />
        </filter>
      </defs>
      <rect width="200" height="200" rx="24" fill={`url(#bg-${kind}-${variant})`} />
      <ellipse cx="100" cy="166" rx="68" ry="12" fill="#9a7f6630" />

      {(kind === 'bowl' || kind === 'salad' || kind === 'rice' || kind === 'soup') && (
        <g filter={`url(#shadow-${kind}-${variant})`}>
          <ellipse cx="100" cy="92" rx="65" ry="43" fill="#f8f1e7" stroke="#d6c3af" strokeWidth="3" />
          <path d="M37 94c5 47 29 68 63 68s58-21 63-68" fill="#e8d7c6" stroke="#cbb49e" strokeWidth="3" />
          {kind === 'soup' ? <ellipse cx="100" cy="92" rx="56" ry="34" fill={warm} /> : garnish}
          {kind === 'rice' && <path d="M58 98c22-32 61-35 88 0-24 18-62 20-88 0Z" fill="#f0d79d" opacity="0.95" />}
        </g>
      )}

      {kind === 'toast' && (
        <g filter={`url(#shadow-${kind}-${variant})`} transform={`rotate(${variant % 2 ? -7 : 6} 100 105)`}>
          <rect x="48" y="57" width="105" height="95" rx="22" fill="#c88a4d" />
          <rect x="55" y="65" width="91" height="80" rx="18" fill="#e8bd78" />
          <path d="M60 103c18-26 57-37 83-9-17 31-51 41-83 9Z" fill={green} />
          {garnish.slice(0, 4)}
        </g>
      )}

      {kind === 'eggs' && (
        <g filter={`url(#shadow-${kind}-${variant})`}>
          <ellipse cx="100" cy="111" rx="67" ry="51" fill="#f4eee7" stroke="#d7c7b8" strokeWidth="3" />
          <ellipse cx="76" cy="103" rx="29" ry="22" fill="#fff9e9" />
          <circle cx="76" cy="103" r="12" fill="#f4b52d" />
          <ellipse cx="126" cy="116" rx="29" ry="22" fill="#fff9e9" />
          <circle cx="126" cy="116" r="12" fill="#f4b52d" />
          {garnish.slice(0, 4)}
        </g>
      )}

      {kind === 'drink' && (
        <g filter={`url(#shadow-${kind}-${variant})`}>
          <path d="M68 49h65l-9 108H77Z" fill="#ffffffaa" stroke="#cbbba9" strokeWidth="3" />
          <path d="M73 72h55l-7 79H80Z" fill={variant % 3 === 0 ? green : variant % 3 === 1 ? '#7b4d2d' : accent} opacity="0.9" />
          <ellipse cx="101" cy="72" rx="28" ry="8" fill="#ffffff90" />
        </g>
      )}

      {kind === 'pastry' && (
        <g filter={`url(#shadow-${kind}-${variant})`}>
          <path d="M46 126c18-68 86-81 111-17-14 48-91 59-111 17Z" fill={warm} />
          <path d="M62 116c22-39 59-48 80-9" fill="none" stroke="#f5d6a0" strokeWidth="9" strokeLinecap="round" />
          {garnish.slice(0, 3)}
        </g>
      )}

      {(kind === 'plate' || kind === 'fish' || kind === 'meat' || kind === 'dessert') && (
        <g filter={`url(#shadow-${kind}-${variant})`}>
          <ellipse cx="100" cy="112" rx="70" ry="54" fill="#faf7f2" stroke="#d8cabc" strokeWidth="3" />
          {kind === 'fish' && <path d="M56 109c24-28 62-27 91-3-25 30-63 33-91 3Zm91-3 18-15v31Z" fill={accent} />}
          {kind === 'meat' && <rect x="60" y="87" width="80" height="49" rx="18" fill="#8a4d32" transform={`rotate(${variant % 2 ? 8 : -8} 100 111)`} />}
          {kind === 'dessert' && <path d="M67 130 94 72l45 58Z" fill="#c98c68" />}
          {kind === 'plate' && <><circle cx="78" cy="109" r="25" fill={accentSoft} /><path d="M103 90h37v41h-37Z" fill={green} /></>}
          {garnish.slice(0, 5)}
        </g>
      )}

      {kind === 'pasta' && (
        <g filter={`url(#shadow-${kind}-${variant})`}>
          <ellipse cx="100" cy="113" rx="70" ry="53" fill="#faf7f2" stroke="#d8cabc" strokeWidth="3" />
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d={`M55 ${88 + i * 6}c30 30 58-24 91 4`} fill="none" stroke="#e3b552" strokeWidth="5" strokeLinecap="round" />
          ))}
          {garnish.slice(0, 4)}
        </g>
      )}

      {kind === 'pizza' && (
        <g filter={`url(#shadow-${kind}-${variant})`}>
          <circle cx="100" cy="107" r="60" fill="#d99a4e" />
          <circle cx="100" cy="107" r="51" fill="#efc66c" />
          <circle cx="100" cy="107" r="43" fill="#d85f45" opacity="0.88" />
          {garnish}
        </g>
      )}

      {kind === 'wrap' && (
        <g filter={`url(#shadow-${kind}-${variant})`} transform={`rotate(${variant % 2 ? 9 : -9} 100 105)`}>
          <path d="M61 55h78l17 93H45Z" fill="#e7c78d" stroke="#c59b60" strokeWidth="3" />
          <path d="M69 62h62l-8 30H77Z" fill={green} />
          {garnish.slice(0, 4)}
        </g>
      )}
    </svg>
  );
};

interface MealVisualPickerProps {
  value: string;
  onChange: (value: string) => void;
  timePhase: TimeOfDayPhase;
}

export const MealVisualPicker: React.FC<MealVisualPickerProps> = ({ value, onChange, timePhase }) => {
  const question = timePhase === 'morning'
    ? 'Frühstück auswählen'
    : timePhase === 'midday'
      ? 'Mittagessen auswählen'
      : 'Abendessen auswählen';
  const pages = React.useMemo(() => makePages(getOptionsForPhase(timePhase)), [timePhase]);

  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">{question}</legend>
      <p className="sr-only">Wische seitlich für weitere passende Bildseiten. Tippe ein Bild an, um es auszuwählen.</p>
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 no-scrollbar pb-1" aria-label={`${question}, ${pages.length} Seiten mit jeweils 12 Bildern`}>
        {pages.map((options, pageIndex) => (
          <div key={pageIndex} className="min-w-full snap-center grid grid-cols-3 gap-2" role="radiogroup" aria-label={`${question}, Seite ${pageIndex + 1} von ${pages.length}`}>
            {options.map((option) => {
              const selected = value === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={option.alt}
                  onClick={() => onChange(option.value)}
                  className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-1 transition-[border-color,box-shadow,transform] ${selected ? 'border-amber-600 ring-2 ring-amber-200 scale-[0.97]' : 'border-transparent hover:border-amber-300'}`}
                >
                  <FoodArtwork kind={option.kind} variant={option.variant} />
                  {selected && (
                    <span className="absolute inset-0 bg-amber-500/10 flex items-center justify-center" aria-hidden="true">
                      <span className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-sm"><Check className="w-5 h-5" /></span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-center gap-1.5" aria-hidden="true">
        {pages.map((_, index) => <span key={index} className="w-1.5 h-1.5 rounded-full bg-stone-300 first:w-5 first:bg-amber-500" />)}
      </div>
    </fieldset>
  );
};
