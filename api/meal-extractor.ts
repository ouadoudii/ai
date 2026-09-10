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
  { aliases: ['بيضات','بيضة','بيض','egg','eggs','oeuf','oeufs'], label: 'بيض', preps: [
    { aliases: ['مسلوقين','مسلوقة','مسلوق','boiled','bouilli','bouillis'], label: 'مسلوق' },
    { aliases: ['مقليين','مقلية','مقلي','fried','frit','frits'], label: 'مقلي' },
    { aliases: ['أومليت','اومليت','omelette','omelet'], label: 'أومليت' },
  ] },
  { aliases: ['المسمن','مسمن','msemen','msemmen'], label: 'مسمن', additions: [
    { aliases: ['بالعسل','مع العسل','au miel','with honey'], label: 'بالعسل' },
    { aliases: ['بالجبن','مع الجبن','بالفرماج','مع الفرماج','au fromage','with cheese'], label: 'بالجبن' },
  ] },
  { aliases: ['أتاي','اتاي','atay'], label: 'أتاي', additions: [
    { aliases: ['بالنعناع','نعناع','à la menthe','mint'], label: 'بالنعناع' },
  ] },
  { aliases: ['شاي','tea','thé','the'], label: 'شاي', additions: [
    { aliases: ['بالنعناع','نعناع','à la menthe','mint'], label: 'بالنعناع' },
    { aliases: ['بالحليب','مع الحليب','au lait','with milk'], label: 'بالحليب' },
  ] },
  { aliases: ['قهوة','قهوا','coffee','café','cafe'], label: 'قهوة', additions: [
    { aliases: ['بالحليب','مع الحليب','au lait','with milk','milk coffee'], label: 'بالحليب' },
    { aliases: ['بلا سكر','بدون سكر','sans sucre','no sugar'], label: 'بلا سكر' },
  ] },
  { aliases: ['الخبز','خبز','خبزة','الخبزة','خبيزة','الخبيزة','khobz','khobza','khbeza','khbiza','bread','pain'], label: 'خبز', additions: [
    { aliases: ['بالجبن','مع الجبن','بالفرماج','مع الفرماج','فرماج','fromage','au fromage','with cheese','cheese'], label: 'بالجبن' },
    { aliases: ['بزيت الزيتون','مع زيت الزيتون','زيت الزيتون','huile d olive','olive oil'], label: 'بزيت الزيتون' },
  ] },
  { aliases: ['حريرة','الحريرة','harira'], label: 'حريرة' },
  { aliases: ['كسكس','كوسكوس','couscous'], label: 'كسكس' },
  { aliases: ['طاجين','تاجين','tajine','tagine'], label: 'طاجين' },
  { aliases: ['شوربة','شربة','soupe','soup'], label: 'شوربة' },
  { aliases: ['دجاج','فراخ','جاج','chicken','poulet'], label: 'دجاج', preps: [
    { aliases: ['مشوي','مشوية','grilled','grillé','grille'], label: 'مشوي' },
    { aliases: ['مقلي','fried','frit'], label: 'مقلي' },
  ] },
  { aliases: ['لحم','لحمة','meat','viande'], label: 'لحم', preps: [
    { aliases: ['مشوي','grilled','grillé','grille'], label: 'مشوي' },
  ] },
  { aliases: ['سمك','حوت','fish','poisson'], label: 'سمك', preps: [
    { aliases: ['مشوي','grilled','grillé','grille'], label: 'مشوي' },
    { aliases: ['مقلي','fried','frit'], label: 'مقلي' },
  ] },
  { aliases: ['رز','أرز','ارز','rice','riz'], label: 'أرز' },
  { aliases: ['سلطة','salad','salade'], label: 'سلطة' },
  { aliases: ['بطاطا','بطاطس','potato','potatoes','pomme de terre','pommes de terre'], label: 'بطاطا', preps: [
    { aliases: ['مقلية','مقلي','fries','frites','fried'], label: 'مقلية' },
    { aliases: ['مسلوقة','مسلوق','boiled'], label: 'مسلوقة' },
  ] },
  { aliases: ['ياغورت','يوغورت','زبادي','yaourt','yogurt'], label: 'ياغورت' },
  { aliases: ['حليب','milk','lait'], label: 'حليب' },
  { aliases: ['ماء','الماء','water','eau'], label: 'ماء' },
  { aliases: ['تمر','تمور','dates','dattes'], label: 'تمر' },
  { aliases: ['تفاح','تفاحة','apple','pomme'], label: 'تفاح' },
  { aliases: ['موز','موزة','banana','banane'], label: 'موز' },
  { aliases: ['برتقال','برتقالة','orange'], label: 'برتقال' },
  { aliases: ['جبن','جبنة','فرماج','fromage','cheese'], label: 'جبن' },
  { aliases: ['كرواسون','croissant'], label: 'كرواسون' },
  { aliases: ['ساندويتش','سندويتش','sandwich'], label: 'ساندويتش' },
  { aliases: ['بيتزا','pizza'], label: 'بيتزا' },
  { aliases: ['مكرونة','معكرونة','pasta','pâtes','pates'], label: 'مكرونة' },
  { aliases: ['عدس','lentils','lentilles'], label: 'عدس' },
  { aliases: ['حمص','chickpeas','pois chiches'], label: 'حمص' },
];

