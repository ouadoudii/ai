export type MealExtraction = {
  mealDetected: boolean;
  mealTitle: string;
  mealItems: string[];
  mealCategory: string;
  mealContext: string;
};

type FoodRule = {
  aliases: string[];
  label: string;
  preps?: Array<{ aliases: string[]; label: string }>;
  additions?: Array<{ aliases: string[]; label: string }>;
};

const FOOD_RULES: FoodRule[] = [
  { aliases: ['بيضات','بيضة','بيض','bayd','beyd','beid','egg','eggs','oeuf','oeufs','ei','eier'], label: 'بيض', preps: [
    { aliases: ['مسلوقين','مسلوقة','مسلوق','boiled','bouilli','bouillis','gekocht','gekochte','gekochtes','gekochten'], label: 'مسلوق' },
    { aliases: ['مقليين','مقلية','مقلي','fried','frit','frits','gebraten','spiegelei'], label: 'مقلي' },
    { aliases: ['أومليت','اومليت','omelette','omelet','omelett'], label: 'أومليت' },
  ] },
  { aliases: ['المسمن','مسمن','msemen','msemmen'], label: 'مسمن', additions: [
    { aliases: ['بالعسل','مع العسل','au miel','with honey'], label: 'بالعسل' },
    { aliases: ['بالجبن','مع الجبن','بالفرماج','مع الفرماج','au fromage','with cheese'], label: 'بالجبن' },
  ] },
  { aliases: ['أتاي','اتاي','atay'], label: 'أتاي', additions: [
    { aliases: ['بالنعناع','نعناع','à la menthe','mint'], label: 'بالنعناع' },
  ] },
  { aliases: ['شاي','shay','shai','tea','thé','the','tee'], label: 'شاي', additions: [
    { aliases: ['بالنعناع','نعناع','à la menthe','mint'], label: 'بالنعناع' },
    { aliases: ['بالحليب','مع الحليب','au lait','with milk','mit milch'], label: 'بالحليب' },
  ] },
  { aliases: ['قهوة','قهوا','qahwa','kahwa','coffee','café','cafe','kaffee'], label: 'قهوة', additions: [
    { aliases: ['بالحليب','مع الحليب','au lait','with milk','milk coffee','mit milch'], label: 'بالحليب' },
    { aliases: ['بلا سكر','بدون سكر','sans sucre','no sugar','ohne zucker'], label: 'بلا سكر' },
  ] },
  { aliases: ['الخبز','خبز','خبزة','الخبزة','خبيزة','الخبيزة','khobz','khobza','khbeza','khbiza','bread','pain','brot'], label: 'خبز', additions: [
    { aliases: ['بالجبن','مع الجبن','بالفرماج','مع الفرماج','فرماج','fromage','au fromage','with cheese','cheese','mit käse','mit kase'], label: 'بالجبن' },
    { aliases: ['بزيت الزيتون','مع زيت الزيتون','زيت الزيتون','huile d olive','olive oil','mit olivenöl','mit olivenol'], label: 'بزيت الزيتون' },
  ] },
  { aliases: ['حريرة','الحريرة','harira'], label: 'حريرة' },
  { aliases: ['كسكس','كوسكوس','couscous'], label: 'كسكس' },
  { aliases: ['طاجين','تاجين','tajine','tagine'], label: 'طاجين' },
  { aliases: ['شوربة','شربة','chorba','shorba','soupe','soup','suppe'], label: 'شوربة' },
  { aliases: ['دجاج','فراخ','جاج','djaj','djej','dajaj','chicken','poulet','hähnchen','hahnchen'], label: 'دجاج', preps: [
    { aliases: ['مشوي','مشوية','grilled','grillé','grille','gegrillt'], label: 'مشوي' },
    { aliases: ['مقلي','fried','frit','gebraten'], label: 'مقلي' },
  ] },
  { aliases: ['لحم','لحمة','lham','meat','viande','fleisch'], label: 'لحم', preps: [
    { aliases: ['مشوي','grilled','grillé','grille','gegrillt'], label: 'مشوي' },
  ] },
  { aliases: ['سمك','حوت','hout','fish','poisson','fisch'], label: 'سمك', preps: [
    { aliases: ['مشوي','grilled','grillé','grille','gegrillt'], label: 'مشوي' },
    { aliases: ['مقلي','fried','frit','gebraten'], label: 'مقلي' },
  ] },
  { aliases: ['رز','أرز','ارز','roz','rouz','ruz','rice','riz','reis'], label: 'أرز' },
  { aliases: ['سلطة','salata','salad','salade','salat'], label: 'سلطة' },
  { aliases: ['بطاطا','بطاطس','batata','potato','potatoes','pomme de terre','pommes de terre','kartoffel','kartoffeln'], label: 'بطاطا', preps: [
    { aliases: ['مقلية','مقلي','fries','frites','fried','pommes','gebraten'], label: 'مقلية' },
    { aliases: ['مسلوقة','مسلوق','boiled','gekocht'], label: 'مسلوقة' },
  ] },
  { aliases: ['ياغورت','يوغورت','زبادي','yaourt','yogurt','joghurt'], label: 'ياغورت' },
  { aliases: ['حليب','hlib','halib','milk','lait','milch'], label: 'حليب' },
  { aliases: ['ماء','الماء','water','eau','wasser'], label: 'ماء' },
  { aliases: ['تمر','تمور','tmar','dates','dattes','datteln'], label: 'تمر' },
  { aliases: ['تفاح','تفاحة','tfa7','apple','pomme','apfel'], label: 'تفاح' },
  { aliases: ['موز','موزة','banana','banane'], label: 'موز' },
  { aliases: ['برتقال','برتقالة','orange'], label: 'برتقال' },
  { aliases: ['جبن','جبنة','فرماج','fromage','cheese','käse','kase'], label: 'جبن' },
  { aliases: ['كرواسون','croissant'], label: 'كرواسون' },
  { aliases: ['ساندويتش','سندويتش','sandwich'], label: 'ساندويتش' },
  { aliases: ['بيتزا','pizza'], label: 'بيتزا' },
  { aliases: ['مكرونة','معكرونة','pasta','pâtes','pates','nudeln'], label: 'مكرونة' },
  { aliases: ['عدس','lentils','lentilles','linsen'], label: 'عدس' },
  { aliases: ['حمص','hommos','hummus','chickpeas','pois chiches','kichererbsen'], label: 'حمص' },
];

