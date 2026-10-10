export type WeekdayMealMoment = {
  title: string;
  category: string;
  date: string;
  tags?: string[];
};

export type WeekdayMealShortcut = {
  title: string;
  observations: number;
  weekday: number;
  category: string;
};

const normalizeTitle = (value: string) => value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();

const localWeekday = (date: string): number | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) return null;
  return parsed.getDay();
};

const isDemo = (moment: WeekdayMealMoment) =>
  (moment.tags ?? []).some(tag => /^(demo|seed)$/i.test(tag.trim()));

export function deriveWeekdayMealShortcut(
  moments: WeekdayMealMoment[],
  targetDate: string,
  category: string,
  minimumObservations = 3,
): WeekdayMealShortcut | null {
  const weekday = localWeekday(targetDate);
  if (weekday === null || minimumObservations < 1) return null;

  const candidates = moments
    .map((moment, index) => ({ moment, index, weekday: localWeekday(moment.date) }))
    .filter(({ moment, weekday: candidateWeekday }) =>
      candidateWeekday === weekday &&
      moment.category === category &&
      !isDemo(moment) &&
      normalizeTitle(moment.title).length > 0,
    );

  const grouped = new Map<string, { count: number; title: string; latestIndex: number }>();
  for (const { moment, index } of candidates) {
    const key = normalizeTitle(moment.title);
    const current = grouped.get(key);
    if (!current) grouped.set(key, { count: 1, title: moment.title.trim(), latestIndex: index });
    else {
      current.count += 1;
      if (index >= current.latestIndex) {
        current.title = moment.title.trim();
        current.latestIndex = index;
      }
    }
  }

  const ranked = [...grouped.values()].sort((a, b) => b.count - a.count || b.latestIndex - a.latestIndex);
  const winner = ranked[0];
  if (!winner || winner.count < minimumObservations) return null;
  if (ranked[1]?.count === winner.count) return null;

  return { title: winner.title, observations: winner.count, weekday, category };
}
