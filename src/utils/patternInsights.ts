import { DailyCheckIn, FoodMoment } from '../types';

export type PatternConfidence = 'Hinweis' | 'Tendenz' | 'Muster';

export type CaryPatternInsight = {
  id: string;
  title: string;
  observation: string;
  experiment: string;
  confidence: PatternConfidence;
  evidenceCount: number;
};

const isDemoMoment = (m: FoodMoment) => /^moment-\d{1,2}$/.test(m.id);
const isDemoCheckIn = (c: DailyCheckIn) => /^checkin-\d{1,2}$/.test(c.id);

export function confidenceForEvidence(count: number): PatternConfidence {
  if (count >= 7) return 'Muster';
  if (count >= 4) return 'Tendenz';
  return 'Hinweis';
}

export function buildPatternInsights(moments: FoodMoment[], checkIns: DailyCheckIn[]): CaryPatternInsight[] {
  const realMoments = moments.filter((m) => !isDemoMoment(m));
  const realChecks = checkIns.filter((c) => !isDemoCheckIn(c));
  const insights: CaryPatternInsight[] = [];

  const shortSleep = realChecks.filter((c) => typeof c.sleep?.durationHours === 'number' && c.sleep.durationHours < 7);
  const lowEnergyAfterShortSleep = shortSleep.filter((sleepCheck) => {
    const sameDayChecks = realChecks.filter((c) => c.date === sleepCheck.date && c.timeOfDay !== 'morning');
    return sameDayChecks.some((c) => (c.wellbeing?.energyLevel || 5) <= 2);
  });
  if (shortSleep.length >= 2) {
    const ratio = lowEnergyAfterShortSleep.length / shortSleep.length;
    insights.push({
      id: 'sleep-energy',
      title: 'Schlaf → Energie',
      observation: ratio >= 0.5
        ? `Nach kürzeren Nächten war deine spätere Energie an ${lowEnergyAfterShortSleep.length} von ${shortSleep.length} beobachteten Tagen niedrig.`
        : `Cary hat ${shortSleep.length} kürzere Nächte gesehen, aber bisher kein stabiles Energietief danach.`,
      experiment: 'Beobachte an der nächsten kurzen Nacht besonders deine Energie am frühen Nachmittag.',
      confidence: confidenceForEvidence(shortSleep.length),
      evidenceCount: shortSleep.length,
    });
  }

  const rushed = realMoments.filter((m) => m.eatingPace === 'rushed');
  const rushedSluggish = rushed.filter((m) => m.energyAfter === 'sluggish');
  if (rushed.length >= 2) {
    insights.push({
      id: 'pace-energy',
      title: 'Esstempo → Gefühl danach',
      observation: rushedSluggish.length
        ? `Bei ${rushedSluggish.length} von ${rushed.length} schnellen Mahlzeiten hast du dich danach eher träge gefühlt.`
        : `Du hast ${rushed.length} schnelle Mahlzeiten festgehalten; ein klares Tief danach zeigt sich noch nicht.`,
      experiment: 'Nimm dir bei einer ähnlichen Mahlzeit fünf Minuten mehr und vergleiche dein Gefühl danach.',
      confidence: confidenceForEvidence(rushed.length),
      evidenceCount: rushed.length,
    });
  }

  const lunches = realMoments.filter((m) => m.category === 'lunch' && /^\d{2}:\d{2}$/.test(m.time || ''));
  const lateLunches = lunches.filter((m) => Number(m.time.slice(0, 2)) >= 14);
  if (lunches.length >= 3) {
    insights.push({
      id: 'lunch-rhythm',
      title: 'Mittag → Rhythmus',
      observation: lateLunches.length >= Math.ceil(lunches.length / 2)
        ? `Dein Mittagessen liegt häufig spät: ${lateLunches.length} von ${lunches.length} Einträgen waren ab 14 Uhr.`
        : `Dein Mittagessen liegt bisher überwiegend vor 14 Uhr und wirkt zeitlich recht stabil.`,
      experiment: 'Achte an einem späteren und einem früheren Mittag auf Hunger und Energie zwei Stunden danach.',
      confidence: confidenceForEvidence(lunches.length),
      evidenceCount: lunches.length,
    });
  }

  const distracted = realMoments.filter((m) => m.distraction && m.distraction !== 'mindful');
  if (distracted.length >= 2) {
    const highFullness = distracted.filter((m) => (m.fullnessLevel || 0) >= 4);
    insights.push({
      id: 'distraction-fullness',
      title: 'Ablenkung → Sättigung',
      observation: highFullness.length
        ? `Bei ${highFullness.length} von ${distracted.length} abgelenkten Mahlzeiten war deine Sättigung danach eher hoch.`
        : `Cary sieht Ablenkung beim Essen, aber noch keinen wiederkehrenden Zusammenhang mit deiner Sättigung.`,
      experiment: 'Iss eine vergleichbare Mahlzeit einmal ohne Bildschirm und prüfe, ob sich dein Sättigungsgefühl verändert.',
      confidence: confidenceForEvidence(distracted.length),
      evidenceCount: distracted.length,
    });
  }

  if (insights.length === 0) {
    const total = realMoments.length + realChecks.length;
    insights.push({
      id: 'learning',
      title: 'Cary lernt noch',
      observation: total === 0
        ? 'Noch fehlen echte Alltagseinträge. Ein paar kurze Momente reichen, damit Cary anfangen kann zu vergleichen.'
        : `Du hast ${total} echte Datenpunkte. Für faire Vergleiche braucht Cary noch ähnliche Situationen über mehrere Tage.`,
      experiment: 'Halte heute nur das fest, was ohnehin passiert. Cary braucht keine perfekten Tage.',
      confidence: 'Hinweis',
      evidenceCount: total,
    });
  }

  return insights.slice(0, 4);
}
