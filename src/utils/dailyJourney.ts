export type JourneyPhase = 'morning' | 'midday' | 'evening';

export interface JourneyCompletion {
  morning: boolean;
  midday: boolean;
  evening: boolean;
}

export interface JourneyNextStep {
  phase: JourneyPhase;
  catchUp: boolean;
  complete: boolean;
  title: string;
  description: string;
}

export const getJourneyPhase = (hour: number): JourneyPhase => {
  if (hour < 11) return 'morning';
  if (hour < 16) return 'midday';
  return 'evening';
};

export const getEligibleJourneyPhases = (hour: number): JourneyPhase[] => {
  const phase = getJourneyPhase(hour);
  if (phase === 'morning') return ['morning'];
  if (phase === 'midday') return ['morning', 'midday'];
  return ['morning', 'midday', 'evening'];
};

const copy: Record<JourneyPhase, { title: string; description: string }> = {
  morning: {
    title: 'Wie startet dein Tag?',
    description: 'Schlaf, Energie oder Frühstück – ein kurzer Eindruck reicht.',
  },
  midday: {
    title: 'Wie läuft dein Mittag?',
    description: 'Essen, Hunger und Energie helfen Cary, deinen Tagesrhythmus zu verstehen.',
  },
  evening: {
    title: 'Wie endet dein Tag?',
    description: 'Abendessen und Befinden machen den heutigen Rhythmus komplett.',
  },
};

export const getNextJourneyStep = (hour: number, completion: JourneyCompletion): JourneyNextStep => {
  const current = getJourneyPhase(hour);
  const eligible = getEligibleJourneyPhases(hour);
  const missing = eligible.find((phase) => !completion[phase]);

  if (!missing) {
    return {
      phase: current,
      catchUp: false,
      complete: true,
      title: 'Für jetzt ist alles festgehalten.',
      description: 'Cary meldet sich wieder, wenn der nächste Moment im Tag sinnvoll wird.',
    };
  }

  return {
    phase: missing,
    catchUp: missing !== current,
    complete: false,
    title: missing !== current ? `${missing === 'morning' ? 'Der Morgen' : 'Der Mittag'} fehlt noch.` : copy[missing].title,
    description: missing !== current ? `Kurz nachholen genügt. ${copy[missing].description}` : copy[missing].description,
  };
};
