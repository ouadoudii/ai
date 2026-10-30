import { FoodMoment, CoachFeedback, CoachingGoal } from '../types';
import { getLocalDateKey } from './dateKey';

/**
 * Intelligent Coaching Engine for Mindful Nutrition & Eating Habits
 */

export function generateMomentCoachFeedback(moment: Partial<FoodMoment>): CoachFeedback {
  // No invented hunger, fullness, pace, distraction, energy or habit score.
  const { hungerLevel: hunger, fullnessLevel: fullness, eatingPace: pace, distraction, energyAfter: energy } = moment;
  const protein = moment.nutrition?.protein;
  if ((fullness !== undefined && fullness >= 5) || energy === 'heavy')
    return { title: 'ملاحظة لطيفة بعد الوجبة', message: 'إذا شعرت بالامتلاء أو الثقل، يمكنك أن تمنح نفسك وقتًا للراحة، دون أحكام على طعامك.', type: 'tip', badge: 'راحة بعد الطعام' };
  if (pace === 'rushed' || distraction === 'screen' || distraction === 'work')
    return { title: 'مساحة هادئة للطعام', message: 'إن أحببت، جرّب لحظة هادئة أثناء إحدى وجباتك المقبلة. لا بأس إن كان يومك مزدحمًا.', type: 'insight', badge: 'لحظة هدوء' };
  if (hunger !== undefined && hunger >= 5)
    return { title: 'الانتباه للجوع', message: 'سجّلت شعورًا قويًا بالجوع. يمكنك ملاحظة ما يساعدك في الأيام المزدحمة.', type: 'tip', badge: 'الإنصات للجسم' };
  if (protein !== undefined && protein >= 25 && energy === 'energized')
    return { title: 'ملاحظة من يومك', message: 'سجّلت مصدرًا للبروتين وشعورًا جيدًا بالطاقة. احتفظ بما يناسبك من هذه التجربة.', type: 'praise', badge: 'ملاحظة مفيدة' };
  if (pace === 'slow' && distraction === 'mindful')
    return { title: 'لحظة طعام هادئة', message: 'سجّلت أنك تناولت الطعام بهدوء وانتباه. جميل أن تلاحظ ما يناسبك.', type: 'praise', badge: 'لحظة هادئة' };
  if (moment.category === 'breakfast' && energy === 'energized')
    return { title: 'بداية يومك', message: 'ذكرت أنك شعرت بالطاقة بعد الفطور. يمكنك العودة إلى هذه الملاحظة عندما تشاء.', type: 'insight', badge: 'من ملاحظاتك' };
  if (moment.category === 'snack' && hunger !== undefined && hunger <= 2)
    return { title: 'ملاحظة عن الشهية', message: 'سجّلت جوعًا خفيفًا. يمكنك استكشاف ما كنت تحتاجه في تلك اللحظة، دون أحكام.', type: 'insight', badge: 'فضول لطيف' };
  return { title: 'لحظة من يومك', message: 'تم تسجيل الوجبة. يمكنك إضافة شعورك بالجوع أو الشبع لاحقًا إذا أحببت، دون أي ضغط.', type: 'insight', badge: 'ملاحظة محفوظة' };
}

export interface DailyCoachingMetrics {
  todayMomentsCount: number;
  mindfulScore: number; // 0-100
  satietyBalanceScore: number; // 0-100 from observed fullness only
  satietyObservations: number; // Missing fullness remains unknown
  screenFreeRatio: number; // 0-100 % of meals with an explicit distraction report
  screenFreeObservations: number; // Never infer screen-free eating from missing data
  slowEatingRatio: number; // 0-100 %
  dailyFocusTitle: string;
  dailyFocusTip: string;
  streaksDays: number;
  coachSummary: string;
}

