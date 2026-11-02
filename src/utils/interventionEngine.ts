import { FoodMoment, DailyCheckIn, NutritionArchetype } from '../types';
import { getLocalDateKey } from './dateKey';

export type AlarmSeverity = 'high' | 'medium' | 'info';

export interface NutritionAlarm {
  id: string;
  triggerKey: string;
  severity: AlarmSeverity;
  title: string;
  subtitle: string;
  archetype: NutritionArchetype;
  reason: string;
  recommendation: string;
  actionableStep: string;
  timestamp: string;
  isResolved?: boolean;
}

export interface GuardianStatus {
  hasAlarms: boolean;
  activeAlarms: NutritionAlarm[];
  statusText: string;
  statusBadge: 'green' | 'amber' | 'red';
  lastEvaluated: string;
}

/**
 * Evaluates user's recent data for physiological alarm signals,
 * tailored to their dominant nutrition archetype.
 *
 * Alarm IDs identify the source occurrence, not the evaluation run. This is
 * important because acknowledgements are persisted by alarm ID: re-evaluating
 * the same check-in/moment after a reload must produce the same ID, while a
 * later source occurrence must remain independently actionable.
 */
// Imported or older check-ins can lack a clock time. Compare available
// timestamps without crashing or inventing a time for missing observations.
const compareRecentCheckIns = (a: DailyCheckIn, b: DailyCheckIn): number => {
  // Older imports may contain malformed timestamps or non-string time values.
  // Invalid values are unknown, not a reason to crash or outrank valid reports.
  const createdAt = (entry: DailyCheckIn) =>
    typeof entry.createdAt === 'number' && Number.isFinite(entry.createdAt) ? entry.createdAt : 0;
  // Reject impossible imported times (e.g. 99:99) so stale entries cannot outrank recovery.
  const clockTime = (entry: DailyCheckIn) =>
    typeof entry.time === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(entry.time) ? entry.time : '';
  const aTime = clockTime(a);
  const bTime = clockTime(b);
  // A backfilled record may have a later import timestamp but an earlier
  // observation clock. When both clocks are valid, honor the person's actual
  // sequence so an older concern cannot hide a later recovery.
  if (aTime && bTime) return bTime.localeCompare(aTime) || createdAt(b) - createdAt(a);
  // An impossible imported clock must not outrank a valid observed time.
  if (aTime && typeof b.time === 'string' && b.time.length > 0) return -1;
  if (bTime && typeof a.time === 'string' && a.time.length > 0) return 1;
  // Older records without a clock still retain their creation-time fallback.
  return createdAt(b) - createdAt(a) || bTime.localeCompare(aTime);
};

// Imported sleep reports can contain corrupted fields. A wholly invalid later
// record must not hide an earlier, usable observation or create a false prompt.
const isValidSleepDuration = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 24;
const isValidSleepQuality = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5;
const isValidWakeFeeling = (value: unknown): value is 'refreshed' | 'normal' | 'tired' | 'exhausted' =>
  value === 'refreshed' || value === 'normal' || value === 'tired' || value === 'exhausted';

