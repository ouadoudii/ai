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
  mindfulScore: number; // deprecated: neutral placeholder, never a wellbeing grade
  satietyBalanceScore: number; // deprecated: neutral placeholder, never a satiety grade
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

  // Legacy numeric fields remain for API compatibility, but are not assessments
  // of a person, their eating, or their health. Only explicit observations count.
  const satietyObservations = relevantMoments.filter(
    moment => typeof moment.fullnessLevel === 'number' && Number.isFinite(moment.fullnessLevel)
  ).length;
  const screenFreeObservations = relevantMoments.filter(
    moment => moment.distraction !== undefined
  ).length;
  const screenFreeCount = relevantMoments.filter(
    moment => moment.distraction === 'mindful'
  ).length;
  const paceObservations = relevantMoments.filter(
    moment => moment.eatingPace !== undefined
  ).length;
  const slowPaceCount = relevantMoments.filter(
    moment => moment.eatingPace === 'slow'
  ).length;

  // Do not manufacture a mindfulness or satiety "score" from arbitrary weights.
  // Deprecation-safe placeholders until consumers migrate to observed counts.
  const mindfulScore = 0;
  const satietyBalanceScore = 0;
  const screenFreeRatio = screenFreeObservations > 0 ? Math.round((screenFreeCount / screenFreeObservations) * 100) : 0;
  const slowEatingRatio = paceObservations > 0 ? Math.round((slowPaceCount / paceObservations) * 100) : 0;

  const coachSummary = satietyObservations > 0
    ? 'سجّلت ملاحظات عن الشبع اليوم. يمكنك العودة إليها عندما يناسبك، دون تقييم أو ضغط.'
    : 'تم تسجيل وجبتك. يمكنك إضافة ملاحظات عن شعورك لاحقًا إذا أحببت.';

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
    // Any explicitly recorded fullness is a valid observation, not only a "preferred" level.
    today.filter((moment) => typeof moment.fullnessLevel === 'number' && Number.isFinite(moment.fullnessLevel)).length,
    mainMeals.filter((moment) => (moment.nutrition?.protein ?? 0) >= 20).length,
  ];
  return INITIAL_COACHING_GOALS.map((goal, index) => {
    const current = Math.min(goal.target, observed[index]);
    return { ...goal, current, completed: current >= goal.target };
  });
}