const QUANTITIES = [
  'واحد','واحدة','وحدة','جوج','زوج','اثنين','اتنين','ثنين','ثلاث','ثلاثة','ثلاثه','أربع','اربعة','خمسة',
  'نص','نصف','شوية','قليل','كثير','كاس','كأس','كوب','فنجان','حبة','حبتين','قطعة','قطعتين',
  'one','two','three','four','half','cup','cups','glass','glasses','piece','pieces',
  'un','une','deux','trois','quatre','demi','verre','tasse','pièce','piece',
  'ein','eine','einen','einem','einer','eins','zwei','drei','vier','fünf','funf','halb','halbe','halben','tasse','tassen','glas','gläser','glaser','stück','stuck','stücke','stucke',
  '1','2','3','4','5','١','٢','٣','٤','٥','۱','۲','۳','۴','۵'
];

const QUANTITY_CONNECTORS = [
  'قطعة','قطع','حبة','حبات','كوب','اكواب','أكواب','كاس','كأس','كؤوس','فنجان','فناجين',
  'piece','pieces','cup','cups','glass','glasses',
  'pièce','piece','pièces','pieces','tasse','tasses','verre','verres',
  'stück','stuck','stücke','stucke','tasse','tassen','glas','gläser','glaser'
];

const NEGATIONS = [
  'ما كليتش','ماكلتش','ما اكلتش','ما أكلتش','ما كلتش','ما شربتش','مش كلت','مش أكلت','مش اكلت','مش شربت',
  'لم آكل','لم اكل','لم أشرب','لم اشرب','ما أكلت','ما اكلت','ما شربت','مو آكل','مو اكل','مو شارب',
  "didn't eat","did not eat","didn't drink","did not drink",'not eating','not drinking',
  "je n'ai pas mangé","je n ai pas mange","je n'ai pas bu","je n ai pas bu",'pas mangé','pas mange','pas bu'
];

const NEGATIVE_DETERMINERS = ['kein','keine','keinen','keinem','keiner','keines'];

const NEGATION_SCOPE_RESETS = [
  'ولكن','لكن','بس','غير',
  'but','however','instead',
  'mais','par contre','plutôt','plutot',
  'aber','jedoch','sondern'
];

const POSITIVE_CONSUMPTION_VERBS = [
  'كليت','كلت','اكلت','أكلت','شربت','خديت','خدت','فطرت','تغديت','تعشيت',
  'ate','drank','had','mange','mangé','bu'
];