export function evaluateNutritionAlarms(
  moments: FoodMoment[],
  checkIns: DailyCheckIn[],
  archetype: NutritionArchetype = 'intuitive_mindful',
  evaluationTime: Date = new Date(),
  allowSyntheticDemo = false,
): GuardianStatus {
  const alarms: NutritionAlarm[] = [];
  // A demo may use a representative afternoon clock; real journal evaluation
  // continues to use the actual local time by default.
  const now = evaluationTime;
  const today = getLocalDateKey(now);
  // Only today's entries can prompt "today" suggestions. Historical and future
  // journal records remain untouched and discoverable in their own views.
  // The explicit simulator uses a legacy "Heute" marker; never interpret
  // that marker as a real user's date.
  const currentLocalClock = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const isCurrent = (entry: { id: string; date: string; time?: unknown }) => {
    // A personal import may also have an ID starting with sim-. Only the
    // explicitly activated demo may bypass the observed local clock or use
    // the legacy "Heute" marker. Normal journal entries never get this pass.
    if (allowSyntheticDemo && entry.id.startsWith('sim-')) return entry.date === today || entry.date === 'Heute';
    if (entry.date !== today) return false;
    // A future local clock on a same-day import is not an observation yet.
    // Preserve legacy records without a valid clock rather than guessing.
    const clock = typeof entry.time === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(entry.time)
      ? entry.time : null;
    return clock === null || clock <= currentLocalClock;
  };
  const todayCheckIns = checkIns.filter(isCurrent);
  // A later midday/evening check-in may omit sleep; use the most recent
  // actual sleep entry rather than treating an omitted field as no sleep data.
  // Sleep can be corrected later in the day. Use the latest explicit sleep
  // report, regardless of persisted array order; an unrelated midday check-in
  // without sleep must not erase the last actual sleep observation.
  const latestSleepCheckIn = todayCheckIns
    .filter(checkIn => {
      const sleep = checkIn.sleep;
      return sleep && (isValidSleepDuration(sleep.durationHours)
        || isValidSleepQuality(sleep.quality) || isValidWakeFeeling(sleep.wakeFeeling));
    })
    .sort(compareRecentCheckIns)[0];
  // Imported and edited meal histories are not guaranteed newest-first.
  // Use the meal's actual local time when both entries have one, rather than
  // storage order or a later backfill timestamp. Keep legacy records safe by
  // falling back to creation time, and never mutate the journal array.
  // Reject impossible imported meal clocks so stale suggestions do not override recovery.
  const validMealClock = (time: unknown): string =>
    typeof time === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time) ? time : '';
  const malformedMealClock = (time: unknown): boolean =>
    typeof time === 'string' && time.length > 0 && !validMealClock(time);
  const recentMoments = moments.filter(isCurrent).sort((a, b) => {
    const aTime = validMealClock(a.time);
    const bTime = validMealClock(b.time);
    if (aTime && bTime) return bTime.localeCompare(aTime);
    if (malformedMealClock(a.time) && bTime) return 1;
    if (malformedMealClock(b.time) && aTime) return -1;
    const aCreated = typeof a.createdAt === 'number' && Number.isFinite(a.createdAt) ? a.createdAt : 0;
    const bCreated = typeof b.createdAt === 'number' && Number.isFinite(b.createdAt) ? b.createdAt : 0;
    return bCreated - aCreated;
  }).slice(0, 3);
  const currentHour = now.getHours();

  if (latestSleepCheckIn?.sleep) {
    const { durationHours, wakeFeeling, quality } = latestSleepCheckIn.sleep;
    // Imported/legacy sleep fields may contain impossible values. Do not
    // turn corrupted data into a health prompt or repeat it back as a fact.
    const sleepHours = isValidSleepDuration(durationHours) ? durationHours : null;
    const sleepQuality = isValidSleepQuality(quality) ? quality : null;
    const validWakeFeeling = isValidWakeFeeling(wakeFeeling) ? wakeFeeling : null;
    if ((sleepHours !== null && sleepHours < 6)
      || validWakeFeeling === 'exhausted'
      || (sleepQuality !== null && sleepQuality <= 2)) {
      // Only reflect observations that are plausible and explicitly recorded.
      const wakeDescriptions = {
        refreshed: 'منتعش',
        normal: 'كالمعتاد',
        tired: 'متعب',
        exhausted: 'مرهق',
      } as const;
      const sleepSummary = [
        sleepHours !== null ? `سجّلت ${sleepHours} ساعات نوم` : null,
        validWakeFeeling ? `شعورك عند الاستيقاظ: ${wakeDescriptions[validWakeFeeling]}` : null,
        sleepQuality !== null ? `تقييم جودة النوم: ${sleepQuality} من 5` : null,
      ].filter(Boolean).join('، ');
      let archetypeAdvice = '';
      if (archetype === 'protein_performer') {
        archetypeAdvice = 'إذا شعرت بالجوع، جرّب وجبة خفيفة مشبعة تناسبك، مثل الزبادي أو المكسرات.';
      } else if (archetype === 'circadian_rhythm') {
        archetypeAdvice = 'إذا أمكن، خذ استراحة قصيرة في ضوء النهار، واختر ما يساعدك على الراحة.';
      } else if (archetype === 'intermittent_balancer') {
        archetypeAdvice = 'استمع إلى جوعك؛ يمكنك تعديل مواعيد وجباتك بما يلائم احتياجاتك اليوم.';
      } else {
        archetypeAdvice = 'ابدأ يومك بلطف، واشرب ماءً إن رغبت، واختر فطورًا مشبعًا يناسبك.';
      }

      alarms.push({
        id: `alarm-sleep-${latestSleepCheckIn.id}`,
        triggerKey: 'sleep_deficit',
        severity: 'high',
        title: 'قد تحتاج إلى بعض الراحة اليوم',
        subtitle: sleepSummary || 'لحظة للتأمل في نومك اليوم',
        archetype,
        reason: 'قد يؤثر النوم القصير في شعورك بالطاقة والجوع. لا تحتاج إلى تعويض أي شيء؛ انتبه لما يحتاجه جسمك.',
        recommendation: archetypeAdvice,
        actionableStep: 'امنح نفسك استراحة لطيفة، وتناول شيئًا مشبعًا إذا شعرت بالجوع.',
        timestamp: 'هذا الصباح',
      });
    }
  }

  const latestMoment = recentMoments[0];
  if (latestMoment && (latestMoment.eatingPace === 'rushed' || latestMoment.distraction === 'screen')) {
    let archetypeAdvice = '';
    if (archetype === 'intuitive_mindful') {
      archetypeAdvice = 'إذا أحببت، خصّص دقائق هادئة بعد وجبتك بعيدًا عن الشاشة.';
    } else {
      archetypeAdvice = 'لا توجد طريقة واحدة صحيحة لتناول الطعام. يمكنك تجربة لحظة هدوء وملاحظة شعورك بالشبع دون حكم.';
    }

    // Legacy/photo imports may omit the meal title. Keep guidance readable
    // without inventing a dish; preserve a real Arabic/Arabizi title as entered.
    const mealName = typeof latestMoment.title === 'string' && latestMoment.title.trim()
      ? `«${latestMoment.title.trim()}»` : 'وجبتك';
    alarms.push({
      id: `alarm-mindless-${latestMoment.id}`,
      triggerKey: 'distracted_meal',
      severity: 'medium',
      title: 'لحظة هدوء بعد وجبتك',
      subtitle: `تناولت ${mealName} بينما كان انتباهك مشغولًا`,
      archetype,
      reason: 'من الطبيعي أن نأكل أحيانًا ونحن منشغلون. إن رغبت، لاحظ كيف تشعر الآن دون لوم.',
      recommendation: archetypeAdvice,
      actionableStep: 'خذ نفسًا هادئًا، واسترح قليلًا إذا كان ذلك يناسبك.',
      timestamp: validMealClock(latestMoment.time) || 'منذ قليل',
    });
  }

  const isAfternoon = currentHour >= 13 && currentHour <= 17;
  // The latest explicit energy check-in is the person's current report. An
  // earlier low-energy entry must not keep prompting after they feel better.
  // Sort a copy because imported/persisted history is not guaranteed newest-first.
  // Legacy imports may contain out-of-range energy scores. Treat those as
  // unknown rather than inventing low energy or masking a valid earlier report.
  const isValidEnergyLevel = (value: unknown): value is number =>
    typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5;
  const latestEnergyCheckIn = todayCheckIns
    .filter(c => isValidEnergyLevel(c.wellbeing?.energyLevel))
    .sort(compareRecentCheckIns)[0];
  const lowEnergyCheckIn = latestEnergyCheckIn && latestEnergyCheckIn.wellbeing.energyLevel! <= 2
    ? latestEnergyCheckIn : undefined;
  // A meal's earlier sluggish feeling should not override a later, explicit
  // report that energy has recovered. Preserve guidance when the sluggish
  // meal happened after the check-in instead. Use recorded local times when
  // available, falling back to creation timestamps for legacy entries.
  const recoveredAfterMoment = (moment: FoodMoment) => {
    if (!latestEnergyCheckIn || latestEnergyCheckIn.wellbeing.energyLevel! <= 2) return false;
    const checkInTime = validMealClock(latestEnergyCheckIn.time);
    const momentTime = validMealClock(moment.time);
    if (checkInTime && momentTime) {
      return checkInTime > momentTime;
    }
    // A corrupted clock on the supposed recovery check-in is not proof that
    // the person felt better after this meal. Missing legacy clocks may still
    // use creation timestamps, but impossible recorded times must not silence
    // a genuine post-meal low-energy report.
    if (latestEnergyCheckIn.time != null && latestEnergyCheckIn.time !== '' && !checkInTime) return false;
    return Number.isFinite(latestEnergyCheckIn.createdAt) && Number.isFinite(moment.createdAt)
      && latestEnergyCheckIn.createdAt >= moment.createdAt;
  };
  // Only the most recent explicitly reported post-meal energy reflects how
  // the person feels now. An older sluggish meal must not prompt again after
  // a later meal where they reported feeling steady, even if imports are unsorted.
  // Missing or malformed energy fields are not invented as a recovery report.
  const latestReportedMealEnergy = recentMoments.find(m =>
    m.energyAfter === 'energized' || m.energyAfter === 'neutral'
    || m.energyAfter === 'sluggish' || m.energyAfter === 'heavy',
  );
  const lowEnergyMoment = latestReportedMealEnergy?.energyAfter === 'sluggish'
    && !recoveredAfterMoment(latestReportedMealEnergy)
    ? latestReportedMealEnergy : undefined;
  // A later, explicitly steady post-meal report supersedes an earlier low-energy
  // check-in. Do not keep nudging someone after they say they feel better.
  // Compare observed local clocks before import timestamps; an invalid clock
  // cannot be used as evidence of recovery.
  const mealReportsRecoveryAfterCheckIn = (moment: FoodMoment, checkIn: DailyCheckIn): boolean => {
    const mealTime = validMealClock(moment.time);
    const checkInTime = validMealClock(checkIn.time);
    if (mealTime && checkInTime) return mealTime > checkInTime;
    if ((moment.time != null && moment.time !== '' && !mealTime)
      || (checkIn.time != null && checkIn.time !== '' && !checkInTime)) return false;
    return typeof moment.createdAt === 'number' && Number.isFinite(moment.createdAt)
      && typeof checkIn.createdAt === 'number' && Number.isFinite(checkIn.createdAt)
      && moment.createdAt > checkIn.createdAt;
  };
  const currentLowEnergyCheckIn = lowEnergyCheckIn && latestReportedMealEnergy
    && (latestReportedMealEnergy.energyAfter === 'neutral' || latestReportedMealEnergy.energyAfter === 'energized')
    && mealReportsRecoveryAfterCheckIn(latestReportedMealEnergy, lowEnergyCheckIn)
    ? undefined : lowEnergyCheckIn;

  if (isAfternoon && (currentLowEnergyCheckIn || lowEnergyMoment)) {
    let archetypeAdvice = '';
    if (archetype === 'protein_performer') {
      archetypeAdvice = 'إذا كنت جائعًا، اختر وجبة خفيفة تستمتع بها وتمنحك شعورًا بالشبع.';
    } else if (archetype === 'circadian_rhythm') {
      archetypeAdvice = 'قد يساعدك المشي الخفيف أو الجلوس في ضوء النهار إذا كان ذلك مناسبًا لك.';
    } else {
      archetypeAdvice = 'جرّب شرب الماء أو أخذ استراحة قصيرة، واستمع لما يحتاجه جسمك.';
    }
    const sourceOccurrenceId = currentLowEnergyCheckIn ? `checkin-${currentLowEnergyCheckIn.id}` : `moment-${lowEnergyMoment!.id}`;
    alarms.push({
      id: `alarm-afternoon-crash-${sourceOccurrenceId}`,
      triggerKey: 'afternoon_crash',
      severity: 'high',
      title: 'مساحة صغيرة لاستعادة نشاطك',
      // Describe the observation actually supplied: a post-meal feeling is not
      // a numeric low-energy check-in. Keep suggestions factual and gentle.
      subtitle: currentLowEnergyCheckIn
        ? 'سجّلت مستوى طاقة منخفضًا اليوم'
        : 'ذكرت أنك شعرت بقلة النشاط بعد وجبتك',
      archetype,
      reason: 'قد تتغير طاقتنا خلال اليوم لأسباب كثيرة. لا يعني ذلك أنك فعلت شيئًا خاطئًا.',
      recommendation: archetypeAdvice,
      actionableStep: 'إن أحببت، خذ استراحة لطيفة أو تمشَّ قليلًا.',
      timestamp: 'الآن',
    });
  }

  // Meal timing and fullness alone are not health alarms. Late family dinners,
  // Ramadan schedules, and other regional routines can be entirely normal.
  // Never turn an evening meal into unsolicited corrective guidance.

  if (alarms.length === 0) {
    return {
      hasAlarms: false,
      activeAlarms: [],
      statusText: 'كل يوم له إيقاعه الخاص. نحن هنا لنرافقك بلطف.',
      statusBadge: 'green',
      lastEvaluated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  const hasHighSeverity = alarms.some(a => a.severity === 'high');
  return {
    hasAlarms: true,
    activeAlarms: alarms,
    statusText: hasHighSeverity
      ? `${alarms.length} اقتراحات لطيفة للاهتمام بنفسك`
      : `${alarms.length} أفكار بسيطة ليومك`,
    statusBadge: 'amber',
    lastEvaluated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
