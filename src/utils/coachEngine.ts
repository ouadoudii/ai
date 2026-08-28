import { FoodMoment, CoachFeedback, CoachingGoal, EatingPace, DistractionLevel, EnergyLevelAfter } from '../types';

/**
 * Intelligent Coaching Engine for Mindful Nutrition & Eating Habits
 */

export function generateMomentCoachFeedback(moment: Partial<FoodMoment>): CoachFeedback {
  const hunger = moment.hungerLevel ?? 3;
  const fullness = moment.fullnessLevel ?? 4;
  const pace = moment.eatingPace ?? 'moderate';
  const distraction = moment.distraction ?? 'mindful';
  const energy = moment.energyAfter ?? 'energized';
  const protein = moment.nutrition?.protein;
  const cat = moment.category ?? 'lunch';

  // Case 1: Overeating / Heavy Food Coma
  if (fullness >= 5 || energy === 'heavy') {
    return {
      title: 'Sättigungs-Signal überschritten',
      message: 'Du hast dich bis Stufe 5/5 gesättigt. Tipp: Versuche beim nächsten Mal bei Stufe 4 (angenehm satt) eine 5-Minuten-Pause einzulegen, um dem Gehirn Zeit für das Sättigungssignal zu geben.',
      type: 'tip',
      badge: 'Sättigungs-Tipp',
      habitScore: 65,
    };
  }

  // Case 2: Rushed & Distracted Eating
  if (pace === 'rushed' || distraction === 'screen' || distraction === 'work') {
    return {
      title: 'Achtsamkeit im Fokus',
      message: 'Diese Mahlzeit wurde hastig oder mit Bildschirm-Ablenkung gegessen. Wenn du ohne Screen isst und 20-mal kaust, registriert dein Körper die Sättigung deutlich schneller und besser.',
      type: 'insight',
      badge: 'Mindful Reminder',
      habitScore: 70,
    };
  }

  // Case 3: High Hunger Pre-Meal (Ravenous risk)
  if (hunger >= 5) {
    return {
      title: 'Großer Vor-Hunger erkannt',
      message: 'Dein Hunger war vor dem Essen bei Stufe 5 (sehr stark). Um Heißhunger und Überessen zu vermeiden, plane bei langen Pausen einen kleinen Nuss- oder Protein-Snack ein.',
      type: 'tip',
      badge: 'Rhythmus-Tipp',
      habitScore: 75,
    };
  }

  // Case 4: High Protein & Energized (Gold Standard)
  if (protein && protein >= 25 && energy === 'energized') {
    return {
      title: 'Hervorragende Nährstoff-Balance',
      message: `Mit satten ${protein}g Protein und hohem Energielevel hast du deinem Körper langanhaltende Sättigung und stabile Blutzuckerspiegel geschenkt. Perfekt gelöst!`,
      type: 'praise',
      badge: 'Top Nährwert-Balance',
      habitScore: 98,
    };
  }

  // Case 5: Mindful & Slow Eating
  if (pace === 'slow' && distraction === 'mindful') {
    return {
      title: 'Vorbildliches Mindful Eating',
      message: 'In Ruhe und ohne Ablenkung genossen! Dein Verdauungssystem und dein Wohlbefinden profitieren maximal von dieser achtsamen Pause.',
      type: 'praise',
      badge: 'Achtsamkeits-Champion',
      habitScore: 95,
    };
  }

  // Case 6: Category-specific insights
  if (cat === 'breakfast' && energy === 'energized') {
    return {
      title: 'Starker Tagesstart',
      message: 'Ein nährstoffreiches Frühstück stabilisiert deine Leistungsfähigkeit für den gesamten Vormittag.',
      type: 'praise',
      badge: 'Power-Start',
      habitScore: 90,
    };
  }

  if (cat === 'snack' && hunger <= 2) {
    return {
      title: 'Emotionaler / Gewohnheits-Snack',
      message: 'Dein Hungerlevel war gering (1-2). Frage dich kurz: War es echter physischer Hunger oder eher Appetit, Stressabbau oder Gewohnheit? Ein Glas Wasser oder kurzer Spaziergang wirkt oft Wunder.',
      type: 'insight',
      badge: 'Achtsamkeits-Impuls',
      habitScore: 75,
    };
  }

  // Default balanced feedback
  return {
    title: 'Ausgewogener Genussmoment',
    message: 'Gute Balance zwischen Hunger und Sättigung. Weiter so mit dem bewussten Hineinspüren in deinen Körper!',
    type: 'praise',
    badge: 'Ausgewogen',
    habitScore: 88,
  };
}

