export type SupportedLanguage = 'en' | 'ar';

export interface Translations {
  // Brand & General
  appName: string;
  appTagline: string;
  appDescription: string;
  active: string;
  caring: string;
  close: string;
  cancel: string;
  save: string;
  delete: string;
  edit: string;
  add: string;
  create: string;
  back: string;
  next: string;
  finish: string;
  loading: string;
  today: string;
  yesterday: string;
  search: string;
  searchPlaceholder: string;
  all: string;
  filter: string;
  sortBy: string;
  clearFilters: string;
  noResults: string;
  minutes: string;
  hours: string;
  glasses: string;
  points: string;
  confidence: string;
  unlocked: string;
  locked: string;
  demoDataReset: string;
  demoDataResetConfirm: string;

  // Navigation Tabs
  navToday: string;
  navCoach: string;
  navTypeAnalysis: string;
  navTimeline: string;
  navCalendar: string;
  navStats: string;
  navFavorites: string;
  mobilePreview: string;

  // Header Actions
  tellMeVoice: string;
  tellMeVoiceTitle: string;
  logMeal: string;
  logMealShort: string;
  switchLanguage: string;

  // Hero Section & Voice Check-in
  heroGreetingMorning: string;
  heroGreetingMidday: string;
  heroGreetingAfternoon: string;
  heroGreetingEvening: string;
  heroGreetingNight: string;
  heroSubtextMorning: string;
  heroSubtextMidday: string;
  heroSubtextAfternoon: string;
  heroSubtextEvening: string;
  heroSubtextNight: string;
  heroBubbleMorning: string;
  heroBubbleMidday: string;
  heroBubbleAfternoon: string;
  heroBubbleEvening: string;
  heroBubbleNight: string;
  heroExampleMorning: string;
  heroExampleMidday: string;
  heroExampleAfternoon: string;
  heroExampleEvening: string;
  heroExampleNight: string;
  heroTipMorning: string;
  heroTipMidday: string;
  heroTipAfternoon: string;
  heroTipEvening: string;
  heroTipNight: string;
  voiceCheckInTitle: string;
  voiceCheckInSubtitle: string;
  voiceRecordingActive: string;
  voiceRecordingProcessing: string;
  voiceRecordingPlaceholder: string;
  voiceRecordingSuccess: string;
  voiceStartListening: string;
  voiceStopListening: string;
  fullQuestionnaireBtn: string;
  quickQuestionsTitle: string;
  caryCaresBadge: string;

  // Caring Guardian & Alarms
  guardianBalancedTitle: string;
  guardianBalancedDesc: string;
  guardianAlarmTitle: string;
  guardianSystemTitle: string;
  guardianSystemSubtitle: string;
  alarmSleepTitle: string;
  alarmSleepSubtitle: string;
  alarmSleepReason: string;
  alarmSleepAction: string;
  alarmMindlessTitle: string;
  alarmMindlessSubtitle: string;
  alarmMindlessReason: string;
  alarmMindlessAction: string;
  alarmSlumpTitle: string;
  alarmSlumpSubtitle: string;
  alarmSlumpReason: string;
  alarmSlumpAction: string;
  alarmLateDinnerTitle: string;
  alarmLateDinnerSubtitle: string;
  alarmLateDinnerReason: string;
  alarmLateDinnerAction: string;
  resolvedBadge: string;
  activeBadge: string;
  markResolved: string;

  // Coach & Chat View
  coachTitle: string;
  coachSubtitle: string;
  coachAskCary: string;
  coachOnlineStatus: string;
  coachInputPlaceholder: string;
  coachSend: string;
  coachThinking: string;
  coachIntroGreeting: string;
  coachPromptType: string;
  coachPromptAlarms: string;
  coachPromptVoice: string;
  coachPromptSlump: string;
  coachPromptSleep: string;
  coachPromptPortions: string;
  coachingGoalsTitle: string;
  coachingGoalsSubtitle: string;
  weeklyMindfulness: string;
  dailyStreak: string;
  activeHabits: string;

  // Nutrition Type Analysis
  typeAnalysisTitle: string;
  typeAnalysisSubtitle: string;
  typeAnalysisHeaderBadge: string;
  typeMatrixTitle: string;
  typeConfidenceScore: string;
  typeDataPointsNeeded: string;
  typeUnlockMsg: string;
  typeTraitsTitle: string;
  typeDosTitle: string;
  typeDontsTitle: string;
  typeBioRhythmTitle: string;
  typeSleepNutritionTitle: string;
  typeMealTimingTitle: string;

  // Archetypes
  archetypeIntuitiveName: string;
  archetypeIntuitiveSubtitle: string;
  archetypeIntuitiveBadge: string;
  archetypeIntuitiveDesc: string;
  archetypeProteinName: string;
  archetypeProteinSubtitle: string;
  archetypeProteinBadge: string;
  archetypeProteinDesc: string;
  archetypeCircadianName: string;
  archetypeCircadianSubtitle: string;
  archetypeCircadianBadge: string;
  archetypeCircadianDesc: string;
  archetypeIntermittentName: string;
  archetypeIntermittentSubtitle: string;
  archetypeIntermittentBadge: string;
  archetypeIntermittentDesc: string;

  // Daily Check-in Modal
  checkInModalTitle: string;
  checkInTimeOfDayMorning: string;
  checkInTimeOfDayMidday: string;
  checkInTimeOfDayEvening: string;
  checkInStepSleep: string;
  checkInStepFood: string;
  checkInStepWellbeing: string;
  checkInSleepDuration: string;
  checkInSleepQuality: string;
  checkInWakeFeeling: string;
  checkInWakeRefreshed: string;
  checkInWakeNormal: string;
  checkInWakeTired: string;
  checkInWakeExhausted: string;
  checkInMealName: string;
  checkInMealCategory: string;
  checkInHungerBefore: string;
  checkInFullnessAfter: string;
  checkInEatingPace: string;
  checkInPaceSlow: string;
  checkInPaceModerate: string;
  checkInPaceRushed: string;
  checkInDistraction: string;
  checkInDistractionMindful: string;
  checkInDistractionScreen: string;
  checkInDistractionWork: string;
  checkInDistractionSocial: string;
  checkInEnergyLevel: string;
  checkInMood: string;
  checkInStressLevel: string;
  checkInWaterGlasses: string;
  checkInNotes: string;
  checkInSuccessToast: string;

