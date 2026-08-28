import { FoodMoment, DailyCheckIn, NutritionArchetype } from '../types';

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
 */
export function evaluateNutritionAlarms(
  moments: FoodMoment[],
  checkIns: DailyCheckIn[],
  archetype: NutritionArchetype = 'intuitive_mindful'
): GuardianStatus {
  const alarms: NutritionAlarm[] = [];
  const latestCheckIn = checkIns[0];
  const recentMoments = moments.slice(0, 3);
  const now = new Date();
  const currentHour = now.getHours();

  // 1. ALARM: Critical Sleep Deficit + Morning Ghrelin Surge
  // Trigger: sleep < 6h or wakeFeeling === 'exhausted' or 'tired'
  if (latestCheckIn?.sleep) {
    const { durationHours, wakeFeeling, quality } = latestCheckIn.sleep;
    if (durationHours < 6 || wakeFeeling === 'exhausted' || quality <= 2) {
      let archetypeAdvice = '';
      if (archetype === 'protein_performer') {
        archetypeAdvice = 'Erhöhe das Protein im Vormittags-Snack auf mind. 20g (z.B. Skyr oder Mandeln), um das erhöhte Ghrelin-Signal (Hungerhormon) zu neutralisieren.';
      } else if (archetype === 'circadian_rhythm') {
        archetypeAdvice = 'Vermeide heute zuckerhaltige Snacks zum Wachwerden. Geh 10 Minuten ans Tageslicht, um den Cortisol-Rhythmus natürlich zu resetten.';
      } else if (archetype === 'intermittent_balancer') {
        archetypeAdvice = 'Wenn der Hunger vor dem Essensfenster (11:30 Uhr) zu stark wird, trinke ungesüßten Grüntee oder Ingwerwasser statt sofort zu brechen.';
      } else {
        archetypeAdvice = 'Trinke direkt ein großes Glas lauwarmes Wasser mit Zitrone und plane ein ausgewogenes Frühstück mit komplexen Kohlenhydraten und Eiweiß ein.';
      }

      alarms.push({
        id: `alarm-sleep-${Date.now()}`,
        triggerKey: 'sleep_deficit',
        severity: 'high',
        title: '⚠️ Erhöhtes Heißhunger-Risiko durch Schlafmangel',
        subtitle: `Nur ${durationHours}h Schlaf & Gefühl "${wakeFeeling === 'exhausted' ? 'Erschöpft' : 'Müde'}" registriert`,
        archetype,
        reason: 'Schlafmangel erhöht das Hungerhormon Ghrelin um bis zu 28% und senkt Leptin. Dein Körper verlangt heute instinktiv nach schnellen Kalorien.',
        recommendation: archetypeAdvice,
        actionableStep: 'Kaffee erst 90 Min nach dem Aufwachen + proteinreicher Vormittags-Snack.',
        timestamp: 'Heute Morgen',
      });
    }
  }

  // 2. ALARM: Screen-Distraction + Gehetztes Essen (Sättigungsverlust)
  // Trigger: Latest meal had eatingPace === 'rushed' OR distraction === 'screen' and fullness >= 4
  const latestMoment = recentMoments[0];
  if (latestMoment && (latestMoment.eatingPace === 'rushed' || latestMoment.distraction === 'screen')) {
    let archetypeAdvice = '';
    if (archetype === 'intuitive_mindful') {
      archetypeAdvice = 'Als intuitiver Typ ist Essen in Ruhe deine Kernstärke. Mache jetzt eine 5-minütige Bildschirmpause und trinke einen beruhigenden Kräutertee.';
    } else {
      archetypeAdvice = 'Der Magen registriert Sättigung erst nach 20 Minuten. Schließe die Mahlzeit jetzt bewusst ab, um ein Überessen zu stoppen.';
    }

    alarms.push({
      id: `alarm-mindless-${Date.now()}`,
      triggerKey: 'distracted_meal',
      severity: 'medium',
      title: '⚠️ Achtsamkeits-Warnung: Gehetzte Mahlzeit am Bildschirm',
      subtitle: `Mahlzeit "${latestMoment.title}" wurde unter Ablenkung eingenommen`,
      archetype,
      reason: 'Ablenkung durch Smartphones blockiert die Signale des Nervus Vagus. Die Gefahr für ein Völlegefühl und Heißhunger nach 2 Stunden steigt.',
      recommendation: archetypeAdvice,
      actionableStep: '5 Minuten aufstehen, tief durchatmen und mindestens 250ml Wasser trinken.',
      timestamp: latestMoment.time || 'Vor kurzem',
    });
  }

  // 3. ALARM: Nachmittags-Tief & Energieabsturz (Blutzucker-Spike)
  // Trigger: energyLevel <= 2 or mood === 'sluggish' between 13:00 and 17:00
  const isAfternoon = currentHour >= 13 && currentHour <= 17;
  const lowEnergyCheckIn = checkIns.find(c => c.wellbeing.energyLevel <= 2);
  const lowEnergyMoment = recentMoments.find(m => m.energyAfter === 'sluggish');

  if (isAfternoon && (lowEnergyCheckIn || lowEnergyMoment)) {
    let archetypeAdvice = '';
    if (archetype === 'protein_performer') {
      archetypeAdvice = 'Kein Zucker-Push! Greif zu einer Handvoll Nüsse oder Edamame für konstante Aminosäuren ohne Insulin-Achterbahn.';
    } else if (archetype === 'circadian_rhythm') {
      archetypeAdvice = 'Mach einen 10-minütigen Schritt-Spaziergang. Die Muskelkontraktion schleust Glukose insulinunabhängig in die Zellen.';
    } else {
      archetypeAdvice = 'Trinke 0,5L kühles Wasser und strecke den Rücken. Oft wird Dehydration fälschlicherweise als Energieloch interpretiert.';
    }

    alarms.push({
      id: `alarm-afternoon-crash-${Date.now()}`,
      triggerKey: 'afternoon_crash',
      severity: 'high',
      title: '⚠️ Akutes Nachmittagstief erkannt',
      subtitle: 'Energielevel ist auf Stufe 1-2/5 gefallen',
      archetype,
      reason: 'Das Mittagessen hat einen starken Blutzuckerabfall provoziert oder deine Adenosin-Rezeptoren blockieren die Konzentration.',
      recommendation: archetypeAdvice,
      actionableStep: 'Kein süßer Riegel – 10 Min Tageslicht-Spaziergang & 2 große Gläser Wasser.',
      timestamp: 'Aktuell',
    });
  }

  // 4. ALARM: Spätes schweres Abendessen (> 20:30 Uhr) mit Völlegefühl
  // Trigger: dinner logged after 20:30 with fullness >= 4 or category === 'dinner'
  const lateDinner = recentMoments.find(m => {
    const hour = parseInt(m.time?.split(':')[0] || '0', 10);
    return hour >= 20 && m.fullnessLevel >= 4;
  });

  if (lateDinner || (currentHour >= 21 && latestMoment?.category === 'dinner' && latestMoment.fullnessLevel >= 4)) {
    alarms.push({
      id: `alarm-late-dinner-${Date.now()}`,
      triggerKey: 'circadian_late_food',
      severity: 'medium',
      title: '⚠️ Schlaf-Regenerations-Bremse: Späte üppige Mahlzeit',
      subtitle: 'Mahlzeit nach 20:00 Uhr mit hoher Sättigungsstufe',
      archetype,
      reason: 'Ein voller Magen nach 20:30 Uhr verhindert das Absinken der Kerntemperatur, was den erholsamen Tiefschlaf und das Wachstumshormon HGH blockiert.',
      recommendation: 'Trinke Kamillen- oder Fencheltee, verzichte auf späte Snacks und plane heute Nacht 30 Minuten länger für die Einschlafphase ein.',
      actionableStep: 'Ab jetzt Küchenschluss & 15 Min aufrechter Spaziergang / Dehnen vor dem Zubettgehen.',
      timestamp: 'Abends',
    });
  }

  // Determine overall guardian status
  if (alarms.length === 0) {
    return {
      hasAlarms: false,
      activeAlarms: [],
      statusText: '🟢 Alles im grünen Bereich: Keine Alarmzeichen erkannt. Dein Rhythmus ist optimal synchronisiert.',
      statusBadge: 'green',
      lastEvaluated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  const hasHighSeverity = alarms.some(a => a.severity === 'high');

  return {
    hasAlarms: true,
    activeAlarms: alarms,
    statusText: hasHighSeverity
      ? `🔴 ${alarms.length} aktives Alarmzeichen erfordert gezielte Intervention`
      : `🟡 ${alarms.length} Optimierungsimpuls für deinen Tag erkannt`,
    statusBadge: hasHighSeverity ? 'red' : 'amber',
    lastEvaluated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
