import { getLocalDateKey } from './dateKey';

/** A private, device-local identifier. Never derived from meals, health data or profile text. */
export const HEART_NOTE_SEED_KEY = 'rhythm_heart_note_seed_v1';
export const HEART_NOTE_OFFLINE_SEED = 'offline-visitor';

/** Reviewed, non-religious Arabic microcopy. Prime-length cycle avoids repeats for 31 local days. */
export const HEART_NOTES = [
  "كل خطوة هادئة تقرّبك من يوم يشبهك.",
  "ليس عليك أن تُنجز كل شيء لتستحق الراحة.",
  "امنح نفسك اليوم لطفًا يشبه لطفك بالآخرين.",
  "البدايات الصغيرة تفتح أبوابًا واسعة.",
  "في التفاصيل البسيطة مساحة للفرح.",
  "خذ وقتك؛ الأشياء الجميلة لا تستعجل.",
  "يكفي أن تُصغي إلى نفسك قليلًا.",
  "اليوم فرصة جديدة، لا امتحان جديد.",
  "بعض الأيام تحتاج دفئًا أكثر من الخطط.",
  "يمكنك أن تبدأ من حيث أنت.",
  "حتى الهدوء شكل من أشكال التقدّم.",
  "لا تقارن إيقاعك بإيقاع أحد.",
  "في كل يوم سبب صغير للامتنان.",
  "دع لخطواتك مساحة للتنفّس.",
  "الراحة جزء من الرحلة، وليست توقفًا عنها.",
  "الأشياء الطيبة تبدأ بانتباه بسيط.",
  "اختر اليوم ما يخفّف عن قلبك.",
  "لا تحتاج لحظة جميلة إلى مناسبة.",
  "لطفك بنفسك يصنع فرقًا هادئًا.",
  "أحيانًا يكفي أن تبتسم لشيء صغير.",
  "ما فات أمس لا يحدّد جمال اليوم.",
  "كل صباح يحمل احتمالًا لطيفًا.",
  "في البطء أحيانًا حكمة لا نراها.",
  "امنح يومك بداية على مهل.",
  "الاهتمام بنفسك فعل محبة يومي.",
  "ليس كل تقدّم ظاهرًا للعين.",
  "أنت تستحق لحظة هدوء وسط الزحام.",
  "احتفظ بمساحة لما يسعدك.",
  "حين تصغي لجسدك، تفهم احتياجاتك بلطف.",
  "الخطوات الصغيرة تصنع حكايات جميلة.",
  "دع اليوم يكون بسيطًا كما يحتاج."
] as const;

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Stable for a given installation and calendar date; no network, analytics or personal data. */
export function selectDailyHeartNote(seed: string, localDate: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate)) throw new Error('Invalid local date');
  const [year, month, day] = localDate.split('-').map(Number);
  const ordinal = Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
  const start = hashSeed(seed) % HEART_NOTES.length;
  // 31 is prime, so every stride from 1..30 visits all notes before repeating.
  const stride = 1 + (hashSeed(seed + '|stride') % (HEART_NOTES.length - 1));
  const index = (start + (ordinal % HEART_NOTES.length) * stride) % HEART_NOTES.length;
  return HEART_NOTES[index];
}

export function getDailyHeartNote(seed: string, now: Date, timeZone?: string): string {
  return selectDailyHeartNote(seed, getLocalDateKey(now, timeZone));
}

/** Falls back safely when local storage is unavailable (private browsing, blocked storage). */
export function getOrCreateHeartNoteSeed(storage: Pick<Storage, 'getItem' | 'setItem'>): string {
  try {
    const stored = storage.getItem(HEART_NOTE_SEED_KEY);
    if (stored && /^[a-zA-Z0-9-]{8,80}$/.test(stored)) return stored;
    const generated = globalThis.crypto?.randomUUID?.() ??
      'local-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
    storage.setItem(HEART_NOTE_SEED_KEY, generated);
    return generated;
  } catch {
    return HEART_NOTE_OFFLINE_SEED;
  }
}
