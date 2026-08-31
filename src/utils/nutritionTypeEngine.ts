import { FoodMoment, DailyCheckIn, NutritionTypeProfile, NutritionArchetype } from '../types';

/**
 * Cary nutrition-pattern engine.
 * A type is deliberately not unlocked from a handful of entries on one day:
 * we require repeated observations across several calendar days.
 */
export function analyzeNutritionType(
  moments: FoodMoment[],
  checkIns: DailyCheckIn[] = []
): NutritionTypeProfile {
  const totalDataPoints = moments.length + checkIns.length;
  const uniqueDays = new Set([
    ...moments.map((m) => m.date).filter(Boolean),
    ...checkIns.map((c) => c.date).filter(Boolean),
  ]).size;
  const targetDataPoints = 12;
  const targetDays = 5;
  const pointProgress = Math.min(1, totalDataPoints / targetDataPoints);
  const dayProgress = Math.min(1, uniqueDays / targetDays);
  const confidenceScore = Math.round((pointProgress * 0.45 + dayProgress * 0.55) * 100);
  const isUnlocked = totalDataPoints >= targetDataPoints && uniqueDays >= targetDays;

  let proteinHeavyCount = 0;
  let mindfulSlowCount = 0;
  let screenDistractedCount = 0;
  let lateDinnerCount = 0;
  let breakfastCount = 0;
  let overfullCount = 0;

  moments.forEach((m) => {
    if (m.nutrition?.protein && m.nutrition.protein >= 25) proteinHeavyCount++;
    if (m.eatingPace === 'slow' && (!m.distraction || m.distraction === 'mindful')) mindfulSlowCount++;
    if (m.distraction === 'screen' || m.distraction === 'work') screenDistractedCount++;
    if (m.fullnessLevel && m.fullnessLevel >= 5) overfullCount++;
    const hour = parseInt(m.time.split(':')[0] || '12', 10);
    if (m.category === 'dinner' && hour >= 20) lateDinnerCount++;
    if (m.category === 'breakfast' || (hour >= 6 && hour <= 10)) breakfastCount++;
  });

  checkIns.forEach((c) => {
    if (c.food?.distraction === 'mindful' && c.food?.eatingPace === 'slow') mindfulSlowCount++;
    if (c.food?.distraction === 'screen' || c.food?.distraction === 'work') screenDistractedCount++;
    if (c.food?.fullnessAfter && c.food.fullnessAfter >= 5) overfullCount++;
    if (c.timeOfDay === 'morning' && c.food?.mealTitle) breakfastCount++;
    if (c.timeOfDay === 'evening' && c.food) {
      const hour = parseInt(c.time.split(':')[0] || '12', 10);
      if (hour >= 20) lateDinnerCount++;
    }
  });

  const foodObservationCount = Math.max(1, moments.length + checkIns.filter((c) => c.food).length);
  const proteinRatio = proteinHeavyCount / Math.max(1, moments.length);
  const mindfulRatio = mindfulSlowCount / foodObservationCount;
  const lateDinnerRatio = lateDinnerCount / foodObservationCount;
  const breakfastRatio = breakfastCount / foodObservationCount;

  let archetype: NutritionArchetype = 'intuitive_mindful';
  let typeName = 'Der intuitive Genießer';
  let subtitle = 'Ausgewogene Balance aus Genuss, Körpergefühl & Achtsamkeit';
  let badge = 'Intuitiv & Achtsam';
  let description = 'Deine bisherigen Einträge zeigen eher ruhige, körperorientierte Essmuster. Cary prüft dieses Muster über mehrere Tage, bevor es als Ernährungstyp gilt.';
  let sleepNutritionCorrelation = 'Cary vergleicht Schlaf, Hunger, Sättigung, Essenszeit und Tagesenergie über mehrere Tage, um Zusammenhänge sichtbar zu machen.';
  let optimalMealTiming = 'Noch kein festes Timing: Cary lernt zuerst deinen tatsächlichen Tagesrhythmus.';

  if (proteinRatio >= 0.35) {
    archetype = 'protein_performer';
    typeName = 'Der protein-optimierte Performer';
    subtitle = 'Fokus auf Sättigungsdichte, Protein & stabile Energie';
    badge = 'Protein Focus';
    description = 'In deinen protokollierten Mahlzeiten tauchen wiederholt proteinreiche Entscheidungen auf. Cary beobachtet zusätzlich Sättigung und Energie danach.';
    sleepNutritionCorrelation = 'Cary prüft, ob proteinreichere Mahlzeiten bei dir tatsächlich mit Sättigung, Energie oder Schlaf zusammenhängen.';
    optimalMealTiming = 'Cary leitet dein Timing aus deinen protokollierten Essenszeiten ab, statt ein starres Schema vorzugeben.';
  } else if (lateDinnerRatio >= 0.35 || screenDistractedCount >= 3) {
    archetype = 'circadian_rhythm';
    typeName = 'Der Rhythmus- & Abend-Typ';
    subtitle = 'Essenszeit und Alltagssituation prägen dein Muster';
    badge = 'Rhythmus Focus';
    description = 'Spätere Mahlzeiten oder Ablenkung beim Essen kommen in deinen Einträgen wiederholt vor. Cary beobachtet, wie sich das auf dein Wohlbefinden auswirkt.';
    sleepNutritionCorrelation = 'Cary vergleicht insbesondere spätes Essen mit deiner gemeldeten Schlafqualität und morgendlichen Energie.';
    optimalMealTiming = 'Dein persönliches Zeitfenster wird aus mehreren Tagen abgeleitet und nicht pauschal vorgegeben.';
  } else if (breakfastRatio < 0.15 && foodObservationCount >= 6) {
    archetype = 'intermittent_balancer';
    typeName = 'Der Intervall- & Rhythmus-Typ';
    subtitle = 'Dein erstes Essen liegt häufig später am Tag';
    badge = 'Intermittent Rhythm';
    description = 'Frühstück taucht in deinem bisherigen Muster selten auf. Cary wertet das zunächst als beobachteten Rhythmus, nicht als Empfehlung zum Fasten.';
    sleepNutritionCorrelation = 'Cary prüft, ob dein späteres erstes Essen mit Schlaf, Hunger und Tagesenergie zusammenpasst.';
    optimalMealTiming = 'Kein vorgegebenes Fastenfenster: Entscheidend ist dein wiederkehrendes, gut verträgliches Muster.';
  }

  const traits = [
    { name: 'Achtsamkeits-Index', score: Math.min(10, Math.max(3, Math.round(mindfulRatio * 10))), max: 10, label: mindfulRatio > 0.4 ? 'Häufig achtsam' : 'Noch gemischt', color: 'amber' },
    { name: 'Sättigungs-Balance', score: overfullCount > 1 ? 5 : 8, max: 10, label: overfullCount > 1 ? 'Öfter sehr satt' : 'Meist ausgeglichen', color: 'emerald' },
    { name: 'Protein-Muster', score: Math.min(10, Math.max(2, Math.round(proteinRatio * 10))), max: 10, label: proteinRatio > 0.3 ? 'Häufig proteinreich' : 'Noch gemischt', color: 'indigo' },
    { name: 'Rhythmus-Konstanz', score: lateDinnerRatio > 0.3 ? 5 : 8, max: 10, label: lateDinnerRatio > 0.3 ? 'Häufig später' : 'Eher regelmäßig', color: 'rose' },
  ];

  const dos = [
    'Dokumentiere mehrere normale Tage statt nur besonders gute oder schlechte Tage.',
    'Erfasse Hunger vor und Sättigung nach dem Essen, damit Cary dein Körpergefühl einbeziehen kann.',
    'Halte Essenszeit und Schlaf möglichst ehrlich fest; Regelmäßigkeit ist wichtiger als Perfektion.',
    'Nutze Check-ins über mindestens fünf verschiedene Tage, bevor du den Typ als Muster interpretierst.',
  ];
  const donts = [
    'Ein einzelnes Essen nicht als Beweis für einen Ernährungstyp verstehen.',
    'Aus dem Profil keine medizinische Diagnose oder Unverträglichkeit ableiten.',
    'Deinen Alltag nicht künstlich verändern, nur um einen bestimmten Typ zu erhalten.',
  ];

  return {
    id: `profile-${archetype}`,
    archetype,
    typeName,
    subtitle,
    badge,
    confidenceScore,
    unlocked: isUnlocked,
    dataPointsNeeded: targetDataPoints,
    dataPointsCurrent: totalDataPoints,
    description,
    traits,
    dos,
    donts,
    recommendedFocus: isUnlocked
      ? 'Beobachte, ob dieses Muster auch in den nächsten Tagen stabil bleibt; Cary aktualisiert es mit jedem neuen Check-in.'
      : `Noch in Kalibrierung: ${uniqueDays}/${targetDays} Tage und ${totalDataPoints}/${targetDataPoints} Einträge erfasst.`,
    sleepNutritionCorrelation,
    optimalMealTiming,
  };
}

export const ALL_ARCHETYPES_INFO = [
  { type: 'intuitive_mindful', name: 'Der intuitive Genießer', icon: '🧘', summary: 'Körpergefühl, Sättigung und bewusstes Essen stehen im Vordergrund.' },
  { type: 'protein_performer', name: 'Der protein-optimierte Performer', icon: '⚡', summary: 'Wiederkehrend proteinreiche Mahlzeiten und Fokus auf stabile Energie.' },
  { type: 'circadian_rhythm', name: 'Der Rhythmus- & Abend-Typ', icon: '🌙', summary: 'Essenszeit und Alltagssituation prägen das wiederkehrende Muster.' },
  { type: 'intermittent_balancer', name: 'Der Intervall- & Rhythmus-Typ', icon: '⏳', summary: 'Das erste Essen liegt wiederholt später am Tag.' },
];