function normalize(value: string): string {
  return value.toLowerCase().normalize('NFKD')
    .replace(/[\u064b-\u065f\u0670]/g, '').replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/ة/g, 'ه')
    .replace(/[،,.;:!?؟()\[\]{}"“”]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenMatches(word: string, needle: string): boolean {
  if (word === needle) return true;
  if (!/^[\u0600-\u06ff]+$/.test(word) || !/^[\u0600-\u06ff]+$/.test(needle)) return false;

  const withoutConjunction = word.startsWith('و') ? word.slice(1) : word;
  if (withoutConjunction === needle) return true;

  const withoutArticle = withoutConjunction.startsWith('ال') ? withoutConjunction.slice(2) : withoutConjunction;
  const needleWithoutArticle = needle.startsWith('ال') ? needle.slice(2) : needle;
  return withoutArticle === needleWithoutArticle;
}

function findAliasIndex(normalized: string, alias: string): number {
  const words = normalized.split(' ');
  const aliasWords = normalize(alias).split(' ');
  if (aliasWords.length === 1) return words.findIndex((word) => tokenMatches(word, aliasWords[0]));
  for (let i = 0; i <= words.length - aliasWords.length; i += 1) {
    if (aliasWords.every((part, offset) => offset === 0 ? tokenMatches(words[i + offset], part) : words[i + offset] === part)) return i;
  }
  return -1;
}

function includesAlias(normalized: string, alias: string): boolean {
  return findAliasIndex(normalized, alias) >= 0;
}

function contextAround(normalized: string, alias: string, radius = 5): string {
  const words = normalized.split(' ');
  const index = findAliasIndex(normalized, alias);
  if (index < 0) return normalized;
  const width = normalize(alias).split(' ').length;
  return words.slice(Math.max(0, index - radius), Math.min(words.length, index + width + radius)).join(' ');
}

function lastSequenceIndex(words: string[], phrase: string): number {
  const parts = normalize(phrase).split(' ');
  let last = -1;
  for (let i = 0; i <= words.length - parts.length; i += 1) {
    if (parts.every((part, offset) => words[i + offset] === part)) last = i;
  }
  return last;
}

function isNegated(normalized: string, alias: string): boolean {
  const words = normalized.split(' ');
  const index = findAliasIndex(normalized, alias);
  if (index < 0) return false;

  const previousWord = index > 0 ? words[index - 1] : '';
  if (NEGATIVE_DETERMINERS.includes(previousWord)) return true;

  const before = words.slice(0, index);
  let lastNegationStart = -1;
  let lastNegationEnd = -1;
  for (const negation of NEGATIONS) {
    const start = lastSequenceIndex(before, negation);
    if (start >= lastNegationStart) {
      lastNegationStart = start;
      lastNegationEnd = start < 0 ? -1 : start + normalize(negation).split(' ').length - 1;
    }
  }
  if (lastNegationStart < 0) return false;

  let lastScopeReset = -1;
  for (const reset of NEGATION_SCOPE_RESETS) {
    lastScopeReset = Math.max(lastScopeReset, lastSequenceIndex(before, reset));
  }
  if (lastScopeReset > lastNegationEnd) return false;

  let lastPositiveVerb = -1;
  for (let i = lastNegationEnd + 1; i < before.length; i += 1) {
    if (POSITIVE_CONSUMPTION_VERBS.some((verb) => tokenMatches(before[i], normalize(verb)))) lastPositiveVerb = i;
  }
  return lastPositiveVerb < 0;
}

function quantityFor(normalized: string, alias: string, rule: FoodRule): string | null {
  const words = normalized.split(' ');
  const index = findAliasIndex(normalized, alias);
  if (index <= 0) return null;

  const isQuantity = (value: string) => QUANTITIES.some((q) => normalize(q) === value);
  const immediate = words[index - 1];
  if (isQuantity(immediate)) return immediate;

  if (index > 1 && isQuantity(words[index - 2])) {
    const modifier = words[index - 1];
    const isPreparationModifier = rule.preps?.some((prep) => prep.aliases.some((candidate) => normalize(candidate) === modifier)) ?? false;
    const isQuantityConnector = QUANTITY_CONNECTORS.some((connector) => normalize(connector) === modifier);
    if (isPreparationModifier || isQuantityConnector) return words[index - 2];
  }

  return null;
}

function normalizeClockDigits(value: string): string {
  const arabicIndic = '٠١٢٣٤٥٦٧٨٩';
  const easternArabicIndic = '۰۱۲۳۴۵۶۷۸۹';
  return value.replace(/[٠-٩۰-۹]/g, (digit) => {
    const arabicIndex = arabicIndic.indexOf(digit);
    return String(arabicIndex >= 0 ? arabicIndex : easternArabicIndic.indexOf(digit));
  });
}

function detectMealCategoryFromClock(normalized: string): string {
  const clockText = normalizeClockDigits(normalized);
  const meridiemMatch = clockText.match(/(?:^|\s)(?:(?:at|الساعه)\s+)?(\d{1,2})(?:\s+(\d{2}))?\s*(am|pm|صباحا|صباح|مساء)(?:\s|$)/);

  let hour: number;
  let minute: number;
  if (meridiemMatch) {
    hour = Number(meridiemMatch[1]);
    minute = Number(meridiemMatch[2] || '0');
    const meridiem = meridiemMatch[3];
    if (!Number.isInteger(hour) || hour < 1 || hour > 12 || minute < 0 || minute > 59) return '';
    if ((meridiem === 'am' || meridiem === 'صباحا' || meridiem === 'صباح') && hour === 12) hour = 0;
    if ((meridiem === 'pm' || meridiem === 'مساء') && hour < 12) hour += 12;
  } else {
    const patterns = [
      /(?:^|\s)(?:um|at)\s+(\d{1,2})(?::(\d{2}))?\s*(?:uhr|h)?(?:\s|$)/,
      /(?:^|\s)a\u0300\s+(\d{1,2})(?::(\d{2}))?\s*h?(?:\s|$)/,
      /(?:^|\s)الساعه\s+(\d{1,2})(?::(\d{2}))?(?:\s|$)/,
    ];
    const match = patterns.map((pattern) => clockText.match(pattern)).find(Boolean);
    if (!match) return '';
    hour = Number(match[1]);
    minute = Number(match[2] || '0');
    if (!Number.isInteger(hour) || hour < 0 || hour > 23 || minute < 0 || minute > 59) return '';
  }

  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 16) return 'lunch';
  if (hour === 16) return 'snack';
  if (hour >= 17 || hour < 3) return 'dinner';
  return '';
}

