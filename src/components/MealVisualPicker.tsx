import React from 'react';
import { Check } from 'lucide-react';
import { TimeOfDayPhase } from '../types';

interface MealOption {
  value: string;
  imageUrl: string;
  alt: string;
}

const foodImages = [
  ['Porridge mit Obst', 'photo-1517673400267-0251440c45dc', 'Porridge mit Obst und Beeren'],
  ['Avocado-Brot', 'photo-1525351484163-7529414344d8', 'Avocado-Brot mit Ei'],
  ['Joghurt mit Beeren', 'photo-1488477181946-6428a0291777', 'Joghurt mit Beeren'],
  ['Herzhaftes Frühstück', 'photo-1533089860892-a7c6f0a88666', 'Herzhaftes Frühstück'],
  ['Smoothie', 'photo-1505252585461-04db1eb84625', 'Grüner Smoothie'],
  ['Kaffee oder Tee', 'photo-1495474472287-4d71bcdd2085', 'Kaffee oder Tee'],
  ['Salat und Gemüse', 'photo-1540420773420-3366772f4999', 'Bunter Salat mit Gemüse'],
  ['Bowl mit Reis', 'photo-1547592180-85f173990554', 'Bowl mit Reis und Gemüse'],
  ['Pasta', 'photo-1551183053-bf91a1d81141', 'Pasta auf einem Teller'],
  ['Fleisch mit Beilage', 'photo-1544025162-d76694265947', 'Fleisch mit Gemüse und Beilage'],
  ['Suppe oder Eintopf', 'photo-1547592166-23ac45744acd', 'Suppe oder Eintopf'],
  ['Süßer Snack', 'photo-1486427944299-d1955d23e34d', 'Süßes Gebäck'],
  ['Gemüsegericht', 'photo-1512621776951-a57141f2eefd', 'Gemüsegericht'],
  ['Früchte', 'photo-1610832958506-aa56368176cf', 'Frische Früchte'],
  ['Pfannkuchen', 'photo-1528207776546-365bb710ee93', 'Pfannkuchen'],
  ['Eier', 'photo-1522708323590-d24dbb6b0267', 'Eiergericht'],
  ['Brot', 'photo-1509440159596-0249088772ff', 'Frisches Brot'],
  ['Nüsse', 'photo-1599599810769-bcde5a160d32', 'Gemischte Nüsse'],
  ['Beeren', 'photo-1490474418585-ba9bad8fd0ea', 'Frische Beeren'],
  ['Reisgericht', 'photo-1512058564366-18510be2db19', 'Reisgericht'],
  ['Pizza', 'photo-1579751626657-72bc17010498', 'Pizza'],
  ['Sandwich', 'photo-1553909489-cd47e0907980', 'Sandwich'],
  ['Hummus', 'photo-1577805947697-89e18249d767', 'Hummus'],
  ['Müsli', 'photo-1517093157656-b9eccef91cb1', 'Müsli'],
  ['Obstschale', 'photo-1490818387583-1baba5e638af', 'Obstschale'],
  ['Gemüsesuppe', 'photo-1476718406336-bb5a9690ee2a', 'Gemüsesuppe'],
  ['Dessert', 'photo-1551024506-0bccd828d307', 'Dessert'],
] as const;

const positions = ['center', '50% 35%', '50% 65%', '35% 50%', '65% 50%', '45% 45%'];

const makeOptions = (page: number): MealOption[] =>
  Array.from({ length: 81 }, (_, index) => {
    const sourceIndex = (index + page * 11) % foodImages.length;
    const [name, photoId, alt] = foodImages[sourceIndex];
    const cropSeed = index + page * 81;
    const position = positions[cropSeed % positions.length];
    return {
      value: `${name} · Auswahl ${cropSeed + 1}`,
      imageUrl: `https://images.unsplash.com/${photoId}?w=240&h=240&auto=format&fit=crop&q=78&ixid=cary-${page}-${index}`,
      alt: `${alt}, Bildauswahl ${cropSeed + 1}`,
      position,
    } as MealOption & { position: string };
  });

const pages = [makeOptions(0), makeOptions(1)];

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

  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">{question}</legend>
      <p className="sr-only">Wische seitlich für die zweite Bildseite. Tippe ein Bild an, um es auszuwählen.</p>

      <div
        className="flex overflow-x-auto snap-x snap-mandatory gap-3 no-scrollbar pb-1"
        aria-label={`${question}, zwei Seiten mit jeweils 81 Bildern`}
      >
        {pages.map((options, pageIndex) => (
          <div
            key={pageIndex}
            className="min-w-full snap-center grid grid-cols-9 gap-1 sm:gap-1.5"
            role="radiogroup"
            aria-label={`${question}, Seite ${pageIndex + 1} von 2`}
          >
            {options.map((option) => {
              const selected = value === option.value;
              const imagePosition = (option as MealOption & { position?: string }).position || 'center';
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={option.alt}
                  onClick={() => onChange(option.value)}
                  className={`relative aspect-square overflow-hidden rounded-md sm:rounded-lg border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-1 transition-[border-color,box-shadow,transform] ${
                    selected
                      ? 'border-amber-600 ring-2 ring-amber-200 scale-[0.96]'
                      : 'border-transparent hover:border-amber-300'
                  }`}
                >
                  <img
                    src={option.imageUrl}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ objectPosition: imagePosition }}
                  />
                  {selected && (
                    <span
                      className="absolute inset-0 bg-amber-500/15 flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-sm">
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
        <span className="w-5 h-1.5 rounded-full bg-amber-500" />
        <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
      </div>
    </fieldset>
  );
};
