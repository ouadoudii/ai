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
      dailyFocusTitle: 'مساحة لتسجيل وجبتك',
      dailyFocusTip: 'يمكنك تسجيل وجبتك عندما يناسبك، وإضافة شعورك بالجوع إن رغبت.',
      streaksDays: 0,
      coachSummary: 'لا توجد وجبات مسجلة اليوم بعد. يمكنك البدء وقتما تشاء.',
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
    dailyFocusTitle: 'مساحة للتأمل في يومك',
    dailyFocusTip: 'إذا أحببت، خذ وقتك مع وجبتك ولاحظ شعورك بالراحة دون قواعد صارمة.',
    streaksDays: 0, // Do not invent a multi-day streak from today's observations.
    coachSummary,
  };
}

export const INITIAL_COACHING_GOALS: CoachingGoal[] = [
  {
    id: 'goal-1',
    title: 'ملاحظة الجوع قبل الوجبة',
    description: 'يمكنك تسجيل شعورك بالجوع قبل الوجبة إن رغبت.',
    current: 0,
    target: 3,
    unit: 'وجبات',
    category: 'mindful',
    completed: false,
    icon: 'Eye',
  },
  {
    id: 'goal-2',
    title: 'لحظة هادئة مع الطعام',
    description: 'جرّب تناول وجبة بهدوء بعيدًا عن الشاشات عندما يناسبك.',
    current: 0,
    target: 2,
    unit: 'وجبات',
    category: 'habits',
    completed: false,
    icon: 'SmartphoneOff',
  },
  {
    id: 'goal-3',
    title: 'الانتباه إلى الشبع',
    description: 'يمكنك ملاحظة إحساسك بالشبع دون تقييم أو ضغط.',
    current: 0,
    target: 3,
    unit: 'وجبات',
    category: 'mindful',
    completed: false,
    icon: 'CheckCircle2',
  },
  {
    id: 'goal-4',
    title: 'ملاحظة مصادر البروتين',
    description: 'سجّل مصادر البروتين في وجباتك إن أحببت.',
    current: 0,
    target: 3,
    unit: 'حصص',
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
  // Normalize common Arabic orthography while preserving Arabizi and mixed-script words.
  // Matching only identifies the topic; it never invents personal observations.
  const q = userQuestion.trim().toLocaleLowerCase()
    .normalize('NFKC')
    .replace(/[\u064b-\u065f\u0670]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي');
  const latin = q.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  const today = getLocalDateKey();
  const todayCount = moments.filter((moment) => moment.date === today).length;
  if (/اليوم|نهار|تحليل|ملخص|تقرير|شنو كليت|اش كليت|واش كليت|lyoum|nhar|lyom|nhari|chno klit|ach klit|wach klit|heute|analyse|bilanz/.test(latin)) {
    return todayCount === 0
      ? 'لا توجد وجبات مسجلة اليوم بعد. يمكنك إضافة وجبة عندما يناسبك، دون أي ضغط.'
      : `سجّلت اليوم ${todayCount} ${todayCount === 1 ? 'وجبة' : 'وجبات'}. يمكنك مراجعة ملاحظاتك وإضافة ما شعرت به إن أحببت.`;
  }
  if (/نوم|نعاس|ننعس|تعب|عيان|نعسان|n3as|n3ass|3yan|3yane|na3s|sleep|schlaf|alarm|warn/.test(latin))
    return 'إذا كان يومك متعبًا، يمكنك أخذ قسط من الراحة حسب ظروفك. لا يمكنني استنتاج حالتك الصحية من سجل الوجبات.';
  if (/جوع|جائع|جيعان|جوعان|شهية|حلو|سكر|jou3|jo3|ji3an|jوع|joo3|mjou3|heißhunger|süß/.test(latin))
    return 'تغيّر الشهية أمر طبيعي. إن أحببت، لاحظ ما تشعر به واختر ما يناسبك دون لوم.';
  if (/بروتين|protein|proteine|eiweiß|عدس|حمص|3dess|3des|7oms|l3des/.test(latin))
    return 'يمكنك استكشاف مصادر البروتين التي تحبها، مثل العدس والحمص والبيض، حسب تفضيلاتك.';
  if (/شبع|شبعت|كمية|وجبة|chba3|chb3t|chba3t|chb3|portion|sättigung/.test(latin))
    return 'لكل شخص تجربة مختلفة مع الشبع. يمكنك ملاحظة إحساسك أثناء الطعام دون قواعد صارمة.';
  return 'أهلًا بك. يمكننا التحدث عن وجباتك أو شعورك بالجوع والشبع أو راحتك اليوم، بالوتيرة التي تناسبك.';
}
