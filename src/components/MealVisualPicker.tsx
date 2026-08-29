import React from 'react';
import { Check } from 'lucide-react';
import { TimeOfDayPhase } from '../types';

interface MealOption {
  value: string;
  imageUrl: string;
  alt: string;
  position: string;
}

type FoodImage = readonly [string, string, string];

const breakfastImages: FoodImage[] = [
  ['Porridge mit Obst', 'photo-1517673400267-0251440c45dc', 'Porridge mit Obst und Beeren'],
  ['Avocado-Brot', 'photo-1525351484163-7529414344d8', 'Avocado-Brot mit Ei'],
  ['Joghurt mit Beeren', 'photo-1488477181946-6428a0291777', 'Joghurt mit Beeren'],
  ['Herzhaftes Frühstück', 'photo-1533089860892-a7c6f0a88666', 'Herzhaftes Frühstück'],
  ['Smoothie', 'photo-1505252585461-04db1eb84625', 'Grüner Smoothie'],
  ['Nur Kaffee oder Tee', 'photo-1495474472287-4d71bcdd2085', 'Kaffee oder Tee ohne Essen'],
  ['Pfannkuchen', 'photo-1528207776546-365bb710ee93', 'Pfannkuchen zum Frühstück'],
  ['Eier', 'photo-1522708323590-d24dbb6b0267', 'Eiergericht zum Frühstück'],
  ['Brot', 'photo-1509440159596-0249088772ff', 'Frisches Brot zum Frühstück'],
  ['Müsli', 'photo-1517093157656-b9eccef91cb1', 'Müsli zum Frühstück'],
  ['Obstschale', 'photo-1490818387583-1baba5e638af', 'Obstschale zum Frühstück'],
  ['Beeren', 'photo-1490474418585-ba9bad8fd0ea', 'Frische Beeren zum Frühstück'],
  ['Früchte', 'photo-1610832958506-aa56368176cf', 'Frisches Obst zum Frühstück'],
  ['Nüsse', 'photo-1599599810769-bcde5a160d32', 'Nüsse zum Frühstück'],
  ['Hummus mit Brot', 'photo-1577805947697-89e18249d767', 'Hummus mit Brot zum Frühstück'],
  ['Frühstücks-Sandwich', 'photo-1553909489-cd47e0907980', 'Sandwich zum Frühstück'],
  ['Süßes Frühstück', 'photo-1486427944299-d1955d23e34d', 'Süßes Gebäck zum Frühstück'],
  ['Leichtes Frühstück', 'photo-1540420773420-3366772f4999', 'Leichtes Frühstück mit frischen Zutaten'],
];

const lunchImages: FoodImage[] = [
  ['Salat und Gemüse', 'photo-1540420773420-3366772f4999', 'Bunter Salat mit Gemüse'],
  ['Bowl mit Reis', 'photo-1547592180-85f173990554', 'Bowl mit Reis und Gemüse'],
  ['Pasta', 'photo-1551183053-bf91a1d81141', 'Pasta als Mittagessen'],
  ['Fleisch mit Beilage', 'photo-1544025162-d76694265947', 'Fleisch mit Gemüse und Beilage'],
  ['Suppe oder Eintopf', 'photo-1547592166-23ac45744acd', 'Suppe oder Eintopf'],
  ['Gemüsegericht', 'photo-1512621776951-a57141f2eefd', 'Warm zubereitetes Gemüsegericht'],
  ['Reisgericht', 'photo-1512058564366-18510be2db19', 'Reisgericht als Mittagessen'],
  ['Pizza', 'photo-1579751626657-72bc17010498', 'Pizza als Mittagessen'],
  ['Sandwich', 'photo-1553909489-cd47e0907980', 'Belegtes Sandwich zum Mittagessen'],
  ['Hummus', 'photo-1577805947697-89e18249d767', 'Hummus mit Beilagen'],
  ['Gemüsesuppe', 'photo-1476718406336-bb5a9690ee2a', 'Gemüsesuppe zum Mittagessen'],
  ['Dessert', 'photo-1551024506-0bccd828d307', 'Dessert oder süßer Abschluss'],
  ['Brotzeit', 'photo-1509440159596-0249088772ff', 'Brotzeit als leichte Mahlzeit'],
  ['Obst', 'photo-1610832958506-aa56368176cf', 'Frisches Obst als leichte Mahlzeit'],
  ['Nüsse und Kleinigkeiten', 'photo-1599599810769-bcde5a160d32', 'Nüsse und kleine Snacks'],
  ['Eiergericht', 'photo-1522708323590-d24dbb6b0267', 'Herzhaftes Eiergericht'],
  ['Salat-Bowl', 'photo-1547592180-85f173990554', 'Große Bowl mit Gemüse'],
  ['Warme Mahlzeit', 'photo-1544025162-d76694265947', 'Warm serviertes Hauptgericht'],
];