const QUANTITIES = [
  'واحد','واحدة','وحدة','جوج','زوج','اثنين','اتنين','ثنين','ثلاث','ثلاثة','ثلاثه','أربع','اربعة','خمسة',
  'نص','نصف','شوية','قليل','كثير','كاس','كأس','كوب','فنجان','حبة','حبتين','قطعة','قطعتين',
  'one','two','three','four','half','cup','cups','glass','glasses','piece','pieces',
  'un','une','deux','trois','quatre','demi','verre','tasse','pièce','piece','1','2','3','4','5'
];

const NEGATIONS = [
  'ما كليتش','ماكلتش','ما اكلتش','ما أكلتش','ما كلتش','ما شربتش','مش كلت','مش أكلت','مش اكلت','مش شربت',
  'لم آكل','لم اكل','لم أشرب','لم اشرب','ما أكلت','ما اكلت','ما شربت','مو آكل','مو اكل','مو شارب',
  "didn't eat","did not eat","didn't drink","did not drink",'not eating','not drinking',
  "je n'ai pas mangé","je n ai pas mange","je n'ai pas bu","je n ai pas bu",'pas mangé','pas mange','pas bu'
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
  return /^و[\u0600-\u06ff]+$/.test(word) && word.slice(1) === needle;
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

  let lastPositiveVerb = -1;
  for (let i = lastNegationEnd + 1; i < before.length; i += 1) {
    if (POSITIVE_CONSUMPTION_VERBS.some((verb) => tokenMatches(before[i], normalize(verb)))) lastPositiveVerb = i;
  }
  return lastPositiveVerb < 0;
}

function quantityFor(normalized: string, alias: string): string | null {
  const words = normalized.split(' ');
  const index = findAliasIndex(normalized, alias);
  if (index <= 0) return null;
  const immediate = words[index - 1];
  return QUANTITIES.some((q) => normalize(q) === immediate) ? immediate : null;
}

function detectMealCategory(normalized: string): string {
  const breakfast = ['فطور','الفطور','فطار','فطرت','اتفطرت','تفطرت','breakfast','petit déjeuner','petit dejeuner'];
  const lunch = ['غداء','الغداء','غدا','غديت','تغديت','اتغديت','تغديت','lunch','déjeuner','dejeuner'];
  const dinner = ['عشاء','العشاء','عشا','عشيت','تعشيت','اتعشيت','dinner','dîner','diner'];
  if (breakfast.some((v) => normalized.includes(normalize(v)))) return 'breakfast';
  if (lunch.some((v) => normalized.includes(normalize(v)))) return 'lunch';
  if (dinner.some((v) => normalized.includes(normalize(v)))) return 'dinner';
  if (['سناك','وجبة خفيفة','snack','goûter','gouter'].some((v) => normalized.includes(normalize(v)))) return 'snack';
  return '';
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
    const quantity = quantityFor(normalized, alias);
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
