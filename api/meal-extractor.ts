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
    { aliases: ['بالجبن','مع الجبن','au fromage','with cheese'], label: 'بالجبن' },
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
  { aliases: ['الخبز','خبز','khobz','bread','pain'], label: 'خبز' },
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
  { aliases: ['جبن','جبنة','fromage','cheese'], label: 'جبن' },
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
  'un','une','deux','trois','quatre','demi','verre','tasse','pièce','piece',
  '1','2','3','4','5'
];

const NEGATIONS = [
  'ما كليتش','ماكلتش','ما اكلتش','ما أكلتش','ما كلتش','ما شربتش','مش كلت','مش أكلت','مش اكلت','مش شربت',
  'لم آكل','لم اكل','لم أشرب','لم اشرب','ما أكلت','ما اكلت','ما شربت','مو آكل','مو اكل','مو شارب',
  "didn't eat","did not eat","didn't drink","did not drink",'not eating','not drinking',
  "je n'ai pas mangé","je n ai pas mange","je n'ai pas bu","je n ai pas bu",'pas mangé','pas mange','pas bu'
];

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u064b-\u065f\u0670]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[،,.;:!?؟()\[\]{}"“”]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function includesAlias(normalized: string, alias: string): boolean {
  const needle = normalize(alias);
  if (!needle) return false;
  const padded = ` ${normalized} `;
  return padded.includes(` ${needle} `) || (needle.includes(' ') && normalized.includes(needle));
}

function contextAround(normalized: string, alias: string, radius = 7): string {
  const words = normalized.split(' ');
  const aliasWords = normalize(alias).split(' ');
  const first = aliasWords[0];
  const index = words.findIndex((w) => w === first);
  if (index < 0) return normalized;
  return words.slice(Math.max(0, index - radius), Math.min(words.length, index + aliasWords.length + radius)).join(' ');
}

function isNegated(normalized: string, alias: string): boolean {
  const words = normalized.split(' ');
  const first = normalize(alias).split(' ')[0];
  const index = words.findIndex((w) => w === first);
  if (index < 0) return false;
  const before = words.slice(Math.max(0, index - 5), index).join(' ');
  return NEGATIONS.some((negation) => before.includes(normalize(negation)));
}

function quantityFor(context: string, alias: string): string | null {
  const words = context.split(' ');
  const index = words.findIndex((w) => w === normalize(alias).split(' ')[0]);
  if (index < 0) return null;
  const before = words.slice(Math.max(0, index - 3), index);
  for (let i = before.length - 1; i >= 0; i -= 1) {
    const candidate = before[i];
    if (QUANTITIES.some((q) => normalize(q) === candidate)) return candidate;
  }
  return null;
}

function detectMealCategory(normalized: string): string {
  if (['فطور','الفطور','فطار','breakfast','petit déjeuner','petit dejeuner'].some((v) => normalized.includes(normalize(v)))) return 'breakfast';
  if (['غداء','الغداء','غدا','lunch','déjeuner','dejeuner'].some((v) => normalized.includes(normalize(v)))) return 'lunch';
  if (['عشاء','العشاء','عشا','dinner','dîner','diner'].some((v) => normalized.includes(normalize(v)))) return 'dinner';
  if (['سناك','وجبة خفيفة','snack','goûter','gouter'].some((v) => normalized.includes(normalize(v)))) return 'snack';
  return '';
}

export function extractMealItemsDeterministic(transcript: string): MealExtraction {
  const normalized = normalize(transcript || '');
  if (!normalized) return { mealDetected: false, mealTitle: '', mealItems: [], mealCategory: '', mealContext: '' };

  const items: string[] = [];
  for (const rule of FOOD_RULES) {
    const alias = rule.aliases.find((candidate) => includesAlias(normalized, candidate));
    if (!alias || isNegated(normalized, alias)) continue;

    const context = contextAround(normalized, alias);
    const prep = rule.preps?.find((p) => p.aliases.some((a) => includesAlias(context, a)))?.label;
    const addition = rule.additions?.find((p) => p.aliases.some((a) => includesAlias(context, a)))?.label;
    const quantity = quantityFor(context, alias);
    const item = [quantity, rule.label, prep, addition].filter(Boolean).join(' ');
    if (item && !items.includes(item)) items.push(item);
  }

  return {
    mealDetected: items.length > 0,
    mealTitle: items.join(' · '),
    mealItems: items,
    mealCategory: detectMealCategory(normalized),
    mealContext: items.length ? transcript.slice(0, 500) : '',
  };
}
