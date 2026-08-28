export type MomentCategory =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'dessert'
  | 'coffee'
  | 'drinks'
  | 'travel';

export interface MomentLabelDefinition {
  key: MomentCategory;
  label: string;
  labelEn: string;
  icon: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  defaultTimeRange: string;
}

export type FoodMood = 'energized' | 'satisfied' | 'light' | 'indulgent' | 'comfort' | 'joyful';

export interface MoodDefinition {
  key: FoodMood;
  label: string;
  emoji: string;
  description: string;
}

export type EatingPace = 'slow' | 'moderate' | 'rushed';
export type DistractionLevel = 'mindful' | 'screen' | 'work' | 'social';
export type EnergyLevelAfter = 'energized' | 'neutral' | 'sluggish' | 'heavy';

export interface CoachFeedback {
  title: string;
  message: string;
  type: 'praise' | 'tip' | 'insight' | 'warning';
  badge: string;
  habitScore?: number;
}

export interface FoodMoment {
  id: string;
  title: string;
  label: string; // The core moment.label (e.g. "Frühstück", "Mittagessen", etc.)
  category: MomentCategory;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
  locationCategory: 'home' | 'restaurant' | 'cafe' | 'travel' | 'takeaway';
  imageUrl: string;
  rating: number; // 1-5
  mood: FoodMood;
  hungerLevel?: number; // 1-5 (1: hardly hungry, 5: ravenous)
  fullnessLevel?: number; // 1-5 (1: still hungry, 3: comfortable, 5: overstuffed)
  eatingPace?: EatingPace;
  distraction?: DistractionLevel;
  energyAfter?: EnergyLevelAfter;
  coachFeedback?: CoachFeedback;
  notes?: string;
  tags: string[];
  isFavorite?: boolean;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  price?: string;
  companions?: string; // With who
  createdAt: number;
}

export type ActiveTab = 'today' | 'coach' | 'type_analysis' | 'timeline' | 'calendar' | 'stats' | 'favorites';

export type TimeOfDayPhase = 'morning' | 'midday' | 'evening';

export interface DailyCheckIn {
  id: string;
  date: string;
  time: string;
  timeOfDay: TimeOfDayPhase;
  sleep?: {
    durationHours: number;
    quality: number; // 1-5
    wakeFeeling: 'refreshed' | 'normal' | 'tired' | 'exhausted';
  };
  food?: {
    mealTitle: string;
    category: MomentCategory;
    hungerBefore: number; // 1-5
    fullnessAfter: number; // 1-5
    eatingPace: EatingPace;
    distraction: DistractionLevel;
  };
  wellbeing: {
    energyLevel: number; // 1-5
    mood: FoodMood;
    stressLevel: number; // 1-5
    waterGlasses?: number;
    note?: string;
    voiceTranscription?: string;
  };
  coachSummary?: string;
  createdAt: number;
}

export type NutritionArchetype =
  | 'intuitive_mindful'
  | 'protein_performer'
  | 'stress_craver'
  | 'circadian_rhythm'
  | 'carb_sensitive'
  | 'intermittent_balancer';

export interface NutritionTypeProfile {
  id: string;
  archetype: NutritionArchetype;
  typeName: string;
  subtitle: string;
  badge: string;
  confidenceScore: number; // 0-100%
  unlocked: boolean;
  dataPointsNeeded: number;
  dataPointsCurrent: number;
  description: string;
  traits: {
    name: string;
    score: number;
    max: number;
    label: string;
    color: string;
  }[];
  dos: string[];
  donts: string[];
  recommendedFocus: string;
  sleepNutritionCorrelation: string;
  optimalMealTiming: string;
}

export interface CoachingGoal {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  unit: string;
  category: 'mindful' | 'nutrition' | 'habits';
  completed: boolean;
  icon: string;
}

export interface CoachChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

export interface FilterState {
  searchQuery: string;
  selectedCategory: MomentCategory | 'all';
  selectedDateRange: 'all' | 'today' | 'this_week' | 'this_month';
  selectedMood: FoodMood | 'all';
  onlyFavorites: boolean;
  minRating: number;
  selectedTag: string | 'all';
}