  // Add / Edit Moment Modal
  addMomentModalTitle: string;
  editMomentModalTitle: string;
  momentTitlePlaceholder: string;
  momentCategoryLabel: string;
  momentDateLabel: string;
  momentTimeLabel: string;
  momentLocationLabel: string;
  momentRatingLabel: string;
  momentMoodLabel: string;
  momentHungerLabel: string;
  momentFullnessLabel: string;
  momentPaceLabel: string;
  momentDistractionLabel: string;
  momentNotesLabel: string;
  momentTagsLabel: string;
  momentTagsPlaceholder: string;
  momentProteinLabel: string;
  momentCaloriesLabel: string;
  momentImageUpload: string;
  momentImageUploadPrompt: string;
  momentSaveSuccess: string;
  momentDeleteConfirm: string;

  // Categories
  catBreakfast: string;
  catLunch: string;
  catDinner: string;
  catSnack: string;
  catCoffee: string;
  catDessert: string;
  catDrinks: string;
  catTravel: string;

  // Moods
  moodEnergized: string;
  moodSatisfied: string;
  moodLight: string;
  moodIndulgent: string;
  moodComfort: string;
  moodJoyful: string;

  // Timeline / Moments View
  momentsTotalCount: string;
  momentsFilteredCount: string;
  filterAllCategories: string;
  filterFavoritesOnly: string;
  noMomentsFound: string;
  noMomentsFoundSub: string;

  // Calendar View
  calendarTitle: string;
  calendarSubtitle: string;
  calendarEmptyDay: string;

  // Stats View
  statsTitle: string;
  statsSubtitle: string;
  statsAverageRating: string;
  statsMindfulScore: string;
  statsTotalMeals: string;
  statsLoggedDays: string;
  statsCategoryDistribution: string;
  statsMoodDistribution: string;
  statsEatingPaceBreakdown: string;
  statsSleepEnergyCorrelation: string;

  // Favorites View
  favoritesTitle: string;
  favoritesSubtitle: string;
  favoritesEmptyTitle: string;
  favoritesEmptyDesc: string;
}