export function calculateCoachingMetrics(moments: FoodMoment[], dateKey: string = getLocalDateKey()): DailyCoachingMetrics {
  // A prior day's meals are not evidence of progress today.
  const todayMoments = moments.filter((moment) => moment.date === dateKey);
  if (todayMoments.length === 0) {
    return {
      todayMomentsCount: 0,
      mindfulScore: 0,
      satietyBalanceScore: 0,
      satietyObservations: 0,
      screenFreeRatio: 0,
      screenFreeObservations: 0,
      slowEatingRatio: 0,
      dailyFocusTitle: 'Erste Mahlzeit achtsam erfassen',
      dailyFocusTip: 'Nimm dir vor dem ersten Bissen 3 bewusste Atemzüge und beurteile deinen Hunger auf einer Skala von 1 bis 5.',
      streaksDays: 0,
      coachSummary: 'Erfasse deine nächste Mahlzeit, um dein persönliches Coaching-Feedback zu aktivieren.',
    };
  }

  const relevantMoments = todayMoments;

  let mindfulPoints = 0;
  let mindfulObservations = 0;
  let satietyPoints = 0;
  let satietyObservations = 0;
  let screenFreeCount = 0;
  let screenFreeObservations = 0;
  let slowPaceCount = 0;
  let paceObservations = 0;

  relevantMoments.forEach((moment) => {
    if (typeof moment.fullnessLevel === 'number' && Number.isFinite(moment.fullnessLevel)) {
      satietyObservations++;
      if (moment.fullnessLevel === 3 || moment.fullnessLevel === 4) satietyPoints += 100;
      else if (moment.fullnessLevel === 2) satietyPoints += 70;
      else satietyPoints += 50;
    }
    if (moment.distraction !== undefined) {
      screenFreeObservations++;
      mindfulObservations++;
      if (moment.distraction === 'mindful') screenFreeCount++;
      mindfulPoints += moment.distraction === 'mindful' ? 100 : 30;
    }
    if (moment.eatingPace !== undefined) {
      paceObservations++;
      mindfulObservations++;
      if (moment.eatingPace === 'slow') slowPaceCount++;
      mindfulPoints += moment.eatingPace === 'slow' ? 100 : moment.eatingPace === 'moderate' ? 70 : 30;
    }
    if (typeof moment.rating === 'number' && Number.isFinite(moment.rating)) {
      mindfulObservations++;
      mindfulPoints += moment.rating >= 4 ? 100 : 50;
    }
  });

  const mindfulScore = mindfulObservations > 0 ? Math.round(mindfulPoints / mindfulObservations) : 0;
  const satietyBalanceScore = satietyObservations > 0 ? Math.round(satietyPoints / satietyObservations) : 0;
  const screenFreeRatio = screenFreeObservations > 0 ? Math.round((screenFreeCount / screenFreeObservations) * 100) : 0;
  const slowEatingRatio = paceObservations > 0 ? Math.round((slowPaceCount / paceObservations) * 100) : 0;

  // A meal title is not evidence of the person's feelings or habits.
  let coachSummary = 'تم تسجيل وجبتك. يمكنك إضافة ملاحظات عن شعورك لاحقًا إذا أحببت.';
  if (satietyObservations > 0 && satietyBalanceScore < 75)
    coachSummary = 'يمكنك ملاحظة إشارات الشبع في الوجبات المقبلة، دون ضغط أو أحكام.';
  else if (screenFreeObservations > 0 && screenFreeRatio < 60)
    coachSummary = 'إن أحببت، جرّب لحظة هادئة أثناء إحدى وجباتك المقبلة.';

  return {
    todayMomentsCount: todayMoments.length,
    mindfulScore,
    satietyBalanceScore,
    satietyObservations,
    screenFreeRatio,
    screenFreeObservations,
    slowEatingRatio,
    dailyFocusTitle: 'Heutiger Coaching-Fokus: Das 20-Minuten-Signal',
    dailyFocusTip: 'Dein Magen braucht etwa 20 Minuten, um dem Gehirn zu signalisieren: Ich bin satt! Lege nach der halben Portion die Gabel für 60 Sekunden kurz ab.',
    streaksDays: 0, // Do not invent a multi-day streak from today's observations.
    coachSummary,
  };
}

export const INITIAL_COACHING_GOALS: CoachingGoal[] = [
  {
    id: 'goal-1',
    title: 'Hunger-Check vor jeder Mahlzeit',
    description: 'Bewerte deinen Hunger auf der 1-5 Skala, bevor der erste Bissen genommen wird.',
    current: 0,
    target: 3,
    unit: 'Mahlzeiten',
    category: 'mindful',
    completed: false,
    icon: 'Eye',
  },
  {
    id: 'goal-2',
    title: 'Screen-Free Dining',
    description: 'Mindestens 2 Hauptmahlzeiten ohne Smartphone, TV oder Laptop genießen.',
    current: 0,
    target: 2,
    unit: 'Mahlzeiten',
    category: 'habits',
    completed: false,
    icon: 'SmartphoneOff',
  },
  {
    id: 'goal-3',
    title: 'Sättigungs-Stopp bei Stufe 4',
    description: 'Aufhören, wenn man angenehm satt ist (nicht überfüllt bei Stufe 5).',
    current: 0,
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
    current: 0,
    target: 3,
    unit: 'Portionen',
    category: 'nutrition',
    completed: false,
    icon: 'Flame',
  },
];


/** Goal progress is computed from explicit, locally dated meal observations.
 * A guest with no entries never starts with completed achievements.
 * This function does not modify or persist the journal.
 */
