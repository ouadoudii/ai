import type { AppLanguage } from '../i18n';
import type { NutritionArchetype } from '../types';

type OrientationCopy = {
  label: string;
  title: string;
  description: string;
  progress: string;
  confidence: string;
  dataBasis: string;
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

function confidenceLevel(dataPoints: number, targetDataPoints: number): 'none' | 'low' | 'medium' | 'high' {
  if (dataPoints <= 0) return 'none';
  const ratio = dataPoints / Math.max(1, targetDataPoints);
  if (ratio < 0.34) return 'low';
  if (ratio < 0.75) return 'medium';
  return 'high';
}

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
  const level = confidenceLevel(dataPoints, targetDataPoints);
  const confidenceLabels: Record<AppLanguage, Record<typeof level, string>> = {
    de: { none: 'Noch keine Sicherheit', low: 'Niedrige Sicherheit', medium: 'Mittlere Sicherheit', high: 'Höhere Sicherheit' },
    en: { none: 'No confidence yet', low: 'Low confidence', medium: 'Medium confidence', high: 'Higher confidence' },
    fr: { none: 'Pas encore de certitude', low: 'Faible certitude', medium: 'Certitude moyenne', high: 'Certitude plus élevée' },
    ar: { none: 'لا توجد ثقة بعد', low: 'ثقة منخفضة', medium: 'ثقة متوسطة', high: 'ثقة أعلى' },
  };
  const basis: Record<AppLanguage, string> = {
    de: dataPoints === 1 ? 'Basiert auf 1 echtem Eintrag' : `Basiert auf ${dataPoints} echten Einträgen`,
    en: dataPoints === 1 ? 'Based on 1 real entry' : `Based on ${dataPoints} real entries`,
    fr: dataPoints === 1 ? 'Basé sur 1 vraie entrée' : `Basé sur ${dataPoints} vraies entrées`,
    ar: `مبني على ${dataPoints} من إدخالاتك الحقيقية`,
  };
  if (dataPoints <= 0) {
    const empty: Record<AppLanguage, OrientationCopy> = {
      de: { label: 'Noch keine Einschätzung', title: 'Dein erster Moment genügt', description: 'Nach deinem ersten echten Eintrag zeigt Moment hier eine klar vorläufige persönliche Orientierung.', progress: `0/${targetDataPoints} Einträge`, confidence: confidenceLabels.de.none, dataBasis: 'Noch keine echten Einträge' },
      en: { label: 'No estimate yet', title: 'Your first moment is enough', description: 'After your first real entry, Moment will show a clearly preliminary personal orientation here.', progress: `0/${targetDataPoints} entries`, confidence: confidenceLabels.en.none, dataBasis: 'No real entries yet' },
      fr: { label: 'Pas encore d’estimation', title: 'Ton premier moment suffit', description: 'Après ta première vraie entrée, Moment affichera ici une orientation personnelle clairement provisoire.', progress: `0/${targetDataPoints} entrées`, confidence: confidenceLabels.fr.none, dataBasis: 'Pas encore de vraie entrée' },
      ar: { label: 'لا يوجد تقدير بعد', title: 'لحظتك الأولى تكفي', description: 'بعد أول إدخال حقيقي، سيعرض Moment هنا توجهاً شخصياً أولياً بوضوح.', progress: `0/${targetDataPoints} إدخال`, confidence: confidenceLabels.ar.none, dataBasis: 'لا توجد إدخالات حقيقية بعد' },
    };
    return empty[language];
  }

  const count = Math.min(dataPoints, targetDataPoints);
  const copy: Record<AppLanguage, OrientationCopy> = {
    de: { label: 'Vorläufige Orientierung', title: animal, description: `Auf Basis deiner bisherigen ${dataPoints} ${dataPoints === 1 ? 'Angabe' : 'Angaben'} passt dieses Muster im Moment am ehesten. Es kann sich mit jedem neuen Eintrag verändern.`, progress: `${count}/${targetDataPoints} Einträge bis zur stabileren Einschätzung`, confidence: confidenceLabels.de[level], dataBasis: basis.de },
    en: { label: 'Preliminary orientation', title: animal, description: `Based on your ${dataPoints} ${dataPoints === 1 ? 'entry' : 'entries'} so far, this is currently the closest pattern. It can change with every new entry.`, progress: `${count}/${targetDataPoints} entries toward a more stable estimate`, confidence: confidenceLabels.en[level], dataBasis: basis.en },
    fr: { label: 'Orientation provisoire', title: animal, description: `D’après tes ${dataPoints} ${dataPoints === 1 ? 'donnée' : 'données'} actuelles, ce profil est pour l’instant le plus proche. Il peut évoluer à chaque nouvelle entrée.`, progress: `${count}/${targetDataPoints} entrées vers une estimation plus stable`, confidence: confidenceLabels.fr[level], dataBasis: basis.fr },
    ar: { label: 'توجّه أولي', title: animal, description: `بناءً على ${dataPoints} من إدخالاتك حتى الآن، هذا هو النمط الأقرب حالياً. قد يتغير مع كل إدخال جديد.`, progress: `${count}/${targetDataPoints} إدخال للوصول إلى تقدير أكثر ثباتاً`, confidence: confidenceLabels.ar[level], dataBasis: basis.ar },
  };
  return copy[language];
}

export function getAnimalTypeNames(language: AppLanguage): string[] {
  return Object.values(animalNames[language]);
}