export const translations: Record<SupportedLanguage, Translations> = {
  en: {
    // Brand & General
    appName: 'Cary',
    appTagline: 'Care • Mindfulness • Wellbeing',
    appDescription: 'Cary — Your caring companion for restorative sleep, mindful nutrition & holistic wellbeing.',
    active: 'Active',
    caring: 'Caring',
    close: 'Close',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    create: 'Create',
    back: 'Back',
    next: 'Next',
    finish: 'Finish',
    loading: 'Loading...',
    today: 'Today',
    yesterday: 'Yesterday',
    search: 'Search',
    searchPlaceholder: 'Search meals, notes, tags...',
    all: 'All',
    filter: 'Filter',
    sortBy: 'Sort by',
    clearFilters: 'Clear filters',
    noResults: 'No results found',
    minutes: 'min',
    hours: 'hours',
    glasses: 'glasses',
    points: 'points',
    confidence: 'Confidence',
    unlocked: 'Unlocked',
    locked: 'Locked (need more data)',
    demoDataReset: 'Reset to Sample Data',
    demoDataResetConfirm: 'Reset all data to default sample entries?',

    // Navigation Tabs
    navToday: 'Today',
    navCoach: 'Ask Cary',
    navTypeAnalysis: 'Type Analysis',
    navTimeline: 'Moments',
    navCalendar: 'Calendar',
    navStats: 'Insights & Stats',
    navFavorites: 'Favorites',
    mobilePreview: 'Mobile View',

    // Header Actions
    tellMeVoice: "Tell me!",
    tellMeVoiceTitle: 'Start voice check-in with Cary',
    logMeal: 'Log Meal',
    logMealShort: '+ New',
    switchLanguage: 'Language',

    // Hero Section & Voice Check-in
    heroGreetingMorning: 'Good morning! Slept well? ☕',
    heroGreetingMidday: 'Good afternoon! Enjoying lunch? 🥗',
    heroGreetingAfternoon: 'How is your afternoon energy? ⚡',
    heroGreetingEvening: 'Good evening! How was your day? 🍲',
    heroGreetingNight: 'Still awake? How are you feeling? 🌙',
    heroSubtextMorning: 'How did you wake up? Tell me about your morning.',
    heroSubtextMidday: 'What delicious meal is on your plate? I would love to hear!',
    heroSubtextAfternoon: 'Need some fresh air, water or a coffee break? Let me know!',
    heroSubtextEvening: 'How does your stomach feel? Tell me about your evening meal!',
    heroSubtextNight: 'Unwinding peacefully or are thoughts still spinning? Rest well.',
    heroBubbleMorning: '“Good morning! ☀️ How are you feeling after waking up today?”',
    heroBubbleMidday: '“Lunchtime! 🍲 What did you have for lunch and how do you feel?”',
    heroBubbleAfternoon: '“Hey there! 👋 How is your energy holding up this afternoon?”',
    heroBubbleEvening: '“Evening time! 🌙 What was for dinner and how is your body feeling?”',
    heroBubbleNight: '“Getting late! 🌌 Everything okay? Let the day gently come to a rest.”',
    heroExampleMorning: '“Slept about 7 hours, feeling refreshed and having my morning coffee.”',
    heroExampleMidday: '“Had a salmon bowl with quinoa and avocado. Feeling nicely satisfied.”',
    heroExampleAfternoon: '“Feeling a slight slump, grabbing a big glass of water and some almonds.”',
    heroExampleEvening: '“Enjoyed a warm vegetable soup. Relaxing on the sofa and feeling light.”',
    heroExampleNight: '“Heading to bed now, reading for 10 minutes and turning off screens.”',
    heroTipMorning: 'I will ensure you start your day with steady, balanced energy!',
    heroTipMidday: 'Take your time chewing – your digestion will thank you.',
    heroTipAfternoon: 'When eyes get heavy: open the window for 3 minutes and breathe deeply!',
    heroTipEvening: 'A light, wholesome dinner grants you restorative deep sleep tonight.',
    heroTipNight: 'Set your screen to night mode and dim the lights. Sleep peacefully!',
    voiceCheckInTitle: 'WhatsApp Voice Check-in',
    voiceCheckInSubtitle: 'Quick, natural & caring check-in.',
    voiceRecordingActive: '🔴 Cary is listening attentively to you...',
    voiceRecordingProcessing: 'Cary is thinking caring thoughts...',
    voiceRecordingPlaceholder: 'Speak naturally or tap quick chips below...',
    voiceRecordingSuccess: 'Thank you! Cary captured your check-in and tailored your day with care.',
    voiceStartListening: "Tell Cary! (Mic)",
    voiceStopListening: 'Done Speaking',
    fullQuestionnaireBtn: 'Full Questionnaire',
    quickQuestionsTitle: 'Quick caring prompts:',
    caryCaresBadge: 'Cary is here for you',

    // Caring Guardian & Alarms
    guardianBalancedTitle: 'All in balance • Cary is watching over your day',
    guardianBalancedDesc: 'Your rhythm of sleep, meals, and energy is in harmony. I am resting quietly in the background.',
    guardianAlarmTitle: 'Cary Guardian Alert',
    guardianSystemTitle: 'Cary Care & Early Warning System',
    guardianSystemSubtitle: 'Gently intervenes only when physiological signals need attention.',
    alarmSleepTitle: '⚠️ Increased Craving Risk from Sleep Deficit',
    alarmSleepSubtitle: 'Short sleep registered – body may seek fast energy',
    alarmSleepReason: 'Lack of sleep elevates the hunger hormone ghrelin and lowers leptin. Your body instinctively craves quick sugar/carbs.',
    alarmSleepAction: 'Delay coffee 90 mins after waking + add a protein-rich morning snack (Greek yogurt or almonds).',
    alarmMindlessTitle: '⚠️ Mindful Alert: Rushed Meal at the Screen',
    alarmMindlessSubtitle: 'Meal eaten under digital distraction or in a rush',
    alarmMindlessReason: 'Screen distraction inhibits vagus nerve signals. Satiety signals get delayed by up to 20 minutes, raising bloating risk.',
    alarmMindlessAction: 'Pause screen for 5 minutes, take 3 deep belly breaths and drink 250ml water.',
    alarmSlumpTitle: '⚠️ 3 PM Afternoon Energy Crash (Glucose Drop)',
    alarmSlumpSubtitle: 'Sluggish energy or sweet cravings detected in the afternoon',
    alarmSlumpReason: 'A rapid post-lunch blood sugar dip triggers fatigue and intense sugary cravings.',
    alarmSlumpAction: 'Drink a tall glass of water + walk 3 minutes in fresh air instead of quick sweets.',
    alarmLateDinnerTitle: '⚠️ Late Heavy Dinner Warning',
    alarmLateDinnerSubtitle: 'Heavy meal eaten after 8:30 PM',
    alarmLateDinnerReason: 'Digesting heavy foods late at night delays deep REM sleep and elevates overnight resting heart rate.',
    alarmLateDinnerAction: 'Switch to herbal chamomile tea and keep posture upright for 30 minutes before lying down.',
    resolvedBadge: 'Resolved',
    activeBadge: 'Needs Care',
    markResolved: 'Mark as Handled',

    // Coach & Chat View
    coachTitle: 'Mindful Guidance with Cary',
    coachSubtitle: 'Your personalized advisor for chronobiology, intuitive eating & restorative habits.',
    coachAskCary: 'Ask Cary',
    coachOnlineStatus: 'Online & Caring',
    coachInputPlaceholder: 'Ask Cary anything about meals, sleep or habits...',
    coachSend: 'Send',
    coachThinking: 'Cary is reflecting...',
    coachIntroGreeting: 'Hello! I am Cary, your caring companion. I watch over your harmony of sleep, food, and wellbeing. How can I brighten your day right now?',
    coachPromptType: '📊 Which nutrition archetype am I?',
    coachPromptAlarms: '🛡️ What early warnings does Cary monitor?',
    coachPromptVoice: '🎙️ Start voice check-in',
    coachPromptSlump: '⚡ How to conquer the 3 PM energy slump?',
    coachPromptSleep: '🌙 Best bedtime meals for deep sleep?',
    coachPromptPortions: '🍽️ How to recognize natural satiety?',
    coachingGoalsTitle: 'Cary Caring Habits & Goals',
    coachingGoalsSubtitle: 'Simple daily intentions to nourish body and mind.',
    weeklyMindfulness: 'Mindfulness Score',
    dailyStreak: 'Day Streak',
    activeHabits: 'Active Habits',

    // Nutrition Type Analysis
    typeAnalysisTitle: 'Nutrition Archetype Matrix',
    typeAnalysisSubtitle: 'Discover how your unique chronobiology and food choices shape your daily vitality.',
    typeAnalysisHeaderBadge: 'Cary Matrix Analysis',
    typeMatrixTitle: 'All 4 Archetypes in the Cary Matrix',
    typeConfidenceScore: 'Profile Confidence',
    typeDataPointsNeeded: 'More moments needed to unlock',
    typeUnlockMsg: 'Log at least 3 meals or check-ins to reveal your personalized archetype profile.',
    typeTraitsTitle: 'Your Key Physiological Traits',
    typeDosTitle: 'What Empowers You (Do’s)',
    typeDontsTitle: 'What to Watch Out For (Don’ts)',
    typeBioRhythmTitle: 'Personalized Bio-Rhythm Recommendation',
    typeSleepNutritionTitle: 'Sleep & Nutrition Connection',
    typeMealTimingTitle: 'Optimal Meal Windows',

    // Archetypes
    archetypeIntuitiveName: 'The Intuitive Mindful Eater',
    archetypeIntuitiveSubtitle: 'Harmonious balance of pleasure, body awareness & calm pace',
    archetypeIntuitiveBadge: 'Intuitive & Mindful',
    archetypeIntuitiveDesc: 'You listen attentively to natural hunger and fullness cues. You thrive when meals are eaten calmly with rich sensory appreciation.',
    archetypeProteinName: 'The Protein-Optimized Performer',
    archetypeProteinSubtitle: 'Focused on muscle recovery, satiety density & sustained focus',
    archetypeProteinBadge: 'High Protein Focus',
    archetypeProteinDesc: 'You purposefully prioritize nutrient-dense and protein-rich meals to fuel athletic recovery, steady focus, and stable stamina.',
    archetypeCircadianName: 'The Circadian Evening Connoisseur',
    archetypeCircadianSubtitle: 'Fond of savory late dinners & social evening rituals',
    archetypeCircadianBadge: 'Circadian Optimization',
    archetypeCircadianDesc: 'You love evening dining rituals. Shifting dinner slightly earlier grants you a massive boost in deep sleep regeneration and morning freshness.',
    archetypeIntermittentName: 'The Intermittent Rhythm Balancer',
    archetypeIntermittentSubtitle: 'Natural 16:8 fasting & stable afternoon energy plateau',
    archetypeIntermittentBadge: 'Intermittent Rhythm',
    archetypeIntermittentDesc: 'Your body wakes up energized with light morning liquids. Your peak nutrient intake occurs during midday with steady afternoon stamina.',

    // Daily Check-in Modal
    checkInModalTitle: 'Daily Check-in with Cary',
    checkInTimeOfDayMorning: 'Morning Check-in (05:00 - 11:00)',
    checkInTimeOfDayMidday: 'Midday Check-in (11:00 - 16:00)',
    checkInTimeOfDayEvening: 'Evening Check-in (16:00 - 04:00)',
    checkInStepSleep: '1. Sleep & Recovery',
    checkInStepFood: '2. Nutrition & Pace',
    checkInStepWellbeing: '3. Energy & Mind',
    checkInSleepDuration: 'Sleep Duration (Hours)',
    checkInSleepQuality: 'Sleep Quality (1-5)',
    checkInWakeFeeling: 'Morning Feeling upon Waking',
    checkInWakeRefreshed: 'Refreshed & Clear',
    checkInWakeNormal: 'Normal',
    checkInWakeTired: 'A bit tired',
    checkInWakeExhausted: 'Exhausted',
    checkInMealName: 'Recent Meal or Snack Title',
    checkInMealCategory: 'Category',
    checkInHungerBefore: 'Hunger Before Eating (1: Barely, 5: Ravenous)',
    checkInFullnessAfter: 'Fullness After (1: Light, 3: Perfect, 5: Stuffed)',
    checkInEatingPace: 'Eating Pace',
    checkInPaceSlow: 'Slow & Mindful',
    checkInPaceModerate: 'Moderate',
    checkInPaceRushed: 'Rushed & Fast',
    checkInDistraction: 'Atmosphere / Distraction',
    checkInDistractionMindful: 'Pure Mindfulness',
    checkInDistractionScreen: 'Phone / TV / Laptop',
    checkInDistractionWork: 'Working / Multitasking',
    checkInDistractionSocial: 'Dining with Friends/Family',
    checkInEnergyLevel: 'Current Energy Level (1-5)',
    checkInMood: 'Current State of Mind',
    checkInStressLevel: 'Stress Level (1: Zen, 5: High Tension)',
    checkInWaterGlasses: 'Water Intake so far (Glasses)',
    checkInNotes: 'Personal reflection or voice notes',
    checkInSuccessToast: 'Check-in saved successfully! Cary updated your daily insights.',

    // Add / Edit Moment Modal
    addMomentModalTitle: 'Log a Mindful Food Moment',
    editMomentModalTitle: 'Edit Food Moment',
    momentTitlePlaceholder: 'e.g., Colorful Salmon Poké Bowl with Avocado',
    momentCategoryLabel: 'Category',
    momentDateLabel: 'Date',
    momentTimeLabel: 'Time',
    momentLocationLabel: 'Location & Setting',
    momentRatingLabel: 'Enjoyment Rating (1-5 Stars)',
    momentMoodLabel: 'Feeling / Mood Associated',
    momentHungerLabel: 'Hunger Before (1: Little, 5: Starving)',
    momentFullnessLabel: 'Fullness After (1: Hungry, 3: Satisfied, 5: Overfull)',
    momentPaceLabel: 'Eating Pace',
    momentDistractionLabel: 'Distraction Level',
    momentNotesLabel: 'Notes, Flavors & Reflections',
    momentTagsLabel: 'Tags (comma separated)',
    momentTagsPlaceholder: 'healthy, homemade, colorful, high-protein',
    momentProteinLabel: 'Protein (g)',
    momentCaloriesLabel: 'Calories (kcal)',
    momentImageUpload: 'Food Photo',
    momentImageUploadPrompt: 'Upload a photo of your meal',
    momentSaveSuccess: 'Meal saved successfully!',
    momentDeleteConfirm: 'Are you sure you want to delete this moment?',

    // Categories
    catBreakfast: 'Breakfast',
    catLunch: 'Lunch',
    catDinner: 'Dinner',
    catSnack: 'Snack',
    catCoffee: 'Coffee & Break',
    catDessert: 'Dessert',
    catDrinks: 'Drinks & Tea',
    catTravel: 'Travel & Dining Out',

    // Moods
    moodEnergized: 'Energized ⚡',
    moodSatisfied: 'Satisfied 🥑',
    moodLight: 'Light & Fresh 🌿',
    moodIndulgent: 'Indulgent 🍰',
    moodComfort: 'Warm & Comforting 🍲',
    moodJoyful: 'Joyful & Social ✨',

    // Timeline / Moments View
    momentsTotalCount: 'Total Meals Logged',
    momentsFilteredCount: 'Showing',
    filterAllCategories: 'All Categories',
    filterFavoritesOnly: 'Favorites Only',
    noMomentsFound: 'No moments found matching your filter',
    noMomentsFoundSub: 'Try adjusting your search query or log a new meal.',

    // Calendar View
    calendarTitle: 'Culinary Calendar & Rhythm',
    calendarSubtitle: 'Your continuous food timeline organized by day and meal windows.',
    calendarEmptyDay: 'No meals logged on this date.',

    // Stats View
    statsTitle: 'Holistic Stats & Rhythm Insights',
    statsSubtitle: 'See the synergy between your mindful eating, mood, and sleep quality.',
    statsAverageRating: 'Avg. Enjoyment Rating',
    statsMindfulScore: 'Mindfulness Score',
    statsTotalMeals: 'Moments Logged',
    statsLoggedDays: 'Logged Days',
    statsCategoryDistribution: 'Meal Category Breakdown',
    statsMoodDistribution: 'Mood & Wellbeing Frequency',
    statsEatingPaceBreakdown: 'Eating Pace Balance',
    statsSleepEnergyCorrelation: 'Sleep vs. Energy Correlation',

    // Favorites View
    favoritesTitle: 'Favorites & Best-of Archive',
    favoritesSubtitle: 'Your handpicked, most delicious, and nourishing food moments.',
    favoritesEmptyTitle: 'No favorites saved yet',
    favoritesEmptyDesc: 'Bookmark your favorite meals using the star or bookmark icon on any moment card.',
  },

  ar: {
    // Brand & General
    appName: 'كاري',
    appTagline: 'العناية • اليقظة • الصحة',
    appDescription: 'كاري — مرافقتكِ ومرافقك الحنون للنوم الهانئ، والتغذية الواعية، والعافية الشاملة.',
    active: 'نشط',
    caring: 'مستعدة دائماً',
    close: 'إغلاق',
    cancel: 'إلغاء',
    save: 'حفظ',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    create: 'إنشاء',
    back: 'رجوع',
    next: 'التالي',
    finish: 'إنهاء',
    loading: 'جاري التحميل...',
    today: 'اليوم',
    yesterday: 'أمس',
    search: 'بحث',
    searchPlaceholder: 'ابحث في الوجبات، الملاحظات، الوسوم...',
    all: 'الكل',
    filter: 'تصفية',
    sortBy: 'ترتيب حسب',
    clearFilters: 'مسح التصفية',
    noResults: 'لم يتم العثور على نتائج',
    minutes: 'دقيقة',
    hours: 'ساعات',
    glasses: 'أكواب',
    points: 'نقاط',
    confidence: 'دقة التحليل',
    unlocked: 'متاح ومكتمل',
    locked: 'مقفل (بحاجة لمزيد من البيانات)',
    demoDataReset: 'استعادة البيانات التجريبية',
    demoDataResetConfirm: 'هل ترغب في إعادة ضبط البيانات إلى النماذج الافتراضية؟',

    // Navigation Tabs
    navToday: 'اليوم',
    navCoach: 'اسأل كاري',
    navTypeAnalysis: 'تحليل النمط',
    navTimeline: 'سجل الوجبات',
    navCalendar: 'التقويم',
    navStats: 'التحليلات والإحصائيات',
    navFavorites: 'المفضلة',
    mobilePreview: 'عرض الهاتف',

    // Header Actions
    tellMeVoice: '!أخبرني',
    tellMeVoiceTitle: 'بدء التسجيل الصوتي مع كاري',
    logMeal: 'إضافة وجبة',
    logMealShort: '+ جديد',
    switchLanguage: 'اللغة',

    // Hero Section & Voice Check-in
    heroGreetingMorning: 'صباح الخير! هل نمت براحة وهناء؟ ☕',
    heroGreetingMidday: 'طاب يومك! كيف كانت وجبة الغداء؟ 🥗',
    heroGreetingAfternoon: 'كيف هي طاقتك ونشاطك بعد الظهر؟ ⚡',
    heroGreetingEvening: 'مساء الخير والراحة! كيف مر يومك؟ 🍲',
    heroGreetingNight: 'ما زلت مستيقظاً؟ كيف تشعر الآن؟ 🌙',
    heroSubtextMorning: 'كيف استيقظت اليوم؟ شاركني تفاصيل صباحك.',
    heroSubtextMidday: 'ما هي الأطباق اللذيذة على مائدتك؟ يسعدني سماعك!',
    heroSubtextAfternoon: 'هل تشعر بحاجة لرشفة ماء، هواء نقي أو قهوة؟ أخبرني!',
    heroSubtextEvening: 'كيف تشعر معدتك؟ شاركني كيف كان عشاءك!',
    heroSubtextNight: 'هل تستعد للنوم بسلام أم أن الأفكار تشغلك؟ أتمنى لك ليلة هادئة.',
    heroBubbleMorning: '”صباح النور! ☀️ كيف تشعر بعد الاستيقاظ هذا الصباح؟“',
    heroBubbleMidday: '”صحة وعافية! 🍲 ماذا تناولت في الغداء وكيف تشعر الآن؟“',
    heroBubbleAfternoon: '”مرحباً بك! 👋 كيف هو مستوى طاقتك في هذه الساعات؟“',
    heroBubbleEvening: '”مساء الخير! 🌙 ماذا تناولت في العشاء وكيف يشعر جسدك؟“',
    heroBubbleNight: '”أمسية هادئة! 🌌 أتمنى لك نوماً عميقاً ومريحاً يجدد نشاطك.“',
    heroExampleMorning: '”نمت حوالي 7 ساعات، أشعر بالانتعاش وأشرب قهوة الصباح الآن.“',
    heroExampleMidday: '”تناولت طبق سلمون لذيذ مع الكينوا والأفوكادو، وأشعر بشبع مريح.“',
    heroExampleAfternoon: '”أشعر بقليل من الخمول، شربت كأساً كبيراً من الماء وتناولت حفنة مكسرات.“',
    heroExampleEvening: '”تناولت شوربة خضار دافئة مع خبز الحبوب. أشعر بالخفة والراحة.“',
    heroExampleNight: '”سأذهب للنوم قريباً، أقرأ كتاباً لمدة 10 دقائق وأغلقت شاشة الهاتف.“',
    heroTipMorning: 'سأحرص على أن تبدأ يومك بطاقة ثابتة ومزاج رائع!',
    heroTipMidday: 'خذ وقتك في المضغ بتأنٍ – جهازك الهضمي سيشكرك كثيراً.',
    heroTipAfternoon: 'عندما تشعر بالنعاس: افتح النافذة لدقائق وتنفس بعمق!',
    heroTipEvening: 'العشاء الخفيف يمنحك نوماً عميقاً وصحياً يريح جسدك طوال الليل.',
    heroTipNight: 'فعّل الوضع الليلي للشاشة وخفف الإضاءة. نوماً هنيئاً وأحلاماً سعيدة!',
    voiceCheckInTitle: 'تسجيل صوتي بأسلوب واتساب',
    voiceCheckInSubtitle: 'تسجيل سريع، طبيعي، ومليء بالاهتمام.',
    voiceRecordingActive: '🔴 كاري تستمع إليك بكل اهتمام وعناية...',
    voiceRecordingProcessing: 'كاري تفكر في نصيحة تناسبك...',
    voiceRecordingPlaceholder: 'تحدث بطبيعتك أو اختر أحد الأسئلة السريعة أدناه...',
    voiceRecordingSuccess: 'شكراً لك! استمعت كاري لرسالتك ونسقت خطة يومك بكل عناية.',
    voiceStartListening: 'تحدث مع كاري! (صوت)',
    voiceStopListening: 'إنهاء الحديث',
    fullQuestionnaireBtn: 'الاستبيان الكامل',
    quickQuestionsTitle: 'أسئلة سريعة للعناية بك:',
    caryCaresBadge: 'كاري هنا من أجلك',

    // Caring Guardian & Alarms
    guardianBalancedTitle: 'كل شيء متناغم • كاري تعتني بيومك في الخلفية',
    guardianBalancedDesc: 'إيقاع نومك ووجباتك وطاقتك في تناسق تام. أراقب الوضع بهدوء ولطف.',
    guardianAlarmTitle: 'تنبيه نظام كاري الحارس',
    guardianSystemTitle: 'نظام كاري للرعاية والإنذار المبكر',
    guardianSystemSubtitle: 'يتدخل بلطف فقط عندما ترسل الإشارات الحيوية لجسمك تنبيهاً بالاحتياج.',
    alarmSleepTitle: '⚠️ احتمال زيادة الرغبة الشديدة في الأكل بسبب قلة النوم',
    alarmSleepSubtitle: 'تم رصد قلة ساعات النوم – الجسم قد يبحث غريزياً عن طاقة سريعة',
    alarmSleepReason: 'قلة النوم ترفع هرمون الجوع (الجريلين) وتخفض هرمون الشبع (اللبتين)، مما يدفعك للسكريات السريعة.',
    alarmSleepAction: 'أجل شرب القهوة 90 دقيقة بعد الاستيقاظ + تناول وجبة خفيفة غنية بالبروتين (زبادي أو مكسرات).',
    alarmMindlessTitle: '⚠️ تنبيه اليقظة: وجبة سريعة أمام الشاشات',
    alarmMindlessSubtitle: 'تناولت الوجبة بتشتت أو سرعة عالية',
    alarmMindlessReason: 'تشتت الانتباه بالشاشات يضعف إشارات العصب الحائر، مما يؤخر إدراك الشبع لنحو 20 دقيقة ويزيد خطر التخمة.',
    alarmMindlessAction: 'توقف عن النظر للشاشة لمدة 5 دقائق، تنفس بعمق واشرب كوباً كبيراً من الماء.',
    alarmSlumpTitle: '⚠️ هبوط طاقة ما بعد الظهيرة (هبوط الجلوكوز)',
    alarmSlumpSubtitle: 'تم تسجيل خمول أو رغبة شديدة في السكريات بعد الغداء',
    alarmSlumpReason: 'الانخفاض السريع في سكر الدم بعد وجبة ثقيلة يسبب رغبة ملحة في الحلويات مع ثقل بالجسم.',
    alarmSlumpAction: 'اشرب ماءً منعشاً وامشِ لـ 3 دقائق في الهواء الطلق بدلاً من السكريات المصنعة.',
    alarmLateDinnerTitle: '⚠️ تنبيه وجبة عشاء متأخرة وثقيلة',
    alarmLateDinnerSubtitle: 'تناول طعام دسم بعد الساعة 8:30 مساءً',
    alarmLateDinnerReason: 'هضم الأطعمة الدسمة ليلاً يؤخر مرحلة النوم العميق ويرفع معدل ضربات القلب أثناء الراحة.',
    alarmLateDinnerAction: 'استبدل المشروبات بكوب بابونج دافئ وابقَ في وضع الجلوس لنصف ساعة قبل النوم.',
    resolvedBadge: 'تم التعامل معه',
    activeBadge: 'يحتاج عناية',
    markResolved: 'تم بنجاح',

    // Coach & Chat View
    coachTitle: 'التوجيه الواعي مع كاري',
    coachSubtitle: 'مستشارتك الشخصية للإيقاع الحيوي، والتغذية الواعية، والعادات الصحية.',
    coachAskCary: 'اسأل كاري',
    coachOnlineStatus: 'متصلة وبكل اهتمام',
    coachInputPlaceholder: 'اسأل كاري أي سؤال عن الوجبات، النوم، أو عاداتك اليومية...',
    coachSend: 'إرسال',
    coachThinking: 'كاري تفكر بعناية...',
    coachIntroGreeting: 'أهلاً بك! أنا كاري، رفيقتك الحنونة. أحرص على تناغم نومك وغذائك وعافيتك. كيف يمكنني أن أعتني بك وأسعدك اليوم؟',
    coachPromptType: '📊 ما هو نمطي الغذائي الخاص بي؟',
    coachPromptAlarms: '🛡️ ما هي إشارات الإنذار التي تراقبها كاري؟',
    coachPromptVoice: '🎙️ بدء التسجيل الصوتي اليومي',
    coachPromptSlump: '⚡ كيف أتغلب على خمول ما بعد الظهيرة؟',
    coachPromptSleep: '🌙 ما هي أفضل وجبات العشاء لنوم عميق؟',
    coachPromptPortions: '🍽️ كيف أستشعر شبع جسدي الطبيعي؟',
    coachingGoalsTitle: 'عادات وأهداف كاري للعناية',
    coachingGoalsSubtitle: 'نوايا وخطوات يومية بسيطة تغذي الجسد والروح.',
    weeklyMindfulness: 'مؤشر اليقظة الغذائية',
    dailyStreak: 'أيام الالتزام المستمر',
    activeHabits: 'العادات النشطة',

    // Nutrition Type Analysis
    typeAnalysisTitle: 'مصفوفة الأنماط الغذائية',
    typeAnalysisSubtitle: 'اكتشف كيف يرسم إيقاعك الحيوي وخياراتك اليومية مستوى حيويتك ونشاطك.',
    typeAnalysisHeaderBadge: 'تحليل مصفوفة كاري',
    typeMatrixTitle: 'جميع الأنماط الـ 4 في مصفوفة كاري',
    typeConfidenceScore: 'مستوى دقة النمط',
    typeDataPointsNeeded: 'المزيد من الوجبات المطلوبة لإتمام التحليل',
    typeUnlockMsg: 'قم بتسجيل 3 وجبات أو استبيانات على الأقل للكشف عن نمطك الغذائي الخاص بدقة.',
    typeTraitsTitle: 'أهم سماتك الفسيولوجية',
    typeDosTitle: 'ما يدعمك وينفعك (افعل)',
    typeDontsTitle: 'ما ينبغي الحذر منه (تجنب)',
    typeBioRhythmTitle: 'توصية مخصصة لإيقاعك الحيوي',
    typeSleepNutritionTitle: 'الترابط بين جودة النوم والتغذية',
    typeMealTimingTitle: 'نوافذ توقيت الوجبات المثالية',

    // Archetypes
    archetypeIntuitiveName: 'المتناغم اليقظ (المستمتع الحكيم)',
    archetypeIntuitiveSubtitle: 'توازن دقيق بين الاستمتاع، والإحساس الفطري بالجسم، والهدوء',
    archetypeIntuitiveBadge: 'فطري ويقظ',
    archetypeIntuitiveDesc: 'تستمع بوعي إلى إشارات الجوع والشبع الطبيعية. تزدهر صحتك عندما تتناول طعامك في هدوء وبتقدير كامل لمذاق كل لقمة.',
    archetypeProteinName: 'النشط الرياضي المعتمد على البروتين',
    archetypeProteinSubtitle: 'تركيز على تعافي العضلات، وكثافة الشبع، والطاقة المستدامة',
    archetypeProteinBadge: 'تركيز عالي على البروتين',
    archetypeProteinDesc: 'تهتم باختيار أطعمة مغذية وغنية بالبروتين كوقود أساسي لتحسين الأداء البدني والذهني وسرعة الاستشفاء.',
    archetypeCircadianName: 'المستمتع المسائي (المتوافق مع الليل)',
    archetypeCircadianSubtitle: 'ميل لوجبات مسائية غنية وجلسات عائلية هادئة',
    archetypeCircadianBadge: 'تحسين الإيقاع اليومي',
    archetypeCircadianDesc: 'تحب طقوس العشاء الهادئة. تقديم موعد العشاء قليلاً يمنحك قفزة مذهلة في عمق نومك ونشاط استيقاظك الصباحي.',
    archetypeIntermittentName: 'المتوازن بالصيام والإيقاع الدوري',
    archetypeIntermittentSubtitle: 'صيام 16:8 طبيعي مع استقرار ملحوظ في طاقة الظهيرة',
    archetypeIntermittentBadge: 'إيقاع الصيام المتقطع',
    archetypeIntermittentDesc: 'يستيقظ جسمك بنشاط مع السوائل الخفيفة صباحاً، وتفتح أولى نوافذ طاقتك عند الظهيرة بوجبة غنية تعزز نشاطك.',

    // Daily Check-in Modal
    checkInModalTitle: 'الاستبيان اليومي مع كاري',
    checkInTimeOfDayMorning: 'فحص الصباح (05:00 - 11:00)',
    checkInTimeOfDayMidday: 'فحص الظهيرة (11:00 - 16:00)',
    checkInTimeOfDayEvening: 'فحص المساء والليل (16:00 - 04:00)',
    checkInStepSleep: '1. النوم والاستشفاء',
    checkInStepFood: '2. الوجبة وسرعة الأكل',
    checkInStepWellbeing: '3. الطاقة والمزاج',
    checkInSleepDuration: 'مدة النوم (بالساعات)',
    checkInSleepQuality: 'جودة النوم (1-5)',
    checkInWakeFeeling: 'شعورك عند الاستيقاظ',
    checkInWakeRefreshed: 'نشط ومنتعش',
    checkInWakeNormal: 'طبيعي',
    checkInWakeTired: 'متعب قليلاً',
    checkInWakeExhausted: 'مرهق جداً',
    checkInMealName: 'اسم آخر وجبة أو سناك',
    checkInMealCategory: 'تصنيف الوجبة',
    checkInHungerBefore: 'مستوى الجوع قبل الأكل (1: قليل، 5: شديد جداً)',
    checkInFullnessAfter: 'مستوى الشبع بعد الأكل (1: خفيف، 3: مثالي، 5: تخمة)',
    checkInEatingPace: 'سرعة تناول الطعام',
    checkInPaceSlow: 'بطيء وبتأنٍ واعي',
    checkInPaceModerate: 'معتدل',
    checkInPaceRushed: 'سريع ومستعجل',
    checkInDistraction: 'الأجواء / مستوى التشتت',
    checkInDistractionMindful: 'تركيز وهدوء تام',
    checkInDistractionScreen: 'أمام الهاتف / التلفاز / الحاسوب',
    checkInDistractionWork: 'أثناء العمل / مهام متعددة',
    checkInDistractionSocial: 'مع العائلة أو الأصدقاء',
    checkInEnergyLevel: 'مستوى طاقتك الحالي (1-5)',
    checkInMood: 'الحالة النفسية والمزاج',
    checkInStressLevel: 'مستوى التوتر (1: هدوء تام، 5: ضغط عالي)',
    checkInWaterGlasses: 'كمية الماء المشروبة حتى الآن (أكواب)',
    checkInNotes: 'ملاحظاتك ومشاعرك أو تسجيل صوتي',
    checkInSuccessToast: 'تم حفظ الاستبيان بنجاح! قامت كاري بتحديث تحليلاتك اليومية.',

    // Add / Edit Moment Modal
    addMomentModalTitle: 'تسجيل لحظة غذائية واعية',
    editMomentModalTitle: 'تعديل بيانات الوجبة',
    momentTitlePlaceholder: 'مثال: طبق سلمون مشوي مع الخضار والكينوا',
    momentCategoryLabel: 'التصنيف',
    momentDateLabel: 'التاريخ',
    momentTimeLabel: 'الوقت',
    momentLocationLabel: 'المكان والأجواء',
    momentRatingLabel: 'تقييم الاستمتاع بالوجبة (1-5 نجوم)',
    momentMoodLabel: 'الشعور والحالة المصاحبة',
    momentHungerLabel: 'الجوع قبل الوجبة (1: خفيف، 5: جائع جداً)',
    momentFullnessLabel: 'الشبع بعد الوجبة (1: جائع، 3: شبع تام، 5: ممتلئ جداً)',
    momentPaceLabel: 'سرعة الأكل',
    momentDistractionLabel: 'مستوى التشتت',
    momentNotesLabel: 'ملاحظات حول النكهات والمشاعر',
    momentTagsLabel: 'الوسوم (مفصولة بفواصل)',
    momentTagsPlaceholder: 'صحي، منزلي، بروتين-عالي، متوازن',
    momentProteinLabel: 'بروتين (غرام)',
    momentCaloriesLabel: 'سعرات حرارية (كيلوكالوري)',
    momentImageUpload: 'صورة الوجبة',
    momentImageUploadPrompt: 'ارفع صورة لوجبتك الشهية',
    momentSaveSuccess: 'تم حفظ الوجبة بنجاح!',
    momentDeleteConfirm: 'هل أنت متأكد من حذف هذه الوجبة؟',

    // Categories
    catBreakfast: 'فطور',
    catLunch: 'غداء',
    catDinner: 'عشاء',
    catSnack: 'وجبة خفيفة (سناك)',
    catCoffee: 'قهوة واستراحة',
    catDessert: 'حلوى ولحظة دلال',
    catDrinks: 'مشروبات وشاي',
    catTravel: 'مطاعم وسفر',

    // Moods
    moodEnergized: 'مفعم بالحيوية ⚡',
    moodSatisfied: 'راضٍ ومكتفٍ 🥑',
    moodLight: 'خفيف ومنعش 🌿',
    moodIndulgent: 'مستمتع بتدليل النفس 🍰',
    moodComfort: 'دافئ ومريح 🍲',
    moodJoyful: 'مبتهج واجتماعي ✨',

    // Timeline / Moments View
    momentsTotalCount: 'إجمالي الوجبات المسجلة',
    momentsFilteredCount: 'المعروض',
    filterAllCategories: 'كل التصنيفات',
    filterFavoritesOnly: 'المفضلة فقط',
    noMomentsFound: 'لم يتم العثور على وجبات مطابقة للتصفية',
    noMomentsFoundSub: 'جرب تعديل كلمات البحث أو سجل وجبة جديدة الآن.',

    // Calendar View
    calendarTitle: 'تقويم الوجبات والإيقاع اليومي',
    calendarSubtitle: 'سجلك الغذائي المستمر موزعاً حسب الأيام ونوافذ الوجبات.',
    calendarEmptyDay: 'لم يتم تسجيل وجبات في هذا اليوم.',

    // Stats View
    statsTitle: 'الإحصائيات الشاملة ورؤى الإيقاع',
    statsSubtitle: 'شاهد التناغم بين أكلك الواعي، ومزاجك، وجودة نومك.',
    statsAverageRating: 'متوسط الاستمتاع بالوجبات',
    statsMindfulScore: 'مؤشر اليقظة الغذائية',
    statsTotalMeals: 'الوجبات المسجلة',
    statsLoggedDays: 'الأيام المسجلة',
    statsCategoryDistribution: 'توزيع فئات الوجبات',
    statsMoodDistribution: 'تكرار المشاعر والمزاج',
    statsEatingPaceBreakdown: 'توزيع سرعة الأكل',
    statsSleepEnergyCorrelation: 'العلاقة بين جودة النوم والطاقة',

    // Favorites View
    favoritesTitle: 'أرشيف المفضلة وأفضل الوجبات',
    favoritesSubtitle: 'وجباتك المختارة بعناية الأكثر لذة وفائدة لجسمك.',
    favoritesEmptyTitle: 'لا توجد وجبات مفضلة بعد',
    favoritesEmptyDesc: 'احفظ وجباتك المميزة بالضغط على رمز الإشارة المرجعية أو النجمة في أي بطاقة وجبة.',
  },
};
