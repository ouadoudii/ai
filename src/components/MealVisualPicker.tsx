import React from 'react';
import { Check } from 'lucide-react';
import { TimeOfDayPhase } from '../types';

interface MealOption {
  value: string;
  label: string;
  imageUrl: string;
  alt: string;
}

const breakfastOptions: MealOption[] = [
  {
    value: 'Porridge mit Obst',
    label: 'Porridge & Obst',
    imageUrl: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=700&h=420&auto=format&fit=crop&q=85',
    alt: 'Schale mit Porridge, Obst und Beeren',
  },
  {
    value: 'Brot mit Ei',
    label: 'Brot & Ei',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=700&h=420&auto=format&fit=crop&q=85',
    alt: 'Frühstück mit Brot und Ei',
  },
  {
    value: 'Joghurt mit Beeren',
    label: 'Joghurt & Beeren',
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=700&h=420&auto=format&fit=crop&q=85',
    alt: 'Joghurt mit Beeren und Früchten',
  },
  {
    value: 'Herzhaftes Frühstück',
    label: 'Herzhaft',
    imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=700&h=420&auto=format&fit=crop&q=85',
    alt: 'Herzhaftes Frühstück auf einem Teller',
  },
  {
    value: 'Smoothie oder leichtes Frühstück',
    label: 'Leicht',
    imageUrl: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=700&h=420&auto=format&fit=crop&q=85',
    alt: 'Fruchtiger Smoothie als leichtes Frühstück',
  },
  {
    value: 'Nur Wasser, Kaffee oder Tee',
    label: 'Nur Getränk',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=700&h=420&auto=format&fit=crop&q=85',
    alt: 'Kaffee und Wasser als Symbol für nur ein Getränk zum Frühstück',
  },
];

const mainMealOptions: MealOption[] = [
  {
    value: 'Salat und Gemüse',
    label: 'Salat & Gemüse',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&h=420&auto=format&fit=crop&q=85',
    alt: 'Bunter Salat mit viel Gemüse',
  },
  {
    value: 'Bowl mit Reis oder Getreide',
    label: 'Bowl & Reis',
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=700&h=420&auto=format&fit=crop&q=85',
    alt: 'Bowl mit Reis, Gemüse und weiteren Zutaten',
  },
  {
    value: 'Pasta oder Nudeln',
    label: 'Pasta',
    imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=700&h=420&auto=format&fit=crop&q=85',
    alt: 'Teller mit Pasta',
  },
  {
    value: 'Fisch oder Fleisch mit Beilage',
    label: 'Protein & Beilage',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=700&h=420&auto=format&fit=crop&q=85',
    alt: 'Tellergericht mit Fleisch, Gemüse und Beilage',
  },
  {
    value: 'Suppe oder Eintopf',
    label: 'Suppe & Eintopf',
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=700&h=420&auto=format&fit=crop&q=85',
    alt: 'Schale mit Suppe oder Eintopf',
  },
  {
    value: 'Snack oder süße Mahlzeit',
    label: 'Snack & Süßes',
    imageUrl: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=700&h=420&auto=format&fit=crop&q=85',
    alt: 'Kleiner Snack und süßes Gebäck',
  },
];

interface MealVisualPickerProps {
  value: string;
  onChange: (value: string) => void;
  timePhase: TimeOfDayPhase;
}

export const MealVisualPicker: React.FC<MealVisualPickerProps> = ({ value, onChange, timePhase }) => {
  const options = timePhase === 'morning' ? breakfastOptions : mainMealOptions;
  const question = timePhase === 'morning'
    ? 'Was passt am besten zu deinem Frühstück?'
    : timePhase === 'midday'
      ? 'Was passt am besten zu deinem Mittagessen?'
      : 'Was passt am besten zu deinem Abendessen?';

  return (
    <fieldset className="space-y-2.5">
      <legend className="text-xs font-bold text-stone-700">{question}</legend>
      <p className="text-[11px] text-stone-500">Tippe einfach auf das Bild, das deiner Mahlzeit am nächsten kommt.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5" role="radiogroup" aria-label={question}>
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={option.label}
              onClick={() => onChange(option.value)}
              className={`relative overflow-hidden rounded-2xl border-2 text-left min-h-[116px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2 transition-all ${
                selected
                  ? 'border-amber-600 ring-2 ring-amber-200 bg-amber-50'
                  : 'border-stone-200 bg-white hover:border-amber-300'
              }`}
            >
              <img
                src={option.imageUrl}
                alt={option.alt}
                loading="lazy"
                className="w-full h-20 object-cover"
              />
              <span className="flex items-center justify-between gap-1 px-2.5 py-2 text-[11px] font-semibold text-stone-800 leading-tight">
                <span>{option.label}</span>
                {selected && (
                  <span className="w-5 h-5 shrink-0 rounded-full bg-amber-600 text-white flex items-center justify-center" aria-hidden="true">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
};
