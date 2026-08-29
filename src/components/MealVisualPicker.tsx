import React from 'react';
import { Check } from 'lucide-react';
import { TimeOfDayPhase } from '../types';

interface MealOption {
  value: string;
  alt: string;
}

const breakfastNames = [
  'Porridge mit Beeren','Avocado-Toast','Rührei','Joghurt mit Früchten','Chia-Pudding mit Beeren','Pancakes mit Obst',
  'Smoothie Bowl','Bananen-Toast','Ei mit Avocado-Toast','Beeren-Smoothie','Croissant mit Beeren','Obstschale',
  'Porridge Variante','Avocado-Toast Variante','Rührei Variante','Joghurt-Bowl Variante','Chia-Bowl Variante','Pancakes Variante',
  'Smoothie Bowl Variante','Bananen-Toast Variante','Ei-Toast Variante','Smoothie Variante','Croissant Variante','Obstschale Variante',
] as const;

const lunchNames = [
  'Hähnchen mit Reis','Pasta mit Tomate','Mediterraner Salat','Lachs mit Spargel','Buddha Bowl','Gemüse-Wrap',
  'Curry mit Reis','Burger mit Pommes','Spaghetti mit Fleischbällchen','Gemüsesuppe','Couscous-Salat','Sandwich',
  'Hähnchen-Reis Variante','Pasta Variante','Salat Variante','Lachs Variante','Bowl Variante','Wrap Variante',
  'Curry Variante','Burger Variante','Spaghetti Variante','Suppe Variante','Couscous Variante','Sandwich Variante',
] as const;

const dinnerNames = [
  'Lachs mit Spargel','Steak mit Kartoffeln','Rind mit Gemüse','Pasta mit Garnelen','Gemüsepfanne','Pilz-Pasta',
  'Lasagne','Tomatensuppe','Gefüllte Paprika','Ofenhähnchen','Curry mit Reis','Zucchini-Pasta',
  'Lachs-Abendessen Variante','Steak Variante','Rind-Gemüse Variante','Garnelen-Pasta Variante','Gemüsepfanne Variante','Pilz-Pasta Variante',
  'Lasagne Variante','Tomatensuppe Variante','Paprika Variante','Ofenhähnchen Variante','Curry Variante','Zucchini-Pasta Variante',
] as const;

const ITEMS_PER_PAGE = 12;
const SPRITE_COLUMNS = 6;
const SPRITE_ROWS = 12;
const SPRITE = '/generated-food/cary-food-hd.webp';

const getConfig = (timePhase: TimeOfDayPhase) => {
  if (timePhase === 'morning') {
    return { names: breakfastNames, rowOffset: 0, question: 'Frühstück auswählen' };
  }
  if (timePhase === 'midday') {
    return { names: lunchNames, rowOffset: 4, question: 'Mittagessen auswählen' };
  }
  return { names: dinnerNames, rowOffset: 8, question: 'Abendessen auswählen' };
};

const makePages = (names: readonly string[]): MealOption[][] => {
  const options = names.map((name) => ({ value: name, alt: name }));
  return Array.from({ length: Math.ceil(options.length / ITEMS_PER_PAGE) }, (_, pageIndex) =>
    options.slice(pageIndex * ITEMS_PER_PAGE, (pageIndex + 1) * ITEMS_PER_PAGE)
  );
};

const PhotoTile: React.FC<{ index: number; rowOffset: number; alt: string }> = ({ index, rowOffset, alt }) => {
  const col = index % SPRITE_COLUMNS;
  const row = rowOffset + Math.floor(index / SPRITE_COLUMNS);
  const x = (col / (SPRITE_COLUMNS - 1)) * 100;
  const y = (row / (SPRITE_ROWS - 1)) * 100;

  return (
    <span
      role="img"
      aria-label={alt}
      className="absolute inset-0 bg-no-repeat bg-stone-100"
      style={{
        backgroundImage: `url(${SPRITE})`,
        backgroundSize: `${SPRITE_COLUMNS * 100}% ${SPRITE_ROWS * 100}%`,
        backgroundPosition: `${x}% ${y}%`,
      }}
    />
  );
};

interface MealVisualPickerProps {
  value: string;
  onChange: (value: string) => void;
  timePhase: TimeOfDayPhase;
}

export const MealVisualPicker: React.FC<MealVisualPickerProps> = ({ value, onChange, timePhase }) => {
  const { names, rowOffset, question } = getConfig(timePhase);
  const pages = React.useMemo(() => makePages(names), [names]);
  const [activePage, setActivePage] = React.useState(0);
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setActivePage(0);
    const image = new Image();
    image.src = SPRITE;
  }, [timePhase]);

  const handleScroll = () => {
    const node = scrollerRef.current;
    if (!node || !node.clientWidth) return;
    setActivePage(Math.max(0, Math.min(pages.length - 1, Math.round(node.scrollLeft / node.clientWidth))));
  };

  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">{question}</legend>
      <p className="sr-only">Wische seitlich für weitere realistische Bildseiten. Tippe ein Bild an, um es auszuwählen.</p>

      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory gap-3 no-scrollbar pb-1"
        aria-label={`${question}, ${pages.length} Seiten mit jeweils 12 Bildern`}
      >
        {pages.map((options, pageIndex) => (
          <div
            key={`${timePhase}-${pageIndex}`}
            className="min-w-full snap-center grid grid-cols-3 gap-2"
            role="radiogroup"
            aria-label={`${question}, Seite ${pageIndex + 1} von ${pages.length}`}
          >
            {options.map((option, optionIndex) => {
              const globalIndex = pageIndex * ITEMS_PER_PAGE + optionIndex;
              const selected = value === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={option.alt}
                  onClick={() => onChange(option.value)}
                  className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-1 transition-[border-color,box-shadow,transform] ${
                    selected ? 'border-amber-600 ring-2 ring-amber-200 scale-[0.97]' : 'border-transparent hover:border-amber-300'
                  }`}
                >
                  <PhotoTile index={globalIndex} rowOffset={rowOffset} alt={option.alt} />
                  {selected && (
                    <span className="absolute inset-0 bg-amber-500/15 flex items-center justify-center" aria-hidden="true">
                      <span className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-md">
                        <Check className="w-5 h-5" />
                      </span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-2 flex justify-center gap-1.5" aria-hidden="true">
        {pages.map((_, index) => (
          <span
            key={index}
            className={`h-1.5 rounded-full transition-all ${index === activePage ? 'w-5 bg-amber-500' : 'w-1.5 bg-stone-300'}`}
          />
        ))}
      </div>
    </fieldset>
  );
};