function detectMealCategory(normalized: string): string {
  const breakfast = [
    'فطور','الفطور','فطار','فطرت','اتفطرت','تفطرت','ترويقة','ترويقه','ترويقت','تريقت','ريوق','الريوق','ريوك','الريوك',
    'ftour','fطور','fatoor','foutour','الصبح','الصباح','صباحا','morning','this morning','morgens','am morgen','heute morgen','frühstück','fruhstuck','ce matin','matin',
    'breakfast','petit déjeuner','petit dejeuner'
  ];
  const lunch = [
    'غداء','الغداء','غدا','غديت','تغديت','اتغديت','تغديت','ghda','ghada','lghda','الظهر','وقت الظهر','نص النهار','بنص النهار','الزوال',
    'noon','midday','at noon','mittags','heute mittag','mittagessen','midi','à midi','a midi','lunch','déjeuner','dejeuner'
  ];
  const dinner = [
    'عشاء','العشاء','عشا','عشيت','تعشيت','اتعشيت','3cha','3chaa','asha','بالليل','الليل','المساء','المسا',
    'evening','tonight','abends','heute abend','abendessen','ce soir','soir','dinner','dîner','diner'
  ];
  if (breakfast.some((v) => normalized.includes(normalize(v)))) return 'breakfast';
  if (lunch.some((v) => normalized.includes(normalize(v)))) return 'lunch';
  if (dinner.some((v) => normalized.includes(normalize(v)))) return 'dinner';
  if (['سناك','وجبة خفيفة','snack','goûter','gouter'].some((v) => normalized.includes(normalize(v)))) return 'snack';
  return detectMealCategoryFromClock(normalized);
}

export function extractMealItemsDeterministic(transcript: string): MealExtraction {
  const normalized = normalize(transcript || '');
  if (!normalized) return { mealDetected: false, mealTitle: '', mealItems: [], mealCategory: '', mealContext: '' };

  let items: string[] = [];
  for (const rule of FOOD_RULES) {
    const alias = rule.aliases.find((candidate) => includesAlias(normalized, candidate));
    if (!alias || isNegated(normalized, alias)) continue;
    const context = contextAround(normalized, alias);
    const prep = rule.preps?.find((p) => p.aliases.some((a) => includesAlias(context, a)))?.label;
    const addition = rule.additions?.find((p) => p.aliases.some((a) => includesAlias(context, a)))?.label;
    const quantity = quantityFor(normalized, alias, rule);
    const item = [quantity, rule.label, prep, addition].filter(Boolean).join(' ');
    if (item && !items.includes(item)) items.push(item);
  }

  if (items.some((item) => item === 'قهوة بالحليب' || item === 'شاي بالحليب')) {
    items = items.filter((item) => item !== 'حليب');
  }
  if (items.some((item) => item === 'خبز بالجبن')) {
    items = items.filter((item) => item !== 'جبن');
  }

  return {
    mealDetected: items.length > 0,
    mealTitle: items.join(' · '),
    mealItems: items,
    mealCategory: detectMealCategory(normalized),
    mealContext: items.length ? transcript.slice(0, 500) : '',
  };
}