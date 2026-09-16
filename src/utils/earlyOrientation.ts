import type { AppLanguage } from '../i18n';
import type { NutritionArchetype } from '../types';

type OrientationCopy = {
  label: string;
  title: string;
  description: string;
  progress: string;
};

type EarlyArchetype = Exclude<NutritionArchetype, 'stress_craver' | 'carb_sensitive'>;

const animalNames: Record<AppLanguage, Record<EarlyArchetype, string>> = {
  de: {
    intuitive_mindful: 'Fuchs · Gefühle & Essen',
    protein_performer: 'Löwe · Großer Hunger',
    circadian_rhythm: 'Bär · Tagesrhythmus',
    intermittent_balancer: 'Wolf · Kleine Happen',
  },
  en: {
    intuitive_mindful: 'Fox · Feelings & Food',
    protein_performer: 'Lion · Big Hunger',
    circadian_rhythm: 'Bear · Daily Rhythm',
    intermittent_balancer: 'Wolf · Little Bites',
  },
  fr: {
    intuitive_mindful: 'Renard · Émotions & alimentation',
    protein_performer: 'Lion · Grande faim',
    circadian_rhythm: 'Ours · Rythme quotidien',
    intermittent_balancer: 'Loup · Petites portions',
  },
  ar: {
    intuitive_mindful: 'الثعلب · المشاعر والطعام',
    protein_performer: 'الأسد · الجوع الكبير',
    circadian_rhythm: 'الدب · إيقاع يومك',
    intermittent_balancer: 'الذئب · اللقمات الصغيرة',
  },
};

export function buildEarlyOrientationCopy(
  language: AppLanguage,
  archetype: NutritionArchetype,
  dataPoints: number,
  targetDataPoints = 12,
): OrientationCopy {
  const displayArchetype: EarlyArchetype = archetype === 'stress_craver'
    ? 'intuitive_mindful'
    : archetype === 'carb_sensitive'
      ? 'intermittent_balancer'
      : archetype;
  const animal = animalNames[language][displayArchetype];
  if (dataPoints <= 0) {
    const empty: Record<AppLanguage, OrientationCopy> = {
      de: { label: 'Noch keine Einschätzung', title: 'Dein erster Moment genügt', description: 'Nach deinem ersten echten Eintrag zeigt Moment hier eine klar vorläufige persönliche Orientierung.', progress: `0/${targetDataPoints} Einträge` },
      en: { label: 'No estimate yet', title: 'Your first moment is enough', description: 'After your first real entry, Moment will show a clearly preliminary personal orientation here.', progress: `0/${targetDataPoints} entries` },
      fr: { label: 'Pas encore d’estimation', title: 'Ton premier moment suffit', description: 'Après ta première vraie entrée, Moment affichera ici une orientation personnelle clairement provisoire.', progress: `0/${targetDataPoints} entrées` },
      ar: { label: 'لا يوجد تقدير بعد', title: 'لحظتك الأولى تكفي', description: 'بعد أول إدخال حقيقي، سيعرض Moment هنا توجهاً شخصياً أولياً بوضوح.', progress: `0/${targetDataPoints} إدخال` },
    };
    return empty[language];
  }

  const count = Math.min(dataPoints, targetDataPoints);
  const copy: Record<AppLanguage, OrientationCopy> = {
    de: { label: 'Vorläufige Orientierung', title: animal, description: `Auf Basis deiner bisherigen ${dataPoints} ${dataPoints === 1 ? 'Angabe' : 'Angaben'} passt dieses Muster im Moment am ehesten. Es kann sich mit jedem neuen Eintrag verändern.`, progress: `${count}/${targetDataPoints} Einträge bis zur stabileren Einschätzung` },
    en: { label: 'Preliminary orientation', title: animal, description: `Based on your ${dataPoints} ${dataPoints === 1 ? 'entry' : 'entries'} so far, this is currently the closest pattern. It can change with every new entry.`, progress: `${count}/${targetDataPoints} entries toward a more stable estimate` },
    fr: { label: 'Orientation provisoire', title: animal, description: `D’après tes ${dataPoints} ${dataPoints === 1 ? 'donnée' : 'données'} actuelles, ce profil est pour l’instant le plus proche. Il peut évoluer à chaque nouvelle entrée.`, progress: `${count}/${targetDataPoints} entrées vers une estimation plus stable` },
    ar: { label: 'توجّه أولي', title: animal, description: `بناءً على ${dataPoints} من إدخالاتك حتى الآن، هذا هو النمط الأقرب حالياً. قد يتغير مع كل إدخال جديد.`, progress: `${count}/${targetDataPoints} إدخال للوصول إلى تقدير أكثر ثباتاً` },
  };
  return copy[language];
}

export function getAnimalTypeNames(language: AppLanguage): string[] {
  return Object.values(animalNames[language]);
}
