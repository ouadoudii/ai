import type { MomentCategory } from '../types';

export type ArabFoodRegion='maghreb'|'egypt'|'levant'|'gulf'|'iraq'|'horn'|'other';

const REGION_BY_COUNTRY:Record<string,ArabFoodRegion>={
  MA:'maghreb',DZ:'maghreb',TN:'maghreb',LY:'maghreb',MR:'maghreb',
  EG:'egypt',
  JO:'levant',LB:'levant',PS:'levant',SY:'levant',
  SA:'gulf',AE:'gulf',QA:'gulf',KW:'gulf',BH:'gulf',OM:'gulf',YE:'gulf',
  IQ:'iraq',
  SO:'horn',DJ:'horn',KM:'horn',SD:'horn',
};

export function getArabFoodRegion(country:string|null|undefined):ArabFoodRegion{
  return country?REGION_BY_COUNTRY[country.toUpperCase()]||'other':'other';
}

export function normalizeArabicFoodText(value:string):string{
  return value
    .trim()
    .toLocaleLowerCase()
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g,'')
    .replace(/[أإآٱ]/g,'ا')
    .replace(/ى/g,'ي')
    .replace(/ؤ/g,'و')
    .replace(/ئ/g,'ي')
    .replace(/ة/g,'ه')
    .replace(/ـ/g,'')
    .replace(/[’'\-_/.,،؛:()[\]{}]/g,' ')
    .replace(/\s+/g,' ');
}

export function normalizeFoodSearchText(value:string):string{
  return normalizeArabicFoodText(value)
    .replace(/cous[ -]?cous/g,'couscous')
    .replace(/tajine/g,'tagine')
    .replace(/harirah/g,'harira');
}

type AliasGroup={canonicalEn:string;canonicalAr:string;aliases:string[];regions?:ArabFoodRegion[];category?:MomentCategory};

export const ARAB_FOOD_ALIASES:AliasGroup[]=[
  {canonicalEn:'Eggs',canonicalAr:'بيض',aliases:['بيض','البيض','egg','eggs'],category:'breakfast'},
  {canonicalEn:'Eggs with tomato',canonicalAr:'بيض ومطيشة',aliases:['بيض ومطيشة','البيض ومطيشة','بيض بالطماطم','بيض وطماطم','eggs with tomato','eggs and tomato'],regions:['maghreb'],category:'breakfast'},
  {canonicalEn:'Harcha',canonicalAr:'حرشة',aliases:['حرشة','الحرشة','harcha'],regions:['maghreb'],category:'breakfast'},
  {canonicalEn:'Bissara',canonicalAr:'بيصارة',aliases:['بيصارة','بصارة','البيصارة','bissara','bessara'],regions:['maghreb'],category:'breakfast'},
  {canonicalEn:'Khobz',canonicalAr:'خبز',aliases:['خبز','الخبز','khobz','bread'],regions:['maghreb'],category:'breakfast'},
  {canonicalEn:'Rfissa',canonicalAr:'رفيسة',aliases:['رفيسة','الرفيسة','rfissa','rfisa'],regions:['maghreb'],category:'lunch'},
  {canonicalEn:'Pastilla',canonicalAr:'بسطيلة',aliases:['بسطيلة','بستيلا','pastilla','bastilla'],regions:['maghreb'],category:'lunch'},
  {canonicalEn:'Kefta',canonicalAr:'كفتة',aliases:['كفتة','الكفتة','kefta','kofta'],regions:['maghreb'],category:'lunch'},
  {canonicalEn:'Grilled sardines',canonicalAr:'سردين مشوي',aliases:['سردين','السردين','سردين مشوي','grilled sardines','sardines'],regions:['maghreb'],category:'lunch'},
  {canonicalEn:'Zaalouk',canonicalAr:'زعلوك',aliases:['زعلوك','الزعلوك','zaalouk','zalouk'],regions:['maghreb'],category:'lunch'},
  {canonicalEn:'Taktouka',canonicalAr:'تكتوكة',aliases:['تكتوكة','التكتوكة','taktouka','taktuka'],regions:['maghreb'],category:'lunch'},
  {canonicalEn:'Chebakia',canonicalAr:'شباكية',aliases:['شباكية','الشباكية','chebakia','shebaakia'],regions:['maghreb'],category:'dessert'},
  {canonicalEn:'Sellou',canonicalAr:'سلو',aliases:['سلو','sellou','slilou'],regions:['maghreb'],category:'dessert'},
  {canonicalEn:'Sfenj',canonicalAr:'سفنج',aliases:['سفنج','السفنج','sfenj'],regions:['maghreb'],category:'dessert'},
  {canonicalEn:'Moroccan mint tea',canonicalAr:'أتاي بالنعناع',aliases:['اتاي','أتاي','اتاي بالنعناع','أتاي بالنعناع','شاي بالنعناع','moroccan mint tea','mint tea'],regions:['maghreb'],category:'coffee'},
  {canonicalEn:'Couscous',canonicalAr:'كسكس',aliases:['كسكس','كسكسي','كوسكوس','couscous','cous cous'],regions:['maghreb'],category:'lunch'},
  {canonicalEn:'Moroccan tagine',canonicalAr:'طاجين',aliases:['طاجين','تاجين','tajine','tagine'],regions:['maghreb'],category:'lunch'},
  {canonicalEn:'Harira',canonicalAr:'حريرة',aliases:['حريرة','الحريرة','harira'],regions:['maghreb'],category:'lunch'},
  {canonicalEn:'Msemen',canonicalAr:'مسمن',aliases:['مسمن','المسمن','msemen','rghaif','رغايف'],regions:['maghreb'],category:'breakfast'},
  {canonicalEn:'Baghrir',canonicalAr:'بغرير',aliases:['بغرير','baghrir','beghrir'],regions:['maghreb'],category:'breakfast'},
  {canonicalEn:'Ful medames',canonicalAr:'فول مدمس',aliases:['فول','فول مدمس','ful','foul','ful medames'],regions:['egypt','levant'],category:'breakfast'},
  {canonicalEn:'Koshari',canonicalAr:'كشري',aliases:['كشري','كوشري','koshari','koshary'],regions:['egypt'],category:'lunch'},
  {canonicalEn:'Molokhia',canonicalAr:'ملوخية',aliases:['ملوخية','ملوخيه','molokhia','molokhiyah'],regions:['egypt','levant'],category:'lunch'},
  {canonicalEn:'Fattah',canonicalAr:'فتة',aliases:['فتة','فته','fattah','fatta'],regions:['egypt','levant'],category:'lunch'},
  {canonicalEn:'Manakish',canonicalAr:'مناقيش',aliases:['مناقيش','مناقيش زعتر','manakish','manaeesh','manaqish'],regions:['levant'],category:'breakfast'},
  {canonicalEn:'Shawarma',canonicalAr:'شاورما',aliases:['شاورما','shawarma','shawerma'],regions:['levant','gulf'],category:'lunch'},
  {canonicalEn:'Fattoush',canonicalAr:'فتوش',aliases:['فتوش','fattoush','fattoosh'],regions:['levant'],category:'lunch'},
  {canonicalEn:'Musakhan',canonicalAr:'مسخن',aliases:['مسخن','musakhan'],regions:['levant'],category:'dinner'},
  {canonicalEn:'Mansaf',canonicalAr:'منسف',aliases:['منسف','mansaf'],regions:['levant'],category:'dinner'},
  {canonicalEn:'Kabsa',canonicalAr:'كبسة',aliases:['كبسة','كبسه','kabsa','kabsah'],regions:['gulf'],category:'lunch'},
  {canonicalEn:'Machboos',canonicalAr:'مجبوس',aliases:['مجبوس','مكبوس','machboos','majboos','makboos'],regions:['gulf'],category:'lunch'},
  {canonicalEn:'Harees',canonicalAr:'هريس',aliases:['هريس','harees','haris'],regions:['gulf'],category:'dinner'},
  {canonicalEn:'Jareesh',canonicalAr:'جريش',aliases:['جريش','jareesh'],regions:['gulf'],category:'dinner'},
  {canonicalEn:'Thareed',canonicalAr:'ثريد',aliases:['ثريد','ثريد','thareed','tharid'],regions:['gulf'],category:'dinner'},
  {canonicalEn:'Masgouf',canonicalAr:'مسكوف',aliases:['مسكوف','masgouf','masguf'],regions:['iraq'],category:'dinner'},
  {canonicalEn:'Dolma',canonicalAr:'دولمة',aliases:['دولمة','دولمه','dolma'],regions:['iraq'],category:'lunch'},
];

const aliasIndex=ARAB_FOOD_ALIASES.flatMap(group=>group.aliases.map(alias=>({key:normalizeFoodSearchText(alias),group})));

export function resolveArabFoodAlias(value:string,country?:string|null){
  const q=normalizeFoodSearchText(value);
  if(!q)return null;
  const region=getArabFoodRegion(country);
  const matches=aliasIndex.filter(({key})=>key===q);
  const scored=matches.map(match=>{
    const regional=!match.group.regions||match.group.regions.includes(region);
    const exact=match.key===q;
    return {...match,score:(regional?100000:0)+(exact?10000:0)+match.key.length};
  }).sort((a,b)=>b.score-a.score);
  return scored[0]?.group||null;
}

export function foodSearchMatches(candidate:string,query:string,country?:string|null):boolean{
  const c=normalizeFoodSearchText(candidate);
  const q=normalizeFoodSearchText(query);
  if(!q)return true;
  if(c.includes(q)||q.includes(c))return true;
  const qa=resolveArabFoodAlias(query,country);
  if(!qa)return false;
  return [qa.canonicalAr,qa.canonicalEn,...qa.aliases].some(alias=>{
    const a=normalizeFoodSearchText(alias);
    return c.includes(a)||a.includes(c);
  });
}

export function getRegionalFoodSeeds(country:string|null|undefined,category?:MomentCategory){
  const region=getArabFoodRegion(country);
  return ARAB_FOOD_ALIASES
    .filter(group=>(!group.regions||group.regions.includes(region))&&(!category||group.category===category))
    .map(group=>({name:group.canonicalEn,category:group.category||'lunch'} as {name:string;category:MomentCategory}));
}
