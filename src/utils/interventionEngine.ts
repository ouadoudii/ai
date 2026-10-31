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
  const clockTime = (entry: DailyCheckIn) =>
    typeof entry.time === 'string' && /^\\d{2}:\\d{2}$/.test(entry.time) ? entry.time : '';
  return createdAt(b) - createdAt(a) || clockTime(b).localeCompare(clockTime(a));
};

export function evaluateNutritionAlarms(
  moments: FoodMoment[],
  checkIns: DailyCheckIn[],
  archetype: NutritionArchetype = 'intuitive_mindful'
): GuardianStatus {
  const alarms: NutritionAlarm[] = [];
  const now = new Date();
  const today = getLocalDateKey(now);
  // Only today's entries can prompt "today" suggestions. Historical and future
  // journal records remain untouched and discoverable in their own views.
  // The explicit simulator uses a legacy "Heute" marker; never interpret
  // that marker as a real user's date.
  const isCurrent = (entry: { id: string; date: string }) =>
    entry.date === today || (entry.id.startsWith('sim-') && entry.date === 'Heute');
  const todayCheckIns = checkIns.filter(isCurrent);
  // A later midday/evening check-in may omit sleep; use the most recent
  // actual sleep entry rather than treating an omitted field as no sleep data.
  // Sleep can be corrected later in the day. Use the latest explicit sleep
  // report, regardless of persisted array order; an unrelated midday check-in
  // without sleep must not erase the last actual sleep observation.
  const latestSleepCheckIn = todayCheckIns
    .filter(checkIn => checkIn.sleep)
    .sort(compareRecentCheckIns)[0];
  // Imported and edited meal histories are not guaranteed newest-first.
  // Use the meal's actual local time when both entries have one, rather than
  // storage order or a later backfill timestamp. Keep legacy records safe by
  // falling back to creation time, and never mutate the journal array.
  const recentMoments = moments.filter(isCurrent).sort((a, b) => {
    const recordedOrder = /^\d{2}:\d{2}$/.test(a.time || '') && /^\d{2}:\d{2}$/.test(b.time || '')
      ? b.time.localeCompare(a.time) : 0;
    return recordedOrder || (b.createdAt || 0) - (a.createdAt || 0);
  }).slice(0, 3);
  const currentHour = now.getHours();

  if (latestSleepCheckIn?.sleep) {
    const { durationHours, wakeFeeling, quality } = latestSleepCheckIn.sleep;
    if (durationHours < 6 || wakeFeeling === 'exhausted' || quality <= 2) {
      // Reflect the person's actual check-in, not an inferred feeling of fatigue.
      // Sleep fields are optional; never display "undefined hours" for a
      // quality-only or wake-feeling-only entry.
      const wakeDescriptions = {
        refreshed: 'منتعش',
        normal: 'كالمعتاد',
        tired: 'متعب',
        exhausted: 'مرهق',
      } as const;
      const sleepSummary = [
        typeof durationHours === 'number' && Number.isFinite(durationHours)
          ? `سجّلت ${durationHours} ساعات نوم` : null,
        wakeFeeling ? `شعورك عند الاستيقاظ: ${wakeDescriptions[wakeFeeling]}` : null,
        typeof quality === 'number' && Number.isFinite(quality)
          ? `تقييم جودة النوم: ${quality} من 5` : null,
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

    alarms.push({
      id: `alarm-mindless-${latestMoment.id}`,
      triggerKey: 'distracted_meal',
      severity: 'medium',
      title: 'لحظة هدوء بعد وجبتك',
      subtitle: `تناولت «${latestMoment.title}» بينما كان انتباهك مشغولًا`,
      archetype,
      reason: 'من الطبيعي أن نأكل أحيانًا ونحن منشغلون. إن رغبت، لاحظ كيف تشعر الآن دون لوم.',
      recommendation: archetypeAdvice,
      actionableStep: 'خذ نفسًا هادئًا، واسترح قليلًا إذا كان ذلك يناسبك.',
      timestamp: latestMoment.time || 'منذ قليل',
    });
  }

  const isAfternoon = currentHour >= 13 && currentHour <= 17;
  // The latest explicit energy check-in is the person's current report. An
  // earlier low-energy entry must not keep prompting after they feel better.
  // Sort a copy because imported/persisted history is not guaranteed newest-first.
  const latestEnergyCheckIn = todayCheckIns
    .filter(c => typeof c.wellbeing?.energyLevel === 'number' && Number.isFinite(c.wellbeing.energyLevel))
    .sort(compareRecentCheckIns)[0];
  const lowEnergyCheckIn = latestEnergyCheckIn && latestEnergyCheckIn.wellbeing.energyLevel! <= 2
    ? latestEnergyCheckIn : undefined;
  // A meal's earlier sluggish feeling should not override a later, explicit
  // report that energy has recovered. Preserve guidance when the sluggish
  // meal happened after the check-in instead. Use recorded local times when
  // available, falling back to creation timestamps for legacy entries.
  const recoveredAfterMoment = (moment: FoodMoment) => {
    if (!latestEnergyCheckIn || latestEnergyCheckIn.wellbeing.energyLevel! <= 2) return false;
    const checkInTime = latestEnergyCheckIn.time;
    if (/^\d{2}:\d{2}$/.test(checkInTime || '') && /^\d{2}:\d{2}$/.test(moment.time || '')) {
      return checkInTime > moment.time;
    }
    return Number.isFinite(latestEnergyCheckIn.createdAt) && Number.isFinite(moment.createdAt)
      && latestEnergyCheckIn.createdAt >= moment.createdAt;
  };
  const lowEnergyMoment = recentMoments.find(m => m.energyAfter === 'sluggish' && !recoveredAfterMoment(m));

  if (isAfternoon && (lowEnergyCheckIn || lowEnergyMoment)) {
    let archetypeAdvice = '';
    if (archetype === 'protein_performer') {
      archetypeAdvice = 'إذا كنت جائعًا، اختر وجبة خفيفة تستمتع بها وتمنحك شعورًا بالشبع.';
    } else if (archetype === 'circadian_rhythm') {
      archetypeAdvice = 'قد يساعدك المشي الخفيف أو الجلوس في ضوء النهار إذا كان ذلك مناسبًا لك.';
    } else {
      archetypeAdvice = 'جرّب شرب الماء أو أخذ استراحة قصيرة، واستمع لما يحتاجه جسمك.';
    }
    const sourceOccurrenceId = lowEnergyCheckIn ? `checkin-${lowEnergyCheckIn.id}` : `moment-${lowEnergyMoment!.id}`;
    alarms.push({
      id: `alarm-afternoon-crash-${sourceOccurrenceId}`,
      triggerKey: 'afternoon_crash',
      severity: 'high',
      title: 'مساحة صغيرة لاستعادة نشاطك',
      subtitle: 'سجّلت مستوى طاقة منخفضًا اليوم',
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
