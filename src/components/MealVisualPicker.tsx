import React from 'react';
import { Check } from 'lucide-react';
import { TimeOfDayPhase } from '../types';

interface MealOption {
  value: string;
  alt: string;
}

const breakfastNames = [
  'Porridge mit Beeren','Avocado-Toast','Rührei mit Tomaten','Joghurt mit Früchten','Chia-Pudding','Grüner Smoothie',
  'Pancakes mit Obst','French Toast','Smoothie Bowl','Omelett mit Gemüse','Gekochte Eier mit Brot','Frühstücks-Bagel',
  'Overnight Oats','Granola mit Joghurt','Tomaten-Mozzarella-Toast','Obstsalat','Orangensaft','Milchkaffee',
  'Mango-Chia-Bowl','Rührei mit Avocado','Frühstücks-Crêpes','Joghurt mit Heidelbeeren','Bananen-Erdnuss-Toast','Lachs-Toast',
  'Sesam-Bagel','Croissant','Schokocroissant','Müsli mit Früchten','Cappuccino','Tee','Wasser mit Zitrone','Milch',
  'Kakao','Frühstücks-Waffeln','Quark mit Nüssen','Nur Kaffee oder Tee',
] as const;

const lunchNames = [
  'Mediterraner Salat','Reis-Gemüse-Bowl','Pasta mit Tomatensauce','Hähnchen mit Gemüse','Gemüsesuppe','Couscous-Bowl',
  'Lachs mit Salat','Wrap mit Gemüse','Falafel mit Hummus','Pizza Margherita','Kartoffel-Gemüse-Teller','Linseneintopf',
  'Quinoa-Salat','Nudel-Bowl','Reis mit Curry','Fisch mit Reis','Burger mit Salat','Gemüse-Wrap',
  'Buddha Bowl','Tomatensuppe','Sushi-Teller','Ofengemüse','Pasta mit Gemüse','Kichererbsen-Curry',
  'Caesar-Salat','Hähnchen-Reis-Teller','Gemüse-Pizza','Bohneneintopf','Pita mit Hummus','Lachs-Bowl',
  'Gnocchi mit Gemüse','Reis mit Bohnen','Gemüse-Lasagne','Protein-Bowl','Leichter Lunch-Teller','Obst-Dessert',
] as const;

const dinnerNames = [
  'Gegrilltes Hähnchen mit Gemüse','Lachs mit Spargel','Steak mit Kartoffeln','Spaghetti am Abend','Gemüse-Lasagne','Gefüllte Paprika',
  'Warme Gemüse-Bowl','Risotto','Nudeln mit Gemüse','Hackbällchen mit Beilage','Zucchini-Nudeln','Pilzpfanne',
  'Kürbissuppe','Pilzsuppe','Gemüseeintopf','Großer Abendsalat','Hähnchensalat','Griechischer Salat',
  'Ofenhähnchen','Rinderschmortopf','Ofengemüse mit Fisch','Kichererbsen-Bowl','Gemüse-Curry','Lachs mit Kartoffeln',
  'Pasta mit Pilzen','Reis-Gemüse-Pfanne','Leichte Suppe','Abendbrot mit Gemüse','Hummus-Teller','Vegetarischer Wrap',
  'Pizza mit Gemüse','Warmer Salat','Kleine Bowl','Herzhafter Teller','Leichtes Abendessen','Kleines Dessert',
] as const;

const ITEMS_PER_PAGE = 12;
const SPRITE_COLUMNS = 6;
const SPRITE_ROWS = 6;

const getConfig = (timePhase: TimeOfDayPhase) => {
  if (timePhase === 'morning') {
    return { names: breakfastNames, sprite: '/generated-food/breakfast.webp', question: 'Frühstück auswählen' };
  }
  if (timePhase === 'midday') {
    return { names: lunchNames, sprite: '/generated-food/lunch.webp', question: 'Mittagessen auswählen' };
  }
  return { names: dinnerNames, sprite: '/generated-food/dinner.webp', question: 'Abendessen auswählen' };
};

const makePages = (names: readonly string[]): MealOption[][] => {
  const options = names.map((name) => ({ value: name, alt: name }));
  return Array.from({ length: Math.ceil(options.length / ITEMS_PER_PAGE) }, (_, pageIndex) =>
    options.slice(pageIndex * ITEMS_PER_PAGE, (pageIndex + 1) * ITEMS_PER_PAGE)
  );
};

const PhotoTile: React.FC<{ sprite: string; index: number; alt: string }> = ({ sprite, index, alt }) => {
  const col = index % SPRITE_COLUMNS;
  const row = Math.floor(index / SPRITE_COLUMNS) % SPRITE_ROWS;
  const x = (col / (SPRITE_COLUMNS - 1)) * 100;
  const y = (row / (SPRITE_ROWS - 1)) * 100;

  return (
    <span
      role="img"
      aria-label={alt}
      className="absolute inset-0 bg-no-repeat"
      style={{
        backgroundImage: `url(${sprite})`,
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
  const { names, sprite, question } = getConfig(timePhase);
  const pages = React.useMemo(() => makePages(names), [names]);
  const [activePage, setActivePage] = React.useState(0);
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => setActivePage(0), [timePhase]);

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
        aria-label={`${question}, ${pages.length} Seiten mit jeweils bis zu 12 Bildern`}
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
                  <PhotoTile sprite={sprite} index={globalIndex} alt={option.alt} />
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