export function getCoachIntentResponse(userQuestion: string, moments: FoodMoment[]): string | null {
  // Normalize common Arabic orthography while preserving Arabizi and mixed-script words.
  // Matching only identifies the topic; it never invents personal observations.
  const q = userQuestion.trim().toLocaleLowerCase()
    .normalize('NFKC')
    .replace(/[\u064b-\u065f\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي');
  const latin = q.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  const today = getLocalDateKey();
  const todayCount = moments.filter((moment) => moment.date === today).length;
  // "I didn't eat much" still reports some food, not an entirely missed day.
  // Handle common Darija, Egyptian and Arabizi quantity negations before no-food intents.
  if (/(?:ما\s*كليتش|مكليتش|ما\s*اكلتش|ما\s*اكلت|ma\s*klitch|maklitch|ma\s*akaltsh)\s*(?:بزاف|كتير|كثير|برشا|bzaf|bezzaf|ktir|kteer|keteer|barsha)(?:\s|$)/u.test(latin))
    return 'فهمت أنك تناولت كمية قليلة اليوم. يمكنك ملاحظة ما تحتاجه الآن دون لوم أو ضغط، ولا أفترض تفاصيل أخرى عن يومك.';
  // "I only ate ..." is not a claim of eating nothing all day.
  if (/(?:ما\s*كليتش|مكليتش|ما\s*اكلتش|ما\s*اكلت|ma\s*klitch|maklitch|ma\s*akaltsh)\s*(?:غير|الا|بس|ghir|gheir|illa|bass|bas)(?:\s|$)/u.test(latin))
    return 'فهمت أنك تناولت شيئًا اليوم. يمكنك ملاحظة ما تحتاجه الآن دون لوم أو ضغط، ولا أفترض تفاصيل أخرى عن يومك.';
  // Explicitly reported skipped meals are not journal summaries or failures.
  // Respond to the user's statement without assuming why they did not eat.
  if (/(?:ما\s*كليتش|مكليتش|ما\s*اكلتش|ما\s*أكلتش|ما\s*اكلت|ما\s*أكلت|ما\s*كلتش|ma\s*klitch|maklitch|ma\s*akaltsh|ma\s*akalt|ma\s*klit(?:ch)?)/.test(latin))
    return 'فهمت أنك لم تأكل اليوم. يمكنك الانتباه لما تحتاجه الآن، واختيار ما يناسبك دون لوم أو ضغط. لا أفترض سبب ذلك من رسالتك.';
  // Missing one named meal does not mean the person ate nothing all day.
  // Preserve the distinction even when a day word appears in the message.
  if (/(?:ما\s*فطرتش|مفطرتش|ما\s*تغديتش|متغديتش|ما\s*تعشيتش|متعشيتش|ma\s*ftartch|ma\s*tghdditch|ma\s*t3chitch)/.test(latin))
    return 'فهمت أنك لم تتناول إحدى الوجبات. لا يعني ذلك شيئًا عن بقية يومك. يمكنك اختيار ما يناسبك الآن دون لوم أو ضغط.';
  // Loss of appetite is a personal observation, not a failed goal or a journal recap.
  // Recognize common Egyptian, Levantine, Gulf and Darija/Arabizi wording first.
  if (/(?:ما\s*عندي(?:ش)?\s*شهي[هة]|ما\s*عنديش\s*نفس|مش\s*نفسي\s*اكل|مالي\s*نفس\s*اكل|ma\s*3andich\s*chahiya|ma\s*3ndich\s*chahiya|machi\s*jay3|ma\s*jay3ch|مش\s*جعان(?:ة)?|ماني\s*جوعان(?:ة)?|مو\s*جوعان(?:ة)?)/.test(latin))
    return 'تتغيّر الشهية من يوم لآخر. إن أحببت، لاحظ ما يناسبك الآن دون ضغط أو لوم، ولا يلزمك تسجيل شيء.';
  // A time word must not override an explicit feeling: «اليوم أنا جعانة» asks for support, not a meal recap.
  const feelingIntent = /نوم|نعاس|ننعس|تعب|عيان|نعسان|مرهق|تعبان|تعبانة|دايخ|n3as|n3ass|3yan|3yane|na3s|sleep|جوع|جائع|جيعان|جوعان|جوعانة|جعان|جعانة|يوعان|شهية|حلو|سكر|jou3|jo3|ji3an|joo3|mjou3|شبع|شبعت|شبعان|شبعانة|chba3|chb3t|chba3t/;
  if (!feelingIntent.test(latin) && /اليوم|نهار|النهاردة|النهارده|النهار دا|النهار ده|naharda|ennaharda|تحليل|ملخص|تقرير|شنو كليت|اش كليت|واش كليت|lyoum|nhar|lyom|nhari|chno klit|ach klit|wach klit|شو اكلت|ايش اكلت|وش اكلت|شنو اكلت|اكلت ايه|akalt eh|shoo akalt|esh akalt|heute|analyse|bilanz/.test(latin)) {
    return todayCount === 0
      ? 'لا توجد وجبات مسجلة اليوم بعد. يمكنك إضافة وجبة عندما يناسبك، دون أي ضغط.'
      : `سجّلت اليوم ${todayCount} ${todayCount === 1 ? 'وجبة' : 'وجبات'}. يمكنك مراجعة ملاحظاتك وإضافة ما شعرت به إن أحببت.`;
  }
  if (/نوم|نعاس|ننعس|تعب|عيان|نعسان|مرهق|تعبان|تعبانة|دايخ|n3as|n3ass|3yan|3yane|na3s|sleep|schlaf|alarm|warn/.test(latin))
    return 'إذا كان يومك متعبًا، يمكنك أخذ قسط من الراحة حسب ظروفك. لا يمكنني استنتاج حالتك الصحية من سجل الوجبات.';
  if (/جوع|جائع|جيعان|جوعان|جوعانة|جعان|جعانة|يوعان|شهية|حلو|سكر|jou3|jo3|ji3an|jوع|joo3|mjou3|heißhunger|süß/.test(latin))
    return 'تغيّر الشهية أمر طبيعي. إن أحببت، لاحظ ما تشعر به واختر ما يناسبك دون لوم.';
  if (/بروتين|protein|proteine|eiweiß|عدس|حمص|3dess|3des|7oms|l3des/.test(latin))
    return 'يمكنك استكشاف مصادر البروتين التي تحبها، مثل العدس والحمص والبيض، حسب تفضيلاتك.';
  if (/شبع|شبعت|شبعان|شبعانة|كمية|وجبة|chba3|chb3t|chba3t|chb3|portion|sättigung/.test(latin))
    return 'لكل شخص تجربة مختلفة مع الشبع. يمكنك ملاحظة إحساسك أثناء الطعام دون قواعد صارمة.';
  return null;
}

export function getCoachChatResponse(userQuestion: string, moments: FoodMoment[]): string {
  return getCoachIntentResponse(userQuestion, moments)
    ?? 'أهلًا بك. يمكننا التحدث عن وجباتك أو شعورك بالجوع والشبع أو راحتك اليوم، بالوتيرة التي تناسبك.';
}