const dinnerImages: FoodImage[] = [
  ['Fleisch mit Beilage', 'photo-1544025162-d76694265947', 'Abendessen mit Fleisch, Gemüse und Beilage'],
  ['Suppe oder Eintopf', 'photo-1547592166-23ac45744acd', 'Suppe oder Eintopf zum Abendessen'],
  ['Pasta', 'photo-1551183053-bf91a1d81141', 'Pasta zum Abendessen'],
  ['Gemüsegericht', 'photo-1512621776951-a57141f2eefd', 'Gemüsegericht zum Abendessen'],
  ['Reisgericht', 'photo-1512058564366-18510be2db19', 'Reisgericht zum Abendessen'],
  ['Pizza', 'photo-1579751626657-72bc17010498', 'Pizza zum Abendessen'],
  ['Salat', 'photo-1540420773420-3366772f4999', 'Salat als Abendessen'],
  ['Bowl', 'photo-1547592180-85f173990554', 'Bowl mit Reis und Gemüse zum Abendessen'],
  ['Hummus und Beilagen', 'photo-1577805947697-89e18249d767', 'Hummus und Beilagen zum Abendessen'],
  ['Sandwich', 'photo-1553909489-cd47e0907980', 'Sandwich als leichtes Abendessen'],
  ['Gemüsesuppe', 'photo-1476718406336-bb5a9690ee2a', 'Gemüsesuppe zum Abendessen'],
  ['Dessert', 'photo-1551024506-0bccd828d307', 'Dessert nach dem Abendessen'],
  ['Brotzeit', 'photo-1509440159596-0249088772ff', 'Brotzeit am Abend'],
  ['Eiergericht', 'photo-1522708323590-d24dbb6b0267', 'Herzhaftes Eiergericht am Abend'],
  ['Leichte Gemüsemahlzeit', 'photo-1540420773420-3366772f4999', 'Leichte Gemüsemahlzeit am Abend'],
  ['Warme Bowl', 'photo-1547592180-85f173990554', 'Warme Bowl zum Abendessen'],
  ['Herzhaftes Hauptgericht', 'photo-1544025162-d76694265947', 'Herzhaftes Hauptgericht am Abend'],
  ['Kleine Süßigkeit', 'photo-1486427944299-d1955d23e34d', 'Kleine Süßigkeit am Abend'],
];

const positions = ['center', '50% 35%', '50% 65%', '35% 50%', '65% 50%', '45% 45%'];
const ITEMS_PER_PAGE = 12;

const getImagesForPhase = (timePhase: TimeOfDayPhase): FoodImage[] => {
  if (timePhase === 'morning') return breakfastImages;
  if (timePhase === 'midday') return lunchImages;
  return dinnerImages;
};

const makePages = (images: FoodImage[], phase: TimeOfDayPhase): MealOption[][] => {
  const pageCount = Math.ceil(images.length / ITEMS_PER_PAGE);
  return Array.from({ length: pageCount }, (_, pageIndex) =>
    images.slice(pageIndex * ITEMS_PER_PAGE, (pageIndex + 1) * ITEMS_PER_PAGE).map(([name, photoId, alt], index) => ({
      value: name,
      imageUrl: `https://images.unsplash.com/${photoId}?w=520&h=520&auto=format&fit=crop&q=84&ixid=cary-${phase}-${pageIndex}-${index}`,
      alt,
      position: positions[(pageIndex * ITEMS_PER_PAGE + index) % positions.length],
    }))
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
  const pages = React.useMemo(() => makePages(getImagesForPhase(timePhase), timePhase), [timePhase]);

  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">{question}</legend>
      <p className="sr-only">Wische seitlich für weitere passende Bildseiten. Tippe ein Bild an, um es auszuwählen.</p>

      <div
        className="flex overflow-x-auto snap-x snap-mandatory gap-3 no-scrollbar pb-1"
        aria-label={`${question}, ${pages.length} Seiten mit bis zu 12 Bildern`}
      >
        {pages.map((options, pageIndex) => (
          <div
            key={pageIndex}
            className="min-w-full snap-center grid grid-cols-3 gap-2"
            role="radiogroup"
            aria-label={`${question}, Seite ${pageIndex + 1} von ${pages.length}`}
          >
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
                  className={`relative aspect-square overflow-hidden rounded-xl border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-1 transition-[border-color,box-shadow,transform] ${
                    selected
                      ? 'border-amber-600 ring-2 ring-amber-200 scale-[0.97]'
                      : 'border-transparent hover:border-amber-300'
                  }`}
                >
                  <img
                    src={option.imageUrl}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ objectPosition: option.position }}
                  />
                  {selected && (
                    <span className="absolute inset-0 bg-amber-500/15 flex items-center justify-center" aria-hidden="true">
                      <span className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-sm">
                        <Check className="w-4 h-4" />
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
          <span key={index} className="w-1.5 h-1.5 rounded-full bg-stone-300 first:w-5 first:bg-amber-500" />
        ))}
      </div>
    </fieldset>
  );
};
