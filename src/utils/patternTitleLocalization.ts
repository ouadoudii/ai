import type { AppLanguage } from '../i18n';

export const patternTitles: Record<AppLanguage, Record<string, string>> = {
  de: {
    'sleep-energy': 'Dein Schlaf und deine Tagesenergie',
    'pace-energy': 'Esstempo und dein Gefühl danach',
    'lunch-rhythm': 'Mittagszeit und dein Tagesrhythmus',
    'late-lunch-snacking': 'Spätes Mittagessen und Snacks am Abend',
    'distraction-fullness': 'Aufmerksamkeit beim Essen und Sattheit',
    learning: 'Wir lernen dich kennen',
  },
  en: {
    'sleep-energy': 'Sleep ↔ energy',
    'pace-energy': 'Eating pace ↔ how you feel',
    'lunch-rhythm': 'Lunch ↔ daily rhythm',
    'late-lunch-snacking': 'Late lunch ↔ evening snacking',
    'distraction-fullness': 'Distraction ↔ fullness',
    learning: 'We’re getting to know you',
  },
  fr: {
    'sleep-energy': 'Ton sommeil et ton énergie',
    'pace-energy': 'Ton rythme alimentaire et ton ressenti',
    'lunch-rhythm': 'Le déjeuner et ton rythme quotidien',
    'late-lunch-snacking': 'Déjeuner tardif et grignotage le soir',
    'distraction-fullness': 'L’attention pendant le repas et la satiété',
    learning: 'Nous apprenons à te connaître',
  },
  ar: {
    'sleep-energy': 'نومك وطاقة يومك',
    'pace-energy': 'سرعة الأكل وشعورك بعده',
    'lunch-rhythm': 'موعد الغداء وإيقاع يومك',
    'late-lunch-snacking': 'الغداء المتأخر والوجبات الخفيفة مساءً',
    'distraction-fullness': 'التركيز أثناء الأكل والشبع',
    learning: 'نحن نتعرّف عليك',
  },
};