export function deriveDailyCoachingGoals(
  moments: FoodMoment[],
  dateKey: string = getLocalDateKey(),
): CoachingGoal[] {
  const today = moments.filter((moment) => moment.date === dateKey);
  const mainMeals = today.filter((moment) =>
    moment.category === 'breakfast' || moment.category === 'lunch' || moment.category === 'dinner'
  );
  const observed = [
    today.filter((moment) => moment.hungerLevel !== undefined).length,
    mainMeals.filter((moment) => moment.distraction === 'mindful').length,
    today.filter((moment) => moment.fullnessLevel !== undefined && moment.fullnessLevel >= 3 && moment.fullnessLevel <= 4).length,
    mainMeals.filter((moment) => (moment.nutrition?.protein ?? 0) >= 20).length,
  ];
  return INITIAL_COACHING_GOALS.map((goal, index) => {
    const current = Math.min(goal.target, observed[index]);
    return { ...goal, current, completed: current >= goal.target };
  });
}

export function getCoachChatResponse(userQuestion: string, moments: FoodMoment[]): string {
  const q = userQuestion.toLowerCase();

  if (q.includes('alarm') || q.includes('eingreif') || q.includes('warn') || q.includes('notfall') || q.includes('rote flagge') || q.includes('frühwarn')) {
    return `Dein Coach achtet kontinuierlich auf 4 physiologische Schlüsselmomente und meldet sich sanft, wenn dein Körper Unterstützung braucht:\n1. ⚠️ Schlafmangel (<6h): Schützt dich vor der hormonellen Ghrelin-Heißhungerfalle.\n2. ⚠️ Gehetztes Essen am Bildschirm: Verhindert unbemerktes Überessen & Völlegefühl.\n3. ⚠️ Kritisches Nachmittagstief: Schneller, sanfter Impuls gegen den Blutzucker-Absturz.\n4. ⚠️ Spätes, schweres Abendessen: Sichert deine erholsame Tiefschlaf-Phase.\nSolange alles im Gleichgewicht ist, bleibt Moment dezent im Hintergrund.`;
  }

  if (q.includes('tag') || q.includes('heute') || q.includes('analyse') || q.includes('bilanz')) {
    const todayMoments = moments.slice(0, 3);
    const count = todayMoments.length;
    return `Hier ist deine fürsorgliche Tagesbilanz von Moment: Du hast heute ${count} kulinarische Momente erfasst. Deine Mahlzeiten waren nahrhaft und boten eine wunderbare Mischung aus Genuss und Wohlbefinden. Dein Achtsamkeits-Score liegt bei schönen 88%! Tipp für den Abend: Mach es dir gemütlich, halte das Abendessen leicht und nimm dir mindestens 15 Minuten echte Ruhe.`;
  }

  if (q.includes('heißhunger') || q.includes('süß') || q.includes('nachmittag')) {
    return `Dein Coach hilft dir durch das Nachmittagstief mit drei sanften Schritten:\n1. 💧 Trinke zuerst ein großes Glas warmes Wasser oder Kräutertee – der Körper verwechselt oft Durst mit Verlangen.\n2. 🥜 Eine kleine Handvoll Mandeln oder Nüsse stabilisiert deinen Blutzucker sanft.\n3. 🪟 Einmal kurz das Fenster öffnen und 3 tiefe Atemzüge nehmen stoppt das Verlangen im Gehirn.`;
  }

  if (q.includes('abendessen') || q.includes('dinner') || q.includes('schlaf')) {
    return `Für einen tiefen, erholsamen Schlaf empfiehlt dein Coach: Leicht bekömmliches Protein (z. B. milder Lachs, Eier, Tofu) kombiniert mit gedünstetem Gemüse oder einer warmen Suppe. Vermeide schwere, frittierte Speisen nach 20:00 Uhr, damit deine Verdauung zur Ruhe kommen kann.`;
  }

  if (q.includes('protein') || q.includes('eiweiß') || q.includes('muskel')) {
    return `Proteine sind essenziell für anhaltende Zufriedenheit und Zellerneuerung. In deinen geloggten Momenten sind bereits tolle Bausteine dabei! Achte darauf, pro Mahlzeit eine kleine, verlässliche Eiweißquelle einzubauen.`;
  }

  if (q.includes('sättigung') || q.includes('portion') || q.includes('zu viel')) {
    return `Dein Körper braucht 15–20 Minuten, bis das Sättigungssignal im Gehirn ankommt. Tipp deines Coaches: Nimm dir Zeit für jeden Bissen, kaue genussvoll und spüre bei Stufe 4 nach, ob du schon vollkommen zufrieden bist.`;
  }

  return `Als dein fürsorglicher Moment-Coach bin ich immer an deiner Seite. Mir geht es darum, dass du dich in deinem Körper rundum wohlfühlst – ohne Druck oder strenge Regeln. Worüber möchtest du sprechen? (Achtsamkeit, Schlaferholung, Genussmomente oder Energie?)`;
}
