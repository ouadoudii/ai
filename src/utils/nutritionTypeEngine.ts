import { FoodMoment, DailyCheckIn, NutritionTypeProfile, NutritionArchetype } from '../types';

/**
 * Intelligent Nutrition Type & Circadian Profiling Engine for NimmApp
 */

export function analyzeNutritionType(
  moments: FoodMoment[],
  checkIns: DailyCheckIn[] = []
): NutritionTypeProfile {
  const totalDataPoints = moments.length + checkIns.length;
  const targetDataPoints = 6;
  const confidenceScore = Math.min(100, Math.round((totalDataPoints / targetDataPoints) * 92) + (totalDataPoints > 3 ? 8 : 0));
  const isUnlocked = totalDataPoints >= 3;

  // Metric accumulators
  let proteinHeavyCount = 0;
  let mindfulSlowCount = 0;
  let screenDistractedCount = 0;
  let lateDinnerCount = 0;
  let breakfastCount = 0;
  let overfullCount = 0;
  let highEnergyCount = 0;

  moments.forEach((m) => {
    if (m.nutrition?.protein && m.nutrition.protein >= 25) proteinHeavyCount++;
    if (m.eatingPace === 'slow' && (!m.distraction || m.distraction === 'mindful')) mindfulSlowCount++;
    if (m.distraction === 'screen' || m.distraction === 'work') screenDistractedCount++;
    if (m.fullnessLevel && m.fullnessLevel >= 5) overfullCount++;
    if (m.energyAfter === 'energized' || m.mood === 'energized') highEnergyCount++;

    const hour = parseInt(m.time.split(':')[0] || '12', 10);
    if (hour >= 20) lateDinnerCount++;
    if (m.category === 'breakfast' || (hour >= 6 && hour <= 10)) breakfastCount++;
  });

  checkIns.forEach((c) => {
    if (c.food?.distraction === 'mindful' && c.food?.eatingPace === 'slow') mindfulSlowCount++;
    if (c.food?.fullnessAfter && c.food.fullnessAfter >= 5) overfullCount++;
    if (c.wellbeing.energyLevel >= 4) highEnergyCount++;
    if (c.timeOfDay === 'morning') breakfastCount++;
  });

  const momentCount = Math.max(1, moments.length);
  const proteinRatio = proteinHeavyCount / momentCount;
  const mindfulRatio = mindfulSlowCount / momentCount;
  const lateDinnerRatio = lateDinnerCount / momentCount;

  // Determine Dominant Archetype
  let archetype: NutritionArchetype = 'intuitive_mindful';
  let typeName = 'Der intuitive Genießer';
  let subtitle = 'Ausgewogene Balance aus Genuss, Körpergefühl & Achtsamkeit';
  let badge = 'Intuitiv & Achtsam';
  let description =
    'Du hörst gut auf deine natürlichen Hunger- und Sättigungssignale. Deine Mahlzeiten werden bevorzugt in Ruhe genossen. Dein Körper reagiert direkt auf Qualität und Bekömmlichkeit.';
  let sleepNutritionCorrelation =
    'Guter Schlaf führt bei dir direkt zu stabilerem Sättigungsgefühl und weniger Snack-Bedürfnis am Vormittag.';
  let optimalMealTiming = 'Regelmäßiges 3-Mahlzeiten-Intervall (08:00 | 12:30 | 18:30) ohne späte Nachtsnacks.';

  if (proteinRatio >= 0.35) {
    archetype = 'protein_performer';
    typeName = 'Der protein-optimierte Performer';
    subtitle = 'Fokus auf Muskelregeneration, Sättigungsdichte & Energie';
    badge = 'High Protein Focus';
    description =
      'Du achtest gezielt auf nährstoff- und proteinreiche Mahlzeiten. Du nutzt Ernährung aktiv als Treibstoff für Leistungsfähigkeit, Konzentration und sportliche Regeneration.';
    sleepNutritionCorrelation =
      'Ausreichend Protein am Abend verbessert deine Tiefschlafphasen und verhindert nächtliche Blutzuckerschwankungen.';
    optimalMealTiming = 'Protein-Timing: 25-35g Protein pro Hauptmahlzeit mit 4-stündigem Abstand.';
  } else if (lateDinnerRatio >= 0.35 || screenDistractedCount >= 3) {
    archetype = 'circadian_rhythm';
    typeName = 'Der circadiane Abend-Genießer';
    subtitle = 'Tendenz zu späteren Mahlzeiten & geselligem Ausklang';
    badge = 'Circadian Optimization';
    description =
      'Du nimmst dir abends gerne Zeit für reichhaltigere Gerichte. Deine größte Coaching-Chance liegt in der zeitlichen Vorverlegung des Abendessens, um die Schlafregeneration zu maximieren.';
    sleepNutritionCorrelation =
      'Ein Abendessen vor 19:30 Uhr vertieft deine REM-Schlafphasen spürbar und verhindert morgendliche Trägheit.';
    optimalMealTiming = 'Früheres Abendessen (vor 19:30 Uhr) + 12h nächtliche Magenpause.';
  } else if (breakfastCount === 0 && momentCount >= 3) {
    archetype = 'intermittent_balancer';
    typeName = 'Der Intervall- & Rhythmus-Typ';
    subtitle = 'Natürliches 16:8 Fasten & stabiles Nachmittags-Plateau';
    badge = 'Intermittent Rhythm';
    description =
      'Dein Körper kommt morgens hervorragend ohne schwere Kost in Schwung. Dein erstes Energiefenster öffnet sich gegen Mittag, wo du nährstoffreich auftankst.';
    sleepNutritionCorrelation =
      'Durch die frühere letzte Mahlzeit schläfst du tiefer und wachst mit natürlicher Leichtigkeit auf.';
    optimalMealTiming = 'Essensfenster von 11:30 bis 19:30 Uhr (16:8 Fasten-Rhythmus).';
  }

  // Trait Ratings
  const traits = [
    {
      name: 'Achtsamkeits-Index',
      score: Math.min(10, Math.max(4, Math.round(mindfulRatio * 10) + 5)),
      max: 10,
      label: mindfulRatio > 0.4 ? 'Sehr hoch' : 'Ausbaufähig',
      color: 'amber',
    },
    {
      name: 'Sättigungs-Präzision',
      score: overfullCount > 1 ? 6 : 9,
      max: 10,
      label: overfullCount > 1 ? 'Sensibel bei Stufe 5' : 'Hervorragend (Stufe 4)',
      color: 'emerald',
    },
    {
      name: 'Nährstoff- & Proteindichte',
      score: Math.min(10, Math.max(5, Math.round(proteinRatio * 10) + 4)),
      max: 10,
      label: proteinRatio > 0.3 ? 'Optimal (High)' : 'Solide Basis',
      color: 'indigo',
    },
    {
      name: 'Schlaf-Ernährungs-Harmonie',
      score: lateDinnerRatio > 0.3 ? 6 : 9,
      max: 10,
      label: lateDinnerRatio > 0.3 ? 'Optimierungs-Potenzial' : 'Stark synchronisiert',
      color: 'rose',
    },
  ];

  const dos = [
    'Halte das 20-Minuten-Ess-Tempo bei, damit das natürliche Sättigungssignal greift.',
    'Kombiniere jede Hauptmahlzeit mit einer verlässlichen Proteinquelle (Ei, Fisch, Hülsenfrüchte, Tofu).',
    'Trinke 15 Minuten vor dem Essen ein Glas stilles Wasser für optimale Verdauungsenzyme.',
    'Nutze den WhatsApp-Sprach-Check-in für müheloses Dokumentieren ohne Tippaufwand.',
  ];

  const donts = [
    'Keine Mahlzeiten nebenbei am Laptop oder mit Social-Media-Scrolling herunterschlingen.',
    'Große fettige Portionen nach 21:00 Uhr vermeiden, um das Herz-Kreislauf-System nachts zu schonen.',
    'Hungersignale nicht mit Kaffee oder Energy Drinks unterdrücken.',
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
    recommendedFocus:
      'Fokussiere dich auf die Synchronisation zwischen Schlafqualität und leichtem Abendessen für maximale Tagesenergie.',
    sleepNutritionCorrelation,
    optimalMealTiming,
  };
}

export const ALL_ARCHETYPES_INFO = [
  {
    type: 'intuitive_mindful',
    name: 'Der intuitive Genießer',
    icon: '🧘',
    summary: 'Ausgeprägtes Gespür für Qualität, Portionskontrolle und bewusste Genussmomente.',
  },
  {
    type: 'protein_performer',
    name: 'Der protein-optimierte Performer',
    icon: '⚡',
    summary: 'Leistungsorientierte Makro-Balance, konstante Energie und hohe Muskelregeneration.',
  },
  {
    type: 'circadian_rhythm',
    name: 'Der circadiane Abend-Genießer',
    icon: '🌙',
    summary: 'Fokus auf geselliges Abendessen mit gezielter Optimierung für erholsamen Tiefschlaf.',
  },
  {
    type: 'intermittent_balancer',
    name: 'Der Intervall- & Rhythmus-Typ',
    icon: '⏳',
    summary: 'Klares Essensfenster (z.B. 16:8), mühelose Fastenperioden und scharfer Morgenfokus.',
  },
];