export interface DailyCoachingMetrics {
  todayMomentsCount: number;
  mindfulScore: number; // 0-100
  satietyBalanceScore: number; // 0-100
  screenFreeRatio: number; // 0-100 %
  slowEatingRatio: number; // 0-100 %
  dailyFocusTitle: string;
  dailyFocusTip: string;
  streaksDays: number;
  coachSummary: string;
}

export function calculateCoachingMetrics(moments: FoodMoment[]): DailyCoachingMetrics {
  if (moments.length === 0) {
    return {
      todayMomentsCount: 0,
      mindfulScore: 80,
      satietyBalanceScore: 85,
      screenFreeRatio: 100,
      slowEatingRatio: 100,
      dailyFocusTitle: 'Erste Mahlzeit achtsam erfassen',
      dailyFocusTip: 'Nimm dir vor dem ersten Bissen 3 bewusste Atemzüge und beurteile deinen Hunger auf einer Skala von 1 bis 5.',
      streaksDays: 1,
      coachSummary: 'Erfasse deine nächste Mahlzeit, um dein persönliches Coaching-Feedback zu aktivieren.',
    };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const todayMoments = moments.filter((m) => m.date === todayStr);
  const relevantMoments = todayMoments.length > 0 ? todayMoments : moments.slice(0, 5);

  let mindfulPoints = 0;
  let satietyPoints = 0;
  let screenFreeCount = 0;
  let slowPaceCount = 0;

  relevantMoments.forEach((m) => {
    // Satiety assessment (ideal fullness is 3 or 4)
    const fullness = m.fullnessLevel ?? 4;
    if (fullness === 3 || fullness === 4) satietyPoints += 100;
    else if (fullness === 2) satietyPoints += 70;
    else satietyPoints += 50;

    // Distraction assessment
    if (!m.distraction || m.distraction === 'mindful') {
      screenFreeCount++;
      mindfulPoints += 35;
    } else {
      mindfulPoints += 10;
    }

    // Pace assessment
    if (m.eatingPace === 'slow') {
      slowPaceCount++;
      mindfulPoints += 35;
    } else if (m.eatingPace === 'moderate' || !m.eatingPace) {
      mindfulPoints += 25;
    } else {
      mindfulPoints += 10;
    }

    // Rating and mood
    if (m.rating >= 4) mindfulPoints += 30;
    else mindfulPoints += 15;
  });

  const count = relevantMoments.length;
  const mindfulScore = Math.min(100, Math.round(mindfulPoints / count));
  const satietyBalanceScore = Math.min(100, Math.round(satietyPoints / count));
  const screenFreeRatio = Math.round((screenFreeCount / count) * 100);
  const slowEatingRatio = Math.round((slowPaceCount / count) * 100);

  // Determine coaching summary
  let coachSummary = 'Du bist auf einem hervorragenden Weg! Deine Mahlzeiten zeigen ein ausgeprägtes Gespür für Genuss und ausgewogene Portionsgrößen.';
  if (satietyBalanceScore < 75) {
    coachSummary = 'Fokus auf Sättigung: Versuche heute ganz gezielt bei Stufe 4 aufzuhören und den letzten Bissen zu genießen, ohne dich übervoll zu fühlen.';
  } else if (screenFreeRatio < 60) {
    coachSummary = 'Achtsamkeits-Booster: Wenn du während des Essens Smartphone & Bildschirme weglegst, nimmst du Geschmack und Sättigung intensiver wahr.';
  }

  return {
    todayMomentsCount: todayMoments.length,
    mindfulScore,
    satietyBalanceScore,
    screenFreeRatio,
    slowEatingRatio,
    dailyFocusTitle: 'Heutiger Coaching-Fokus: Das 20-Minuten-Signal',
    dailyFocusTip: 'Dein Magen braucht etwa 20 Minuten, um dem Gehirn zu signalisieren: Ich bin satt! Lege nach der halben Portion die Gabel für 60 Sekunden kurz ab.',
    streaksDays: 5,
    coachSummary,
  };
}

export const INITIAL_COACHING_GOALS: CoachingGoal[] = [
  {
    id: 'goal-1',
    title: 'Hunger-Check vor jeder Mahlzeit',
    description: 'Bewerte deinen Hunger auf der 1-5 Skala, bevor der erste Bissen genommen wird.',
    current: 3,
    target: 3,
    unit: 'Mahlzeiten',
    category: 'mindful',
    completed: true,
    icon: 'Eye',
  },
  {
    id: 'goal-2',
    title: 'Screen-Free Dining',
    description: 'Mindestens 2 Hauptmahlzeiten ohne Smartphone, TV oder Laptop genießen.',
    current: 2,
    target: 2,
    unit: 'Mahlzeiten',
    category: 'habits',
    completed: true,
    icon: 'SmartphoneOff',
  },
  {
    id: 'goal-3',
    title: 'Sättigungs-Stopp bei Stufe 4',
    description: 'Aufhören, wenn man angenehm satt ist (nicht überfüllt bei Stufe 5).',
    current: 2,
    target: 3,
    unit: 'Mahlzeiten',
    category: 'mindful',
    completed: false,
    icon: 'CheckCircle2',
  },
  {
    id: 'goal-4',
    title: 'Protein-Power in Hauptgerichten',
    description: 'Mindestens 20g Protein pro Hauptmahlzeit für langanhaltende Sättigung.',
    current: 2,
    target: 3,
    unit: 'Portionen',
    category: 'nutrition',
    completed: false,
    icon: 'Flame',
  },
];

export function getCoachChatResponse(userQuestion: string, moments: FoodMoment[]): string {
  const q = userQuestion.toLowerCase();

  if (q.includes('alarm') || q.includes('eingreif') || q.includes('warn') || q.includes('notfall') || q.includes('rote flagge') || q.includes('frühwarn')) {
    return `Cary achtet kontinuierlich auf 4 physiologische Schlüsselmomente und meldet sich sanft, wenn dein Körper Unterstützung braucht:\n1. ⚠️ Schlafmangel (<6h): Schützt dich vor der hormonellen Ghrelin-Heißhungerfalle.\n2. ⚠️ Gehetztes Essen am Bildschirm: Verhindert unbemerktes Überessen & Völlegefühl.\n3. ⚠️ Kritisches Nachmittagstief: Schneller, sanfter Impuls gegen den Blutzucker-Absturz.\n4. ⚠️ Spätes, schweres Abendessen: Sichert deine erholsame Tiefschlaf-Phase.\nSolange alles im Gleichgewicht ist, wacht Cary dezent im Hintergrund.`;
  }

  if (q.includes('tag') || q.includes('heute') || q.includes('analyse') || q.includes('bilanz')) {
    const todayMoments = moments.slice(0, 3);
    const count = todayMoments.length;
    return `Hier ist deine fürsorgliche Tagesbilanz von Cary: Du hast heute ${count} kulinarische Momente erfasst. Deine Mahlzeiten waren nahrhaft und boten eine wunderbare Mischung aus Genuss und Wohlbefinden. Dein Achtsamkeits-Score liegt bei schönen 88%! Tipp für den Abend: Mach es dir gemütlich, halte das Abendessen leicht und nimm dir mindestens 15 Minuten echte Ruhe.`;
  }

  if (q.includes('heißhunger') || q.includes('süß') || q.includes('nachmittag')) {
    return `Cary hilft dir durch das Nachmittagstief mit drei sanften Schritten:\n1. 💧 Trinke zuerst ein großes Glas warmes Wasser oder Kräutertee – der Körper verwechselt oft Durst mit Verlangen.\n2. 🥜 Eine kleine Handvoll Mandeln oder Nüsse stabilisiert deinen Blutzucker sanft.\n3. 🪟 Einmal kurz das Fenster öffnen und 3 tiefe Atemzüge nehmen stoppt das Verlangen im Gehirn.`;
  }

  if (q.includes('abendessen') || q.includes('dinner') || q.includes('schlaf')) {
    return `Für einen tiefen, erholsamen Schlaf empfiehlt dir Cary: Leicht bekömmliches Protein (z. B. milder Lachs, Eier, Tofu) kombiniert mit gedünstetem Gemüse oder einer warmen Suppe. Vermeide schwere, frittierte Speisen nach 20:00 Uhr, damit deine Verdauung zur Ruhe kommen kann.`;
  }

  if (q.includes('protein') || q.includes('eiweiß') || q.includes('muskel')) {
    return `Proteine sind essenziell für anhaltende Zufriedenheit und Zellerneuerung. In deinen geloggten Momenten sind bereits tolle Bausteine dabei! Achte darauf, pro Mahlzeit eine kleine, verlässliche Eiweißquelle einzubauen.`;
  }

  if (q.includes('sättigung') || q.includes('portion') || q.includes('zu viel')) {
    return `Dein Körper braucht 15–20 Minuten, bis das Sättigungssignal im Gehirn ankommt. Carys Tipp: Nimm dir Zeit für jeden Bissen, kaue genussvoll und spüre bei Stufe 4 nach, ob du schon vollkommen zufrieden bist.`;
  }

  return `Als deine fürsorgliche Begleiterin Cary bin ich immer an deiner Seite. Mir geht es darum, dass du dich in deinem Körper rundum wohlfühlst – ohne Druck oder strenge Regeln. Worüber möchtest du sprechen? (Achtsamkeit, Schlaferholung, Genussmomente oder Energie?)`;
}
